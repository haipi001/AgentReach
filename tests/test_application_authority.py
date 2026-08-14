import plistlib

from apps.api.applications import ApplicationAuthority


def test_application_authority_reads_bundle_metadata_without_granting_control(tmp_path):
    app = tmp_path / "Google Chrome.app" / "Contents"
    app.mkdir(parents=True)
    with (app / "Info.plist").open("wb") as handle:
        plistlib.dump({"CFBundleIdentifier": "com.google.Chrome", "CFBundleShortVersionString": "123.4"}, handle)

    snapshot = ApplicationAuthority((tmp_path,)).snapshot()
    chrome = next(item for item in snapshot["applications"] if item["id"] == "chrome")

    assert snapshot["read_only"] is True
    assert chrome["installed"] is True
    assert chrome["bundle_id"] == "com.google.Chrome"
    assert chrome["version"] == "123.4"
    assert chrome["status"] == "UNAUTHORIZED"
    assert chrome["authority"] == "NONE"
    assert not any(chrome["permissions"].values())
