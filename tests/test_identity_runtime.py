from apps.api.identity import LocalIdentityRuntime


def test_local_identities_isolate_tasks_memory_skills_and_connectors(tmp_path):
    runtime = LocalIdentityRuntime(tmp_path / "owner.db")
    original = runtime.snapshot()
    original_profile = original["identity_runtime"]["active_profile_id"]
    runtime.start_task("owner A private task")
    runtime.set_skill_enabled("claim-publishing", False)
    runtime.set_connector_enabled("agent-mailbox/v1", False)

    created = runtime.create_identity("Owner B", "NOVA")
    second_profile = created["active_profile_id"]
    assert second_profile != original_profile
    second = runtime.snapshot()
    assert second["human_request"] is None
    assert all(skill["enabled"] for skill in second["skills"])
    assert next(item for item in second["connector_runtime"]["connectors"] if item["id"] == "agent-mailbox/v1")["enabled"]

    runtime.start_task("owner B private task")
    runtime.switch_identity(original_profile)
    restored = runtime.snapshot()
    assert restored["human_request"] == "owner A private task"
    assert next(item for item in restored["skills"] if item["id"] == "claim-publishing")["enabled"] is False
    assert next(item for item in restored["connector_runtime"]["connectors"] if item["id"] == "agent-mailbox/v1")["enabled"] is False

    runtime.switch_identity(second_profile)
    assert runtime.snapshot()["human_request"] == "owner B private task"


def test_local_session_survives_runtime_restart(tmp_path):
    db_path = tmp_path / "owner.db"
    runtime = LocalIdentityRuntime(db_path)
    created = runtime.create_identity("Persistent Owner", "IRIS")
    profile_id = created["active_profile_id"]
    session_id = created["session_id"]
    runtime.start_task("persistent private task")

    restarted = LocalIdentityRuntime(db_path)
    identities = restarted.identities()
    assert identities["active_profile_id"] == profile_id
    assert identities["session_id"] == session_id
    assert restarted.snapshot()["human_request"] == "persistent private task"


def test_operational_metrics_are_isolated_per_owner(tmp_path):
    runtime = LocalIdentityRuntime(tmp_path / "metrics-owner.db")
    first_profile = runtime.identities()["active_profile_id"]
    runtime.start_task("owner one task")
    first_total = runtime.operational_metrics()["runs"]["total"]

    runtime.create_identity("Metrics Owner B", "ORBIT")
    second_metrics = runtime.operational_metrics()
    assert second_metrics["runs"]["total"] == 1
    assert second_metrics["workers"]["total"] == 0

    runtime.switch_identity(first_profile)
    assert runtime.operational_metrics()["runs"]["total"] == first_total
