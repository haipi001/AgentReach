from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app


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
