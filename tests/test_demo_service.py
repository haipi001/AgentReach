from __future__ import annotations

from pathlib import Path

import pytest

from apps.api.service import DemoError, DemoService


@pytest.fixture()
def service(tmp_path: Path) -> DemoService:
    return DemoService(tmp_path / "demo.db")


def advance_to_candidates(service: DemoService):
    service.structure_intent("帮我在 706 找 Personal Agent / Agent Identity 合作者")
    return service.discover()


def advance_to_peer(service: DemoService):
    state = advance_to_candidates(service)
    service.select_candidate(state["candidates"][0]["id"])
    return service.approve_introduction()


def test_golden_loop_completes_with_independent_verification(service: DemoService):
    state = advance_to_candidates(service)
    assert [item["display_name"] for item in state["candidates"]] == ["Alice", "Carol", "Bob"]
    assert state["candidates"][0]["score_percent"] > state["candidates"][1]["score_percent"]

    state = service.select_candidate("alice")
    assert state["stage"] == "WAITING_USER_APPROVAL"
    assert "私人关系备注" in state["removed_fields"]
    assert "private_relationship_graph" not in str(state["capsule"])

    state = service.approve_introduction()
    assert state["stage"] == "WAITING_PEER_APPROVAL"
    assert state["introduction"]["state"] == "pending"

    state = service.peer_decision(True)
    assert state["stage"] == "COMMITMENT_PROPOSED"
    assert state["commitment"]["status"] == "proposed"

    state = service.approve_and_verify_commitment()
    assert state["stage"] == "COMPLETED"
    assert state["verification"]["verdict"] == "VERIFIED"
    assert all(check["passed"] for check in state["verification"]["checks"])
    assert state["world_changed"] is True
    assert Path(state["evidence"][0]["path"]).exists()
    assert state["evidence"][1]["verified"] is True
    assert state["memory_updates"][0]["kind"] == "verified_experience"
    verifier_event = next(e for e in state["trace"] if e["event_type"] == "verification.completed")
    assert verifier_event["evidence"]["read_only"] is True
    assert state["trace"][-1]["event_type"] == "memory.experience_recorded"
    assert state["connector_runtime"] == {"receipts": 2, "mailbox_envelopes": 1, "idempotent": True}


def test_action_connectors_are_idempotent(service: DemoService):
    state = advance_to_candidates(service)
    service.select_candidate(state["candidates"][0]["id"])
    service.approve_introduction()
    service.peer_decision(True)
    completed = service.approve_and_verify_commitment()
    replayed = service._execute_world_actions(completed, completed["commitment"]["party_a_approval"])
    assert replayed == completed["action_results"]
    snapshot = service.snapshot()
    assert snapshot["connector_runtime"]["receipts"] == 2
    assert snapshot["connector_runtime"]["mailbox_envelopes"] == 1


def test_expired_claim_is_rejected_before_ranking(service: DemoService):
    state = advance_to_candidates(service)
    assert "David" not in [item["display_name"] for item in state["candidates"]]
    discovery_event = next(e for e in state["trace"] if e["event_type"] == "candidates.ranked")
    assert {"person": "david", "reason": "expired_claim"} in discovery_event["evidence"]["rejected"]


def test_privacy_attack_is_denied_without_derailing_golden_loop(service: DemoService):
    state = service.deny_privacy_request()
    assert state["stage"] == "CREATED"
    assert state["privacy_denials"][-1]["decision"] == "DENIED"
    assert state["trace"][-1]["event_type"] == "policy.denied"
    assert state["trace"][-1]["decision"] == "DENIED"


def test_peer_decline_creates_no_commitment(service: DemoService):
    advance_to_peer(service)
    state = service.peer_decision(False)
    assert state["stage"] == "PEER_REJECTED"
    assert state["commitment"] is None
    assert state["trace"][-1]["decision"] == "PEER_REJECTED"


def test_invalid_transition_fails_closed(service: DemoService):
    with pytest.raises(DemoError, match="不能执行"):
        service.discover()


def test_reset_removes_previous_trace_and_state(service: DemoService):
    service.structure_intent("find someone")
    previous_trace = service.snapshot()["trace_id"]
    state = service.reset()
    assert state["trace_id"] != previous_trace
    assert state["stage"] == "CREATED"
    assert len(state["trace"]) == 1
