import pytest

from apps.api.identity import LocalIdentityRuntime
from apps.api.service import DemoError


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


def test_owner_backup_round_trip_restores_into_new_isolated_identity(tmp_path):
    runtime = LocalIdentityRuntime(tmp_path / "portable-owner.db")
    original_profile = runtime.identities()["active_profile_id"]
    runtime.start_task("portable private task")
    runtime.set_skill_enabled("claim-publishing", False)

    backup = runtime.export_active_identity()
    assert backup["format"] == "agentreach-owner-backup/v1"
    assert backup["bytes"] > 0
    assert backup["encrypted"] is False

    restored_runtime = runtime.restore_identity(backup, "Recovered Owner")
    recovered_profile = restored_runtime["active_profile_id"]
    assert recovered_profile != original_profile
    recovered = runtime.snapshot()
    assert recovered["human_request"] == "portable private task"
    assert next(item for item in recovered["skills"] if item["id"] == "claim-publishing")["enabled"] is False

    runtime.start_task("recovered owner changed independently")
    runtime.switch_identity(original_profile)
    assert runtime.snapshot()["human_request"] == "portable private task"


def test_owner_backup_rejects_tampering_without_creating_profile(tmp_path):
    runtime = LocalIdentityRuntime(tmp_path / "tampered-owner.db")
    backup = runtime.export_active_identity()
    before = len(runtime.identities()["profiles"])
    backup["database_sha256"] = "0" * 64

    with pytest.raises(DemoError, match="完整性校验失败"):
        runtime.restore_identity(backup)

    assert len(runtime.identities()["profiles"]) == before


def test_identity_lifecycle_renames_and_deletes_only_inactive_managed_profile(tmp_path):
    runtime = LocalIdentityRuntime(tmp_path / "lifecycle-owner.db")
    primary = runtime.identities()["active_profile_id"]
    created = runtime.create_identity("Temporary Owner", "NOVA")
    temporary = created["active_profile_id"]

    renamed = runtime.rename_identity(temporary, "Project Owner", "ORBIT")
    profile = next(item for item in renamed["profiles"] if item["profile_id"] == temporary)
    assert (profile["display_name"], profile["agent_name"]) == ("Project Owner", "ORBIT")

    with pytest.raises(DemoError, match="不能删除当前身份"):
        runtime.delete_identity(temporary)

    runtime.switch_identity(primary)
    managed_path = tmp_path / "profiles" / f"{temporary}.db"
    assert managed_path.exists()
    remaining = runtime.delete_identity(temporary)
    assert all(item["profile_id"] != temporary for item in remaining["profiles"])
    assert not managed_path.exists()

    with pytest.raises(DemoError, match="主身份受保护"):
        runtime.delete_identity(primary)
