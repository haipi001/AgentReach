#!/usr/bin/env python3
"""Dependency-free validation of GOAI Agent Infra preliminary software evidence."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def load_json(path: str, errors: list[str]) -> dict:
    try:
        return json.loads((ROOT / path).read_text())
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"{path}: {exc}")
        return {}


def main() -> None:
    errors: list[str] = []
    agent_text = (ROOT / "agentteams/agents.yaml").read_text()
    require(agent_text.count("  - name:") >= 3, "at least three Agent identities are required", errors)
    for field in ("role:", "capabilities:", "inputs:", "outputs:", "decision_boundary:", "trace:"):
        require(agent_text.count(field) >= 3, f"Agent identities missing {field}", errors)

    mapping = load_json("agentteams/implementation-map.json", errors)
    workers = mapping.get("workers", [])
    require(mapping.get("framework_basis") == "AgentTeams", "AgentTeams framework basis missing", errors)
    require(len(workers) >= 5, "AgentTeams implementation map needs at least five workers", errors)
    service_text = (ROOT / "apps/api/service.py").read_text()
    for worker in workers:
        require(f"def {worker.get('entrypoint', '')}(" in service_text, f"worker entrypoint missing: {worker.get('entrypoint')}", errors)

    skill_dirs = sorted((ROOT / "skills").glob("*/skill.yaml"))
    require(len(skill_dirs) >= 1, "Skill is mandatory", errors)
    for skill in skill_dirs:
        text = skill.read_text()
        for field in ("name:", "version:", "output", "tools:", "side_effect:", "approval:", "failures:"):
            require(field in text, f"{skill.relative_to(ROOT)} missing {field}", errors)
        require((skill.parent / "SKILL.md").is_file(), f"{skill.parent.name} missing SKILL.md", errors)

    contracts = load_json("mcp_servers/tool-contracts.json", errors)
    for tool in contracts.get("tools", []):
        for field in ("name", "boundary", "auth", "input_schema", "output_schema", "side_effect", "retry", "idempotency", "audit", "degrade"):
            require(bool(tool.get(field)), f"tool contract {tool.get('name')} missing {field}", errors)

    nacos = load_json("agentteams/nacos-registry-export.json", errors)
    require(nacos.get("contains_private_data") is False, "Nacos export must exclude private data", errors)

    for path in ("README.md", "LICENSE", "docs/demo.md", "docs/submission/preliminary-summary-zh.md", "docs/submission/one-pager-zh.md"):
        require((ROOT / path).is_file(), f"submission artifact missing: {path}", errors)

    if not errors:
        result = subprocess.run([sys.executable, str(ROOT / "scripts/demo_cli.py")], cwd=ROOT, capture_output=True, text=True)
        require(result.returncode == 0, f"golden demo failed: {result.stderr.strip()}", errors)
        require('"verdict": "VERIFIED"' in result.stdout, "golden demo lacks VERIFIED evidence", errors)
        require('"decision": "DENIED"' in result.stdout, "golden demo lacks policy denied branch", errors)

    if errors:
        raise SystemExit("Preliminary validation failed:\n- " + "\n- ".join(errors))
    print(f"Preliminary validation passed: {agent_text.count('  - name:')} agents, {len(skill_dirs)} skills, {len(contracts['tools'])} tool contracts, AgentTeams map, Nacos-safe export, VERIFIED + DENIED demo evidence.")


if __name__ == "__main__":
    main()
