from apps.api.compute import ComputeAuthority


def test_compute_snapshot_is_read_only_and_has_real_resource_shape():
    snapshot = ComputeAuthority().snapshot()
    assert snapshot["read_only"] is True
    assert snapshot["hardware"]["cpu_logical_cores"] > 0
    assert snapshot["resources"]["memory_total_gb"] > 0
    assert snapshot["resources"]["disk_total_gb"] > 0
    assert snapshot["router"]["policy"] == "LOCAL_FIRST"
    assert snapshot["router"]["route"] in {"LOCAL", "CLOUD", "UNAVAILABLE"}
    serialized = str(snapshot)
    assert "API_KEY" not in serialized
    assert "sk-" not in serialized
