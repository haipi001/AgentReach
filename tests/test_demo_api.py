from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from apps.api import main as api_main
from apps.api.identity import LocalIdentityRuntime
from apps.api.service import DemoService

app = api_main.app


@pytest.fixture(autouse=True)
def isolated_api_runtime(tmp_path, monkeypatch):
    """HTTP tests must never mutate the developer's durable local runtime."""
    monkeypatch.setattr(api_main, "service", DemoService(tmp_path / "api.db"))


def test_http_golden_loop_and_page_assets():
    client = TestClient(app)
    assert client.get("/health").json()["status"] == "ok"
    root = client.get("/")
    assert root.status_code == 200
    assert root.json()["frontend"] == "http://127.0.0.1:3000"

    state = client.post("/api/runtime/start", json={"request": "帮我寻找 Agent Identity 合作者"}).json()
    assert state["candidates"][0]["id"] == "alice"
    state = client.post("/api/demo/select", json={"candidate_id": "alice"}).json()
    assert state["stage"] == "WAITING_USER_APPROVAL"
    state = client.post("/api/demo/approve-introduction").json()
    assert state["stage"] == "WAITING_PEER_APPROVAL"
    state = client.post("/api/demo/peer-decision", json={"accepted": True}).json()
    assert state["stage"] == "COMMITMENT_PROPOSED"
    state = client.post("/api/demo/approve-commitment").json()
    assert state["verification"]["verdict"] == "VERIFIED"
    assert state["worker_queue"]["succeeded"] == 7
    assert [job["agent_id"] for job in state["worker_queue"]["jobs"]] == [
        "intent-worker", "discovery-worker", "boundary-worker", "collaboration-worker",
        "collaboration-worker", "action-worker", "verifier-worker",
    ]


def test_http_invalid_transition_is_conflict():
    client = TestClient(app)
    client.post("/api/demo/reset")
    response = client.post("/api/demo/discover")
    assert response.status_code == 409
    assert "不能执行" in response.json()["detail"]


def test_memory_search_endpoint_returns_verified_records():
    client = TestClient(app)
    response = client.post("/api/memory/search", json={"query": ""})
    assert response.status_code == 200
    payload = response.json()
    assert "total" in payload
    assert all(item["verified"] for item in payload["items"])


def test_runtime_control_endpoints_preserve_and_retry_work():
    client = TestClient(app)
    client.post("/api/demo/reset")
    client.post("/api/demo/intent", json={"request": "find collaborator"})
    paused = client.post("/api/runtime/pause")
    assert paused.status_code == 200
    assert paused.json()["runtime"]["status"] == "PAUSED"
    assert client.post("/api/demo/discover").status_code == 409

    assert client.post("/api/runtime/resume").json()["runtime"]["status"] == "RUNNING"
    client.post("/api/demo/discover")
    cancelled = client.post("/api/runtime/cancel").json()
    assert cancelled["runtime"]["status"] == "CANCELLED"
    retried = client.post("/api/runtime/retry").json()
    assert retried["stage"] == "CANDIDATES_FOUND"
    assert retried["runtime"]["attempt"] == 2
    runs = client.get("/api/runtime/runs").json()
    assert runs["total"] >= 2


def test_connector_control_endpoints_are_persistent():
    client = TestClient(app)
    client.post("/api/demo/reset")
    checked = client.post("/api/connectors/check", json={"connector_id": "agent-mailbox/v1"})
    assert checked.status_code == 200
    connector = next(item for item in checked.json()["connector_runtime"]["connectors"] if item["id"] == "agent-mailbox/v1")
    assert connector["status"] == "HEALTHY"

    disabled = client.post("/api/connectors/toggle", json={"connector_id": "agent-mailbox/v1", "enabled": False})
    connector = next(item for item in disabled.json()["connector_runtime"]["connectors"] if item["id"] == "agent-mailbox/v1")
    assert connector["enabled"] is False
    enabled = client.post("/api/connectors/toggle", json={"connector_id": "agent-mailbox/v1", "enabled": True})
    connector = next(item for item in enabled.json()["connector_runtime"]["connectors"] if item["id"] == "agent-mailbox/v1")
    assert connector["enabled"] is True


def test_skill_loadout_toggle_endpoint():
    client = TestClient(app)
    disabled = client.post("/api/skills/toggle", json={"skill_id": "candidate-discovery", "enabled": False})
    assert disabled.status_code == 200
    skill = next(item for item in disabled.json()["skills"] if item["id"] == "candidate-discovery")
    assert skill["status"] == "DISABLED"
    enabled = client.post("/api/skills/toggle", json={"skill_id": "candidate-discovery", "enabled": True})
    assert next(item for item in enabled.json()["skills"] if item["id"] == "candidate-discovery")["enabled"] is True


def test_runtime_start_uses_durable_worker_queue():
    client = TestClient(app)
    response = client.post("/api/runtime/start", json={"request": "find queued peers"})
    assert response.status_code == 200
    state = response.json()
    assert state["stage"] == "CANDIDATES_FOUND"
    assert state["worker_queue"]["succeeded"] == 2
    assert {job["agent_id"] for job in state["worker_queue"]["jobs"]} == {"intent-worker", "discovery-worker"}


def test_runtime_switch_endpoint_restores_an_isolated_workspace():
    client = TestClient(app)
    first = client.post("/api/runtime/start", json={"request": "first isolated task"}).json()
    first_run = first["runtime"]["run_id"]
    client.post("/api/demo/select", json={"candidate_id": "alice"})
    second = client.post("/api/runtime/start", json={"request": "second isolated task"}).json()
    second_run = second["runtime"]["run_id"]

    restored = client.post("/api/runtime/switch", json={"run_id": first_run})
    assert restored.status_code == 200
    assert restored.json()["stage"] == "WAITING_USER_APPROVAL"
    assert restored.json()["selected_candidate"]["id"] == "alice"
    assert restored.json()["runtime"]["run_id"] == first_run
    assert next(run for run in restored.json()["runtime"]["history"] if run["run_id"] == second_run)["status"] == "PAUSED"

    missing = client.post("/api/runtime/switch", json={"run_id": "run-missing"})
    assert missing.status_code == 409


def test_notification_inbox_http_lifecycle():
    client = TestClient(app)
    state = client.post("/api/runtime/start", json={"request": "notification test"}).json()
    client.post("/api/demo/select", json={"candidate_id": state["candidates"][0]["id"]})
    inbox = client.get("/api/notifications").json()
    assert inbox["unread"] == 1
    notification_id = inbox["items"][0]["notification_id"]
    assert client.post("/api/notifications/read", json={"notification_id": notification_id}).json()["unread"] == 0
    assert client.post("/api/notifications/archive", json={"notification_id": notification_id}).json()["total"] == 0


def test_identity_http_switches_to_isolated_workspace(tmp_path, monkeypatch):
    monkeypatch.setattr(api_main, "service", LocalIdentityRuntime(tmp_path / "identity-api.db"))
    client = TestClient(app)
    first = client.post("/api/runtime/start", json={"request": "first owner task"}).json()
    first_profile = first["identity_runtime"]["active_profile_id"]

    created = client.post("/api/identities", json={"display_name": "Second Owner", "agent_name": "NOVA"})
    assert created.status_code == 200
    second_profile = created.json()["active_profile_id"]
    assert second_profile != first_profile
    assert client.get("/api/demo").json()["human_request"] is None
    client.post("/api/runtime/start", json={"request": "second owner task"})

    restored = client.post("/api/identities/switch", json={"profile_id": first_profile})
    assert restored.status_code == 200
    assert restored.json()["human_request"] == "first owner task"
    assert restored.json()["identity_runtime"]["active_profile_id"] == first_profile


def test_identity_backup_http_exports_and_restores_active_owner(tmp_path, monkeypatch):
    monkeypatch.setattr(api_main, "service", LocalIdentityRuntime(tmp_path / "identity-backup-api.db"))
    client = TestClient(app)
    client.post("/api/runtime/start", json={"request": "portable API task"})

    exported = client.get("/api/identities/export")
    assert exported.status_code == 200
    backup = exported.json()
    assert backup["format"] == "agentreach-owner-backup/v1"

    restored = client.post("/api/identities/restore", json={"backup": backup, "display_name": "Recovered API Owner"})
    assert restored.status_code == 200
    payload = restored.json()
    assert payload["human_request"] == "portable API task"
    assert next(profile for profile in payload["identity_runtime"]["profiles"] if profile["active"])["display_name"] == "Recovered API Owner"


def test_outbox_retry_endpoint_rejects_unknown_action():
    client = TestClient(app)
    response = client.post("/api/runtime/outbox/retry", json={"outbox_id": "out-missing"})
    assert response.status_code == 409


def test_operational_metrics_endpoint_reads_durable_runtime():
    client = TestClient(app)
    payload = client.get("/api/runtime/metrics")
    assert payload.status_code == 200
    assert payload.json()["health"] in {"HEALTHY", "ATTENTION", "CRITICAL"}
    assert set(payload.json()["runs"]) >= {"total", "completed", "success_rate"}
