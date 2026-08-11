from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from apps.api import main as api_main
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

    state = client.post("/api/demo/reset").json()
    assert state["stage"] == "CREATED"
    state = client.post("/api/demo/intent", json={"request": "帮我寻找 Agent Identity 合作者"}).json()
    assert state["stage"] == "INTENT_PARSED"
    state = client.post("/api/demo/discover").json()
    assert state["candidates"][0]["id"] == "alice"
    state = client.post("/api/demo/select", json={"candidate_id": "alice"}).json()
    assert state["stage"] == "WAITING_USER_APPROVAL"
    state = client.post("/api/demo/approve-introduction").json()
    assert state["stage"] == "WAITING_PEER_APPROVAL"
    state = client.post("/api/demo/peer-decision", json={"accepted": True}).json()
    assert state["stage"] == "COMMITMENT_PROPOSED"
    state = client.post("/api/demo/approve-commitment").json()
    assert state["verification"]["verdict"] == "VERIFIED"


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
