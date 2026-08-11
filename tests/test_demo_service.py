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
    assert state["connector_runtime"]["receipts"] == 2
    assert state["connector_runtime"]["mailbox_envelopes"] == 1
    assert state["connector_runtime"]["idempotent"] is True
    assert state["connector_runtime"]["recoverable"] is True
    assert [item["status"] for item in state["connector_runtime"]["outbox"]] == ["SUCCEEDED", "SUCCEEDED"]
    assert {connector["status"] for connector in state["connector_runtime"]["connectors"]} == {"HEALTHY", "UNKNOWN"}
    assert len(state["connector_runtime"]["connectors"]) == 3
    assert len(state["agents"]) == 7
    assert len(state["skills"]) == 6


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


def test_verified_memory_survives_task_reset_and_can_be_forgotten(service: DemoService):
    state = advance_to_candidates(service)
    service.select_candidate(state["candidates"][0]["id"])
    service.approve_introduction()
    service.peer_decision(True)
    completed = service.approve_and_verify_commitment()
    memory_id = completed["memory_updates"][0]["memory_id"]

    reset_state = service.reset()
    assert reset_state["memory_runtime"]["records"] == 1
    assert reset_state["memory_runtime"]["survives_task_reset"] is True
    results = service.search_memories("AgentReach")
    assert results["total"] == 1
    assert results["items"][0]["memory_id"] == memory_id
    assert results["items"][0]["verified"] is True

    forgotten = service.forget_memory(memory_id)
    assert forgotten["total"] == 0
    assert service.snapshot()["trace"][-1]["event_type"] == "memory.forgotten"


def test_durable_run_can_pause_resume_cancel_and_retry(service: DemoService):
    service.structure_intent("find a durable collaborator")
    paused = service.pause_run()
    assert paused["runtime"]["status"] == "PAUSED"
    assert paused["runtime"]["controls"]["can_resume"] is True
    with pytest.raises(DemoError, match="PAUSED"):
        service.discover()

    resumed = service.resume_run()
    assert resumed["stage"] == "INTENT_PARSED"
    discovered = service.discover()
    first_run = discovered["runtime"]["run_id"]
    cancelled = service.cancel_run()
    assert cancelled["runtime"]["status"] == "CANCELLED"
    assert cancelled["runtime"]["controls"]["can_retry"] is True

    retried = service.retry_run()
    assert retried["stage"] == "CANDIDATES_FOUND"
    assert retried["runtime"]["attempt"] == 2
    assert retried["runtime"]["run_id"] != first_run
    assert retried["worker_queue"]["succeeded"] == 2
    assert [job["skill"] for job in retried["worker_queue"]["jobs"]] == ["intent-structuring", "candidate-discovery"]
    assert any(run["run_id"] == first_run and run["status"] == "CANCELLED" for run in retried["runtime"]["history"])


def test_multi_task_workspaces_switch_with_isolated_state(service: DemoService):
    first = service.start_task("寻找第一位身份协议合作者")
    first_run = first["runtime"]["run_id"]
    first = service.select_candidate_queued("alice")
    assert first["stage"] == "WAITING_USER_APPROVAL"

    second = service.start_task("寻找第二位隐私工程合作者")
    second_run = second["runtime"]["run_id"]
    assert second_run != first_run
    assert second["human_request"] == "寻找第二位隐私工程合作者"
    assert second["selected_candidate"] is None
    first_history = next(run for run in second["runtime"]["history"] if run["run_id"] == first_run)
    assert first_history["status"] == "PAUSED"
    assert first_history["recoverable"] is True

    restored_first = service.switch_run(first_run)
    assert restored_first["runtime"]["run_id"] == first_run
    assert restored_first["runtime"]["status"] == "RUNNING"
    assert restored_first["stage"] == "WAITING_USER_APPROVAL"
    assert restored_first["human_request"] == "寻找第一位身份协议合作者"
    assert restored_first["selected_candidate"]["id"] == "alice"
    second_history = next(run for run in restored_first["runtime"]["history"] if run["run_id"] == second_run)
    assert second_history["status"] == "PAUSED"

    restored_second = service.switch_run(second_run)
    assert restored_second["runtime"]["run_id"] == second_run
    assert restored_second["stage"] == "CANDIDATES_FOUND"
    assert restored_second["selected_candidate"] is None
    assert restored_second["human_request"] == "寻找第二位隐私工程合作者"


def test_completed_workspace_can_be_inspected_without_reexecution(service: DemoService):
    first = service.start_task("完成并保留证据")
    service.select_candidate_queued(first["candidates"][0]["id"])
    service.approve_introduction_queued()
    service.peer_decision_queued(True)
    completed = service.approve_commitment_queued()
    completed_run = completed["runtime"]["run_id"]
    receipt_count = completed["connector_runtime"]["receipts"]
    evidence = completed["evidence"]

    active = service.start_task("另一个活动任务")
    active_run = active["runtime"]["run_id"]
    inspected = service.switch_run(completed_run)
    assert inspected["runtime"]["status"] == "COMPLETED"
    assert inspected["evidence"] == evidence
    assert inspected["connector_runtime"]["receipts"] == receipt_count

    resumed = service.switch_run(active_run)
    assert resumed["runtime"]["status"] == "RUNNING"
    assert resumed["human_request"] == "另一个活动任务"


def test_workspace_snapshots_survive_service_restart(tmp_path: Path):
    db_path = tmp_path / "multi-task.db"
    first_service = DemoService(db_path)
    first = first_service.start_task("重启前任务")
    first_run = first["runtime"]["run_id"]
    first_service.select_candidate_queued("carol")
    second = first_service.start_task("重启后的当前任务")
    second_run = second["runtime"]["run_id"]

    recovered_service = DemoService(db_path)
    restored = recovered_service.switch_run(first_run)
    assert restored["selected_candidate"]["id"] == "carol"
    assert restored["stage"] == "WAITING_USER_APPROVAL"
    assert restored["runtime"]["status"] == "RUNNING"
    assert next(run for run in restored["runtime"]["history"] if run["run_id"] == second_run)["status"] == "PAUSED"


def test_paused_run_survives_service_restart(tmp_path: Path):
    db_path = tmp_path / "durable.db"
    first = DemoService(db_path)
    first.structure_intent("persist this run")
    paused = first.pause_run()

    recovered = DemoService(db_path).snapshot()
    assert recovered["runtime"]["run_id"] == paused["runtime"]["run_id"]
    assert recovered["runtime"]["status"] == "PAUSED"
    assert recovered["stage"] == "INTENT_PARSED"


def test_connector_registry_health_toggle_and_revocation_gate(service: DemoService):
    checked = service.check_connector("github-local-sandbox/v1")
    local = next(item for item in checked["connector_runtime"]["connectors"] if item["id"] == "github-local-sandbox/v1")
    assert local["status"] == "HEALTHY"
    assert local["details"]["writable"] is True

    state = advance_to_candidates(service)
    service.select_candidate(state["candidates"][0]["id"])
    service.approve_introduction()
    service.peer_decision(True)
    revoked = service.revoke_connector_grant("github-local-sandbox/v1")
    grant = next(item for item in revoked["connector_grants"] if item["connector"] == "github-local-sandbox/v1")
    assert grant["status"] == "REVOKED"
    with pytest.raises(DemoError, match="授权已撤销"):
        service.approve_and_verify_commitment()

    disabled = service.set_connector_enabled("agent-mailbox/v1", False)
    mailbox = next(item for item in disabled["connector_runtime"]["connectors"] if item["id"] == "agent-mailbox/v1")
    assert mailbox["status"] == "DISABLED"


def test_worker_queue_drives_task_start_with_persistent_job_history(service: DemoService):
    state = service.start_task("find a queued collaborator")
    assert state["stage"] == "CANDIDATES_FOUND"
    assert state["worker_queue"]["durable"] is True
    assert state["worker_queue"]["claim_mode"] == "SQLITE_IMMEDIATE"
    assert state["worker_queue"]["succeeded"] == 2
    assert [job["skill"] for job in state["worker_queue"]["jobs"]] == ["intent-structuring", "candidate-discovery"]
    assert all(job["attempt"] == 1 for job in state["worker_queue"]["jobs"])
    assert sum(1 for event in state["trace"] if event["event_type"] == "job.succeeded") == 2


def test_skill_loadout_persists_and_gates_worker_execution(tmp_path: Path):
    db_path = tmp_path / "skill-loadout.db"
    service = DemoService(db_path)
    disabled = service.set_skill_enabled("candidate-discovery", False)
    skill = next(item for item in disabled["skills"] if item["id"] == "candidate-discovery")
    assert skill["enabled"] is False
    assert skill["status"] == "DISABLED"

    service.enqueue_job("intent-worker", "intent-structuring", {"request": "blocked discovery"})
    service.process_next_job()
    with pytest.raises(DemoError, match="AI Loadout 停用"):
        service.enqueue_job("discovery-worker", "candidate-discovery")

    recovered = DemoService(db_path).snapshot()
    recovered_skill = next(item for item in recovered["skills"] if item["id"] == "candidate-discovery")
    assert recovered_skill["enabled"] is False
    enabled = DemoService(db_path).set_skill_enabled("candidate-discovery", True)
    assert next(item for item in enabled["skills"] if item["id"] == "candidate-discovery")["status"] == "READY"


def test_active_skill_cannot_be_disabled(service: DemoService):
    service.enqueue_job("intent-worker", "intent-structuring", {"request": "still pending"})
    with pytest.raises(DemoError, match="正在被 Worker 使用"):
        service.set_skill_enabled("intent-structuring", False)


def test_failed_worker_job_can_be_requeued_and_retried(service: DemoService):
    queued = service.enqueue_job("discovery-worker", "candidate-discovery")
    job_id = queued["worker_queue"]["jobs"][0]["job_id"]
    failed = service.process_next_job()
    assert failed["worker_queue"]["failed"] == 1
    assert failed["worker_queue"]["jobs"][0]["attempt"] == 1

    service.structure_intent("now discovery is valid")
    pending = service.retry_job(job_id)
    assert pending["worker_queue"]["pending"] == 1
    succeeded = service.process_next_job()
    assert succeeded["stage"] == "CANDIDATES_FOUND"
    assert succeeded["worker_queue"]["jobs"][0]["status"] == "SUCCEEDED"
    assert succeeded["worker_queue"]["jobs"][0]["attempt"] == 2


def test_interrupted_worker_job_is_recovered_after_restart(tmp_path: Path):
    db_path = tmp_path / "queue.db"
    first = DemoService(db_path)
    queued = first.enqueue_job("intent-worker", "intent-structuring", {"request": "recover me"})
    job_id = queued["worker_queue"]["jobs"][0]["job_id"]
    with first._connect() as conn:
        conn.execute("UPDATE worker_jobs SET status = 'RUNNING' WHERE job_id = ?", (job_id,))

    recovered = DemoService(db_path).snapshot()
    assert recovered["worker_queue"]["pending"] == 1
    assert recovered["worker_queue"]["jobs"][0]["error"] == "recovered_after_restart"


def test_action_and_verification_are_separate_fail_closed_stages(service: DemoService):
    state = advance_to_candidates(service)
    service.select_candidate(state["candidates"][0]["id"])
    service.approve_introduction()
    service.peer_decision(True)

    approved = service.approve_commitment()
    assert approved["stage"] == "WAITING_ACTION_EXECUTION"
    assert approved["action_results"] == []
    assert approved["verification"] is None

    acted = service.execute_approved_actions()
    assert acted["stage"] == "WAITING_VERIFICATION"
    assert acted["world_changed"] is True
    assert acted["verification"] is None
    assert all(grant["status"] == "USED" for grant in acted["connector_grants"])

    verified = service.verify_world_actions()
    assert verified["stage"] == "COMPLETED"
    assert verified["verification"]["verdict"] == "VERIFIED"
    assert verified["memory_updates"]


def test_failed_outbox_action_can_be_safely_replayed(service: DemoService, monkeypatch):
    state = advance_to_candidates(service)
    service.select_candidate(state["candidates"][0]["id"])
    service.approve_introduction()
    service.peer_decision(True)
    service.approve_commitment()

    original = service._perform_outbox_action
    failed_once = {"value": False}

    def flaky(state, row, approval_id):
        if row["action_id"] == "send-collaboration-request" and not failed_once["value"]:
            failed_once["value"] = True
            raise DemoError("simulated mailbox outage")
        return original(state, row, approval_id)

    monkeypatch.setattr(service, "_perform_outbox_action", flaky)
    with pytest.raises(DemoError, match="可在 Connector Outbox 中重试"):
        service.execute_approved_actions()
    failed = service.snapshot()
    assert failed["stage"] == "WAITING_ACTION_EXECUTION"
    assert [item["status"] for item in failed["connector_runtime"]["outbox"]] == ["SUCCEEDED", "FAILED"]
    assert failed["connector_runtime"]["receipts"] == 1

    monkeypatch.setattr(service, "_perform_outbox_action", original)
    failed_item = next(item for item in failed["connector_runtime"]["outbox"] if item["status"] == "FAILED")
    recovered = service.retry_outbox_action(failed_item["outbox_id"])
    assert recovered["stage"] == "COMPLETED"
    assert recovered["verification"]["verdict"] == "VERIFIED"
    assert [item["status"] for item in recovered["connector_runtime"]["outbox"]] == ["SUCCEEDED", "SUCCEEDED"]
    assert [item["attempt"] for item in recovered["connector_runtime"]["outbox"]] == [1, 2]
    assert recovered["connector_runtime"]["receipts"] == 2
    assert recovered["connector_runtime"]["mailbox_envelopes"] == 1


def test_interrupted_outbox_action_is_recovered_after_restart(tmp_path: Path):
    db_path = tmp_path / "outbox.db"
    first = DemoService(db_path)
    state = advance_to_candidates(first)
    first.select_candidate(state["candidates"][0]["id"])
    first.approve_introduction()
    first.peer_decision(True)
    approved = first.approve_commitment()
    first._ensure_action_outbox(approved, approved["commitment"]["party_a_approval"])
    with first._connect() as conn:
        conn.execute("UPDATE action_outbox SET status = 'RUNNING' WHERE action_id = 'update-repository'")

    recovered = DemoService(db_path).snapshot()
    item = next(item for item in recovered["connector_runtime"]["outbox"] if item["action_id"] == "update-repository")
    assert item["status"] == "PENDING"
    assert item["error"] == "recovered_after_restart"


def test_operational_metrics_aggregate_runs_queues_actions_and_incidents(service: DemoService):
    state = advance_to_candidates(service)
    service.select_candidate(state["candidates"][0]["id"])
    service.approve_introduction()
    service.peer_decision(True)
    service.approve_and_verify_commitment()

    healthy = service.operational_metrics()
    assert healthy["health"] == "HEALTHY"
    assert healthy["runs"]["completed"] == 1
    assert healthy["runs"]["success_rate"] == 100.0
    assert healthy["actions"] == {"total": 2, "pending": 0, "running": 0, "failed": 0, "succeeded": 2, "receipts": 2}
    assert healthy["connectors"]["degraded"] == 0

    service.reset()
    service.enqueue_job("discovery-worker", "candidate-discovery")
    service.process_next_job()
    attention = service.operational_metrics()
    assert attention["health"] == "ATTENTION"
    assert attention["workers"]["failed"] == 1
    assert attention["incidents"][0]["source"] == "WORKER"
    assert attention["incidents"][0]["operation"] == "candidate-discovery"


def test_persistent_notification_inbox_tracks_approval_and_result_lifecycle(service: DemoService):
    state = service.start_task("notify me through the loop")
    service.select_candidate_queued(state["candidates"][0]["id"])
    service.approve_introduction_queued()
    service.peer_decision_queued(True)
    completed = service.approve_commitment_queued()
    assert completed["stage"] == "COMPLETED"

    inbox = service.list_notifications()
    assert inbox["unread"] == 4
    assert [item["kind"] for item in inbox["items"]] == ["RESULT", "APPROVAL", "WAITING", "APPROVAL"]
    assert inbox["items"][0]["action"] == "connected"
    assert all(item["run_id"] == completed["runtime"]["run_id"] for item in inbox["items"])

    first_id = inbox["items"][0]["notification_id"]
    assert service.read_notification(first_id)["unread"] == 3
    assert service.read_all_notifications()["unread"] == 0
    assert service.archive_notification(first_id)["total"] == 3
    reset = service.reset()
    assert reset["notification_runtime"]["total"] == 3
