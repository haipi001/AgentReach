from pathlib import Path

import pytest

from apps.api.service import DemoError, DemoService


def test_routine_learning_uses_durable_runs_and_persists_safe_policy(tmp_path: Path):
    service = DemoService(tmp_path / "routine.db")
    initial = service.routine_learning()["routines"][0]
    assert initial["observations"] == 0
    assert initial["state"] == "OBSERVING"
    assert initial["auto_execute_allowed"] is False

    service.structure_intent("寻找协作者")
    observed = service.routine_learning()["routines"][0]
    assert observed["observations"] == 1
    assert observed["confidence"] > initial["confidence"]

    updated = service.set_routine_policy(observed["routine_id"], "LEARN")["routines"][0]
    assert updated["policy"] == "LEARN"
    assert DemoService(tmp_path / "routine.db").routine_learning()["routines"][0]["policy"] == "LEARN"

    with pytest.raises(DemoError, match="不允许自动执行"):
        service.set_routine_policy(observed["routine_id"], "AUTO_EXECUTE")
