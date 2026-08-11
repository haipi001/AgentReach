#!/usr/bin/env python3
"""Dependency-free structural validation for the AgentReach Day 0 artifact."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SCHEMAS = {
    "intent": "agentreach.intent/v1",
    "claim": "agentreach.claim/v1",
    "capsule": "agentreach.context-capsule/v1",
    "introduction": "agentreach.introduction/v1",
    "commitment": "agentreach.commitment/v1",
    "avatar-profile": "agentreach.avatar-profile/v1",
}
SKILLS = {
    "intent-structuring",
    "candidate-discovery",
    "context-capsule",
    "claim-publishing",
    "introduction-handshake",
    "commitment-verification",
}


def main() -> None:
    errors: list[str] = []
    for folder, schema_name in SCHEMAS.items():
        path = ROOT / "protocol" / folder / "schema.json"
        try:
            schema = json.loads(path.read_text())
            if schema.get("properties", {}).get("schema", {}).get("const") != schema_name:
                errors.append(f"{path}: protocol discriminator mismatch")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{path}: {exc}")

    fixture_path = ROOT / "fixtures" / "demo-network.json"
    fixture = json.loads(fixture_path.read_text())
    people = fixture.get("people", [])
    if {p.get("display_name") for p in people} != {"Haipi", "Alice", "Bob", "Carol", "David"}:
        errors.append("demo fixture must contain exactly the five frozen identities")
    if any("private" in key for p in people for key in p):
        errors.append("shared person records must not contain private fields")
    if not all(r.get("owner_id") for r in fixture.get("private_relationships", [])):
        errors.append("every relationship must be directional and owner-scoped")

    agent_file = (ROOT / "agentteams" / "agents.yaml").read_text()
    if agent_file.count("  - name:") != 6:
        errors.append("agentteams/agents.yaml must define six identities")

    found_skills = {p.parent.name for p in (ROOT / "skills").glob("*/SKILL.md")}
    if found_skills != SKILLS:
        errors.append(f"skill set mismatch: expected {sorted(SKILLS)}, found {sorted(found_skills)}")

    if errors:
        raise SystemExit("Day 0 validation failed:\n- " + "\n- ".join(errors))
    print(f"Day 0 validation passed: {len(SCHEMAS)} schemas, 6 agents, 6 skills, 5 demo identities.")


if __name__ == "__main__":
    main()
