from pathlib import Path

from apps.api.files_devices import FileDeviceAuthority


def test_file_device_authority_is_bounded_and_deny_by_default(tmp_path: Path):
    (tmp_path / "visible.txt").write_text("evidence", encoding="utf-8")
    (tmp_path / ".secret").write_text("hidden", encoding="utf-8")
    snapshot = FileDeviceAuthority(tmp_path).snapshot([{"type": "file", "label": "Test", "verified": True, "path": str(tmp_path / "visible.txt")}])
    assert snapshot["read_only"] is True
    assert snapshot["policy"] == "DENY_BY_DEFAULT"
    assert any(item["name"] == "visible.txt" for item in snapshot["recent_files"])
    assert all(item["name"] != ".secret" for item in snapshot["recent_files"])
    assert all(not scope["read"] and not scope["write"] for scope in snapshot["scopes"] if scope["sensitive"])
    assert snapshot["evidence_artifacts"][0]["exists"] is True
    assert snapshot["devices"][0]["kind"] == "MAC"
