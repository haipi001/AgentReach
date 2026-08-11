#!/usr/bin/env python3
"""Run the complete AgentReach golden loop and print compact evidence."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.api.service import DemoService  # noqa: E402


def main() -> None:
    service = DemoService(ROOT / "data" / "agentreach-cli-demo.db")
    service.reset()
    service.structure_intent("帮我在 706 找 Personal Agent / Agent Identity 合作者")
    state = service.discover()
    service.select_candidate(state["candidates"][0]["id"])
    service.deny_privacy_request()
    service.approve_introduction()
    service.peer_decision(True)
    state = service.approve_and_verify_commitment()
    evidence = {
        "stage": state["stage"],
        "selected_candidate": state["selected_candidate"]["display_name"],
        "privacy_attack": state["privacy_denials"][-1],
        "verdict": state["verification"]["verdict"],
        "checks": state["verification"]["checks"],
        "trace_id": state["trace_id"],
        "trace_events": len(state["trace"]),
    }
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    if evidence["verdict"] != "VERIFIED":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
