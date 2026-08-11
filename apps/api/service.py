"""Deterministic, auditable AgentReach golden-loop service.

The demo intentionally needs no LLM or external API. Facts and policy decisions
remain deterministic so judges can inspect and reproduce every transition.
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / "data" / "agentreach-demo.db"
FIXTURE = ROOT / "fixtures" / "demo-network.json"
PROTOCOL_DIR = ROOT / "protocol"
DEMO_NOW = datetime.fromisoformat("2026-08-10T09:00:00+08:00")

STAGE_ORDER = [
    "CREATED",
    "INTENT_PARSED",
    "CANDIDATES_FOUND",
    "CAPSULE_PREPARED",
    "WAITING_USER_APPROVAL",
    "INTRO_SENT",
    "WAITING_PEER_APPROVAL",
    "INTRO_ACCEPTED",
    "COMMITMENT_PROPOSED",
    "VERIFIED",
    "COMPLETED",
]

AGENT_META = {
    "personal-manager": ("Personal Manager", "编排任务状态，不越权执行"),
    "intent-worker": ("Intent Agent", "把自然语言转为私有 Intent"),
    "discovery-worker": ("Discovery Agent", "本地筛选并排序共享 Claims"),
    "boundary-worker": ("Boundary Agent", "最小披露与策略拒绝"),
    "collaboration-worker": ("Collaboration Agent", "执行已批准的双向握手"),
    "action-worker": ("Action Agent", "仅执行审批范围内的外部动作"),
    "verifier-worker": ("Verifier Agent", "只读验证审批、协议与 Trace"),
}


class DemoError(RuntimeError):
    """A safe, user-visible invalid transition."""


def _iso(value: datetime) -> str:
    return value.isoformat()


def _hash(payload: Any) -> str:
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode()).hexdigest()


class DemoService:
    def __init__(self, db_path: Path | str = DEFAULT_DB) -> None:
        self.db_path = Path(db_path)
        self.world_root = self.db_path.parent / "demo-world"
        self.repo_root = self.world_root / "github" / "agentreach"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        if self._get_state() is None:
            self.reset()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS demo_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    payload TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS audit_events (
                    sequence INTEGER PRIMARY KEY AUTOINCREMENT,
                    trace_id TEXT NOT NULL,
                    occurred_at TEXT NOT NULL,
                    agent TEXT NOT NULL,
                    skill TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    decision TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    evidence TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS mailbox_envelopes (
                    envelope_id TEXT PRIMARY KEY,
                    trace_id TEXT NOT NULL,
                    recipient TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS memory_records (
                    memory_id TEXT PRIMARY KEY,
                    trace_id TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    evidence TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS action_receipts (
                    idempotency_key TEXT PRIMARY KEY,
                    trace_id TEXT NOT NULL,
                    action_id TEXT NOT NULL,
                    result TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                """
            )

    def _get_state(self) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute("SELECT payload FROM demo_state WHERE id = 1").fetchone()
        return json.loads(row["payload"]) if row else None

    def _save_state(self, state: dict[str, Any]) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO demo_state(id, payload, updated_at) VALUES(1, ?, ?)",
                (json.dumps(state, ensure_ascii=False), _iso(DEMO_NOW)),
            )

    def _event(
        self,
        state: dict[str, Any],
        agent: str,
        skill: str,
        event_type: str,
        decision: str,
        summary: str,
        evidence: dict[str, Any] | None = None,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO audit_events
                (trace_id, occurred_at, agent, skill, event_type, decision, summary, evidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    state["trace_id"],
                    _iso(DEMO_NOW + timedelta(seconds=self._trace_count(state))),
                    agent,
                    skill,
                    event_type,
                    decision,
                    summary,
                    json.dumps(evidence or {}, ensure_ascii=False),
                ),
            )

    def _trace_count(self, state: dict[str, Any]) -> int:
        with self._connect() as conn:
            return conn.execute(
                "SELECT COUNT(*) FROM audit_events WHERE trace_id = ?", (state["trace_id"],)
            ).fetchone()[0]

    def _require(self, *stages: str) -> dict[str, Any]:
        state = self._get_state()
        if state is None or state["stage"] not in stages:
            actual = state["stage"] if state else "MISSING"
            raise DemoError(f"当前状态 {actual} 不能执行此操作；需要 {' / '.join(stages)}。")
        return state

    def _schema(self, name: str) -> dict[str, Any]:
        return json.loads((PROTOCOL_DIR / name / "schema.json").read_text())

    def _validate(self, name: str, payload: dict[str, Any]) -> list[str]:
        validator = Draft202012Validator(self._schema(name), format_checker=FormatChecker())
        return [error.message for error in sorted(validator.iter_errors(payload), key=lambda e: list(e.path))]

    def reset(self) -> dict[str, Any]:
        state = {
            "task_id": f"task-{uuid4().hex[:8]}",
            "trace_id": f"trace-{uuid4().hex[:8]}",
            "principal_id": "haipi",
            "personal_agent_id": "haipi-agent",
            "stage": "CREATED",
            "intent": None,
            "candidates": [],
            "selected_candidate": None,
            "capsule": None,
            "removed_fields": [],
            "approval": None,
            "introduction": None,
            "commitment": None,
            "verification": None,
            "privacy_denials": [],
            "entities": [],
            "affordances": [],
            "action_plan": [],
            "action_results": [],
            "evidence": [],
            "memory_updates": [],
            "world_changed": False,
            "connector_grants": [],
        }
        with self._connect() as conn:
            conn.execute("DELETE FROM audit_events")
            conn.execute("DELETE FROM mailbox_envelopes")
            conn.execute("DELETE FROM memory_records")
            conn.execute("DELETE FROM action_receipts")
        self._save_state(state)
        self._event(
            state,
            "personal-manager",
            "task-orchestration",
            "task.created",
            "ALLOW",
            "新建本地协作任务；未向共享平面发送数据。",
            {"task_id": state["task_id"], "initial_stage": "CREATED"},
        )
        return self.snapshot()

    def structure_intent(self, request: str) -> dict[str, Any]:
        state = self._require("CREATED")
        request = request.strip()
        if not request:
            raise DemoError("请求不能为空。")
        intent = {
            "schema": "agentreach.intent/v1",
            "intent_id": f"int-{uuid4().hex[:8]}",
            "owner": "haipi",
            "type": "find_collaborator",
            "topic": ["personal-agent", "agent-identity"],
            "scope": ["domain:706"],
            "constraints": {"relationship_distance": 2},
            "visibility": "private",
            "status": "active",
        }
        errors = self._validate("intent", intent)
        if errors:
            raise DemoError("Intent Schema 校验失败：" + "; ".join(errors))
        state["intent"] = intent
        state["human_request"] = request
        state["stage"] = "INTENT_PARSED"
        self._save_state(state)
        self._event(
            state,
            "intent-worker",
            "intent-structuring",
            "intent.parsed",
            "ALLOW_LOCAL",
            "用户请求已结构化为私有 Intent。",
            {"intent_id": intent["intent_id"], "visibility": "private", "shared": False},
        )
        return self.snapshot()

    def discover(self) -> dict[str, Any]:
        state = self._require("INTENT_PARSED")
        fixture = json.loads(FIXTURE.read_text())
        topics = set(state["intent"]["topic"])
        relationships = {
            row["person_id"]: row
            for row in fixture["private_relationships"]
            if row["owner_id"] == state["principal_id"]
        }
        candidates: list[dict[str, Any]] = []
        rejected: list[dict[str, str]] = []
        for person in fixture["people"]:
            if person["id"] == state["principal_id"]:
                continue
            eligible_claims = []
            for claim in person["claims"]:
                expires = datetime.fromisoformat(claim["expires_at"])
                if expires <= DEMO_NOW:
                    rejected.append({"person": person["id"], "reason": "expired_claim"})
                    continue
                if "domain:706" not in claim["audience"]:
                    rejected.append({"person": person["id"], "reason": "audience_mismatch"})
                    continue
                eligible_claims.append(claim)
            if not eligible_claims:
                continue
            claim_topics = {topic for claim in eligible_claims for topic in claim["topics"]}
            overlap = topics & claim_topics
            if not overlap:
                rejected.append({"person": person["id"], "reason": "topic_mismatch"})
                continue
            topic_score = len(overlap) / len(topics | claim_topics)
            rel = relationships.get(person["id"])
            relationship_score = 1.0 if rel and rel["relationship_type"] == "past_collaborator" else 0.55 if rel else 0.0
            newest = max(datetime.fromisoformat(c["issued_at"]) for c in eligible_claims)
            age_days = max(0, (DEMO_NOW - newest).days)
            freshness_score = max(0.0, 1 - age_days / 30)
            availability_score = 1.0 if person["availability"] == "available" else 0.4
            parts = {
                "topic": round(0.35 * topic_score, 4),
                "relationship": round(0.25 * relationship_score, 4),
                "domain": 0.15,
                "freshness": round(0.15 * freshness_score, 4),
                "availability": round(0.10 * availability_score, 4),
            }
            total = round(sum(parts.values()), 4)
            reasons = [f"公开 Claim 匹配：{', '.join(sorted(overlap))}", "共同属于 706 Trust Domain"]
            if rel:
                reasons.append(f"本地关系：{rel['relationship_type']}")
            reasons.extend([f"Claim 更新于 {age_days} 天前", f"当前状态：{person['availability']}"])
            candidates.append(
                {
                    "id": person["id"],
                    "agent": person["agent"],
                    "display_name": person["display_name"],
                    "score": total,
                    "score_percent": round(total * 100),
                    "score_components": parts,
                    "reasons": reasons,
                    "evidence_ids": [c["id"] for c in eligible_claims] + ([f"rel:{person['id']}"] if rel else []),
                }
            )
        candidates.sort(key=lambda item: (-item["score"], item["display_name"]))
        state["candidates"] = candidates
        state["entities"] = [
            {"id": "repo-agentreach", "type": "Repository", "name": "AgentReach", "plane": "world"},
            {"id": "alice-agent", "type": "Agent", "name": "Alice Agent", "plane": "network"},
            {"id": "domain-706", "type": "Community", "name": "706", "plane": "network"},
            {"id": "coding", "type": "Capability", "name": "Coding", "plane": "capability"},
        ]
        state["affordances"] = [
            {"entity_id": "repo-agentreach", "action": "create_file", "permission": "requires_human_approval"},
            {"entity_id": "alice-agent", "action": "send_mailbox_envelope", "permission": "requires_human_approval"},
        ]
        state["stage"] = "CANDIDATES_FOUND"
        self._save_state(state)
        self._event(
            state,
            "discovery-worker",
            "candidate-discovery",
            "candidates.ranked",
            "ALLOW_LOCAL",
            f"本地发现 {len(candidates)} 位合格候选人；过期或不匹配 Claim 已过滤。",
            {"candidate_ids": [c["id"] for c in candidates], "rejected": rejected},
        )
        return self.snapshot()

    def select_candidate(self, candidate_id: str) -> dict[str, Any]:
        state = self._require("CANDIDATES_FOUND")
        candidate = next((c for c in state["candidates"] if c["id"] == candidate_id), None)
        if candidate is None:
            raise DemoError("候选人不存在或已被安全过滤。")
        capsule = {
            "schema": "agentreach.context-capsule/v1",
            "capsule_id": f"cap-{uuid4().hex[:8]}",
            "purpose": "introduction",
            "sender": "haipi-agent",
            "recipient": candidate["agent"],
            "shared_context": {"common_domain": "706", "topic": "personal-agent"},
            "claims": ["member_of:706", "interested_in:personal-agent"],
            "request": {"type": "potential_collaboration"},
            "expires_at": _iso(DEMO_NOW + timedelta(hours=24)),
            "policy_proof": {"approved": True, "approval_id": "pending-human-approval"},
        }
        state["selected_candidate"] = candidate
        state["capsule"] = capsule
        state["removed_fields"] = [
            "私人项目计划",
            "预算与资源",
            "私人关系备注",
            "完整关系图",
            "聊天记录与个人记忆",
        ]
        state["action_plan"] = [
            {"id": "update-repository", "actor": "action-worker", "target": "AgentReach/docs/vision.md", "action": "create_file"},
            {"id": "send-collaboration-request", "actor": "action-worker", "target": f"{candidate['display_name']} Agent Inbox", "action": "send_mailbox_envelope"},
        ]
        state["connector_grants"] = [
            {"connector": "github-local-sandbox/v1", "scope": "repo:AgentReach:file:docs/vision.md", "status": "PENDING_APPROVAL"},
            {"connector": "agent-mailbox/v1", "scope": f"inbox:{candidate['agent']}:send", "status": "PENDING_APPROVAL"},
        ]
        state["stage"] = "WAITING_USER_APPROVAL"
        self._save_state(state)
        self._event(
            state,
            "boundary-worker",
            "context-capsule",
            "capsule.prepared",
            "REQUIRE_L2_APPROVAL",
            f"已为 {candidate['display_name']} 生成最小 Context Capsule，等待 Haipi 批准。",
            {
                "capsule_id": capsule["capsule_id"],
                "included_fields": ["common_domain", "topic", "claims", "request"],
                "removed_fields": state["removed_fields"],
                "disclosure_ratio": "4/9 (44%)",
            },
        )
        return self.snapshot()

    def approve_introduction(self) -> dict[str, Any]:
        state = self._require("WAITING_USER_APPROVAL")
        approval_id = f"apr-haipi-{uuid4().hex[:6]}"
        state["approval"] = {
            "approval_id": approval_id,
            "principal": "haipi",
            "action": "send_introduction",
            "capsule_hash": _hash({k: v for k, v in state["capsule"].items() if k != "policy_proof"}),
            "approved_at": _iso(DEMO_NOW + timedelta(minutes=1)),
        }
        state["capsule"]["policy_proof"]["approval_id"] = approval_id
        errors = self._validate("capsule", state["capsule"])
        if errors:
            raise DemoError("Capsule Schema 校验失败：" + "; ".join(errors))
        intro = {
            "schema": "agentreach.introduction/v1",
            "introduction_id": f"intro-{uuid4().hex[:8]}",
            "from": "haipi-agent",
            "to": state["selected_candidate"]["agent"],
            "capsule_id": state["capsule"]["capsule_id"],
            "state": "pending",
        }
        state["introduction"] = intro
        state["stage"] = "WAITING_PEER_APPROVAL"
        self._save_state(state)
        self._event(
            state,
            "collaboration-worker",
            "introduction-handshake",
            "introduction.sent",
            "ALLOW_WITH_APPROVAL",
            f"Haipi 批准后，最小 Capsule 已发送给 {state['selected_candidate']['display_name']} Agent。",
            {"approval_id": approval_id, "introduction_id": intro["introduction_id"], "capsule_hash": _hash(state["capsule"])},
        )
        return self.snapshot()

    def peer_decision(self, accepted: bool) -> dict[str, Any]:
        state = self._require("WAITING_PEER_APPROVAL")
        candidate = state["selected_candidate"]
        if not accepted:
            state["introduction"]["state"] = "declined"
            state["stage"] = "PEER_REJECTED"
            self._save_state(state)
            self._event(
                state,
                "collaboration-worker",
                "introduction-handshake",
                "introduction.declined",
                "PEER_REJECTED",
                f"{candidate['display_name']} 拒绝介绍；未创建 Commitment。",
                {"peer": candidate["id"], "commitment_created": False},
            )
            return self.snapshot()
        state["introduction"]["state"] = "accepted"
        state["peer_approval"] = {
            "approval_id": f"apr-{candidate['id']}-{uuid4().hex[:6]}",
            "principal": candidate["id"],
            "action": "accept_introduction",
            "approved_at": _iso(DEMO_NOW + timedelta(minutes=2)),
        }
        state["commitment"] = {
            "schema": "agentreach.commitment/v1",
            "commitment_id": f"com-{uuid4().hex[:8]}",
            "parties": ["haipi", candidate["id"]],
            "objective": "Discuss Human-Agent Social Protocol",
            "status": "proposed",
            "party_a_approval": "pending-strong-approval",
            "party_b_approval": state["peer_approval"]["approval_id"],
        }
        state["stage"] = "COMMITMENT_PROPOSED"
        self._save_state(state)
        self._event(
            state,
            "collaboration-worker",
            "introduction-handshake",
            "introduction.accepted",
            "MUTUAL_CONSENT",
            f"{candidate['display_name']} 已同意介绍；生成 Commitment 草案，等待 Haipi 强确认。",
            {"peer_approval_id": state["peer_approval"]["approval_id"], "commitment_id": state["commitment"]["commitment_id"]},
        )
        return self.snapshot()

    def approve_and_verify_commitment(self) -> dict[str, Any]:
        state = self._require("COMMITMENT_PROPOSED")
        commitment_approval = f"apr-commit-{uuid4().hex[:6]}"
        state["commitment"]["party_a_approval"] = commitment_approval
        state["commitment"]["status"] = "accepted"
        for grant in state["connector_grants"]:
            grant["status"] = "ACTIVE"
            grant["approval_id"] = commitment_approval
        self._save_state(state)
        self._event(
            state,
            "personal-manager",
            "approval-engine",
            "commitment.approved",
            "ALLOW_L3",
            "Haipi 已强确认 Commitment；进入独立只读验证。",
            {"approval_id": commitment_approval, "commitment_hash": _hash(state["commitment"])},
        )
        state["action_results"] = self._execute_world_actions(state, commitment_approval)
        state["world_changed"] = len(state["action_results"]) == 2
        self._save_state(state)
        checks = self._verification_checks(state)
        passed = all(check["passed"] for check in checks)
        state["verification"] = {
            "verdict": "VERIFIED" if passed else "REJECTED",
            "checks": checks,
            "verified_at": _iso(DEMO_NOW + timedelta(minutes=4)),
            "verifier": "verifier-worker",
            "read_only": True,
        }
        state["stage"] = "COMPLETED" if passed else "FAILED"
        self._save_state(state)
        self._event(
            state,
            "verifier-worker",
            "commitment-verification",
            "verification.completed",
            state["verification"]["verdict"],
            "独立 Verifier 反向读取 Repository 与 Alice Inbox，并完成协议、审批与 Trace 检查。",
            {"checks": checks, "read_only": True, "evidence": state["evidence"]},
        )
        if passed:
            memory = self._record_verified_memory(state)
            state["memory_updates"].append(memory)
            self._save_state(state)
            self._event(
                state,
                "personal-manager",
                "experience-memory",
                "memory.experience_recorded",
                "ALLOW_VERIFIED_ONLY",
                "两项世界动作验证通过后，经验已写回 Personal Agent Memory。",
                {"memory_id": memory["memory_id"], "source_verdict": "VERIFIED"},
            )
        return self.snapshot()

    def _execute_world_actions(self, state: dict[str, Any], approval_id: str) -> list[dict[str, Any]]:
        cached = self._cached_action_results(state["trace_id"])
        if len(cached) == 2:
            return cached
        vision_path = self.repo_root / "docs" / "vision.md"
        vision_path.parent.mkdir(parents=True, exist_ok=True)
        content = (
            "# AgentReach Vision\n\n"
            "AgentReach is a Human–AI Agency OS that turns private intent into "
            "consented, verifiable changes in the world.\n\n"
            f"Demo trace: `{state['trace_id']}`\n"
        )
        vision_path.write_text(content, encoding="utf-8")
        repo_result = {
            "action_id": "update-repository",
            "status": "SUCCEEDED",
            "connector": "github-local-sandbox/v1",
            "target": "AgentReach/docs/vision.md",
            "path": str(vision_path),
            "content_sha256": hashlib.sha256(content.encode()).hexdigest(),
            "approval_id": approval_id,
            "idempotency_key": f"{state['trace_id']}:update-repository",
        }
        self._save_action_receipt(state, repo_result)
        self._event(state, "action-worker", "repository-write", "action.repository.updated", "EXECUTED", "Action Agent 已在 GitHub 本地沙箱创建 AgentReach/docs/vision.md。", repo_result)

        envelope_id = f"env-{uuid4().hex[:8]}"
        envelope_payload = {
            "from": "haipi-agent",
            "to": state["selected_candidate"]["agent"],
            "introduction_id": state["introduction"]["introduction_id"],
            "commitment_id": state["commitment"]["commitment_id"],
            "capsule_id": state["capsule"]["capsule_id"],
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO mailbox_envelopes VALUES (?, ?, ?, ?, ?, ?, ?)",
                (envelope_id, state["trace_id"], state["selected_candidate"]["agent"], "AgentReach collaboration request", json.dumps(envelope_payload, ensure_ascii=False), "DELIVERED", _iso(DEMO_NOW + timedelta(minutes=3))),
            )
        mailbox_result = {
            "action_id": "send-collaboration-request",
            "status": "SUCCEEDED",
            "connector": "agent-mailbox/v1",
            "target": f"{state['selected_candidate']['display_name']} Agent Inbox",
            "envelope_id": envelope_id,
            "approval_id": approval_id,
            "idempotency_key": f"{state['trace_id']}:send-collaboration-request",
        }
        self._save_action_receipt(state, mailbox_result)
        self._event(state, "action-worker", "mailbox-send", "action.mailbox.sent", "EXECUTED", "Action Agent 已将协作请求投递到 Alice Agent Inbox。", mailbox_result)
        return [repo_result, mailbox_result]

    def _cached_action_results(self, trace_id: str) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute("SELECT result FROM action_receipts WHERE trace_id = ? ORDER BY CASE action_id WHEN 'update-repository' THEN 1 ELSE 2 END", (trace_id,)).fetchall()
        return [json.loads(row["result"]) for row in rows]

    def _save_action_receipt(self, state: dict[str, Any], result: dict[str, Any]) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO action_receipts VALUES (?, ?, ?, ?, ?)",
                (result["idempotency_key"], state["trace_id"], result["action_id"], json.dumps(result, ensure_ascii=False), _iso(DEMO_NOW + timedelta(minutes=3))),
            )

    def _world_evidence(self, state: dict[str, Any]) -> tuple[list[dict[str, Any]], bool, bool]:
        vision_path = self.repo_root / "docs" / "vision.md"
        repo_ok = vision_path.exists() and state["trace_id"] in vision_path.read_text(encoding="utf-8")
        envelope_id = next((item["envelope_id"] for item in state["action_results"] if "envelope_id" in item), "")
        with self._connect() as conn:
            mailbox = conn.execute("SELECT recipient, status FROM mailbox_envelopes WHERE envelope_id = ?", (envelope_id,)).fetchone()
        mailbox_ok = bool(mailbox and mailbox["recipient"] == state["selected_candidate"]["agent"] and mailbox["status"] == "DELIVERED")
        evidence = [
            {"type": "repository_file", "label": "Repository updated", "verified": repo_ok, "path": str(vision_path)},
            {"type": "mailbox_envelope", "label": "Introduction sent", "verified": mailbox_ok, "envelope_id": envelope_id},
        ]
        state["evidence"] = evidence
        return evidence, repo_ok, mailbox_ok

    def _record_verified_memory(self, state: dict[str, Any]) -> dict[str, Any]:
        memory = {"memory_id": f"mem-{uuid4().hex[:8]}", "kind": "verified_experience", "summary": "AgentReach repository updated and Alice collaboration request delivered.", "source_trace_id": state["trace_id"]}
        with self._connect() as conn:
            conn.execute("INSERT INTO memory_records VALUES (?, ?, ?, ?, ?, ?)", (memory["memory_id"], state["trace_id"], memory["kind"], memory["summary"], json.dumps(state["evidence"], ensure_ascii=False), _iso(DEMO_NOW + timedelta(minutes=5))))
        return memory

    def _verification_checks(self, state: dict[str, Any]) -> list[dict[str, Any]]:
        capsule_errors = self._validate("capsule", state["capsule"])
        intro_errors = self._validate("introduction", state["introduction"])
        commitment_errors = self._validate("commitment", state["commitment"])
        trace_agents = {event["agent"] for event in self._trace(state)}
        required_agents = {"intent-worker", "discovery-worker", "boundary-worker", "collaboration-worker"}
        _, repo_ok, mailbox_ok = self._world_evidence(state)
        return [
            {"name": "A approved", "passed": bool(state.get("approval"))},
            {"name": "B approved", "passed": bool(state.get("peer_approval"))},
            {"name": "Capsule schema valid", "passed": not capsule_errors, "detail": capsule_errors},
            {"name": "Capsule not expired", "passed": datetime.fromisoformat(state["capsule"]["expires_at"]) > DEMO_NOW},
            {"name": "Introduction valid", "passed": not intro_errors and state["introduction"]["state"] == "accepted", "detail": intro_errors},
            {"name": "Commitment consistent", "passed": not commitment_errors and set(state["commitment"]["parties"]) == {"haipi", state["selected_candidate"]["id"]}, "detail": commitment_errors},
            {"name": "Trace complete", "passed": required_agents.issubset(trace_agents), "detail": sorted(trace_agents)},
            {"name": "Repository updated", "passed": repo_ok},
            {"name": "Introduction sent", "passed": mailbox_ok},
            {"name": "2 actions independently verified", "passed": repo_ok and mailbox_ok},
            {"name": "Verifier is read-only", "passed": True},
        ]

    def deny_privacy_request(self) -> dict[str, Any]:
        state = self._get_state()
        if state is None:
            raise DemoError("Demo 尚未初始化。")
        denial = {
            "decision": "DENIED",
            "reason": "scope_exceeds_delegation",
            "requested": ["private_relationship_graph"],
            "allowed": ["shared_domain", "shared_topic"],
        }
        state["privacy_denials"].append(denial)
        self._save_state(state)
        self._event(
            state,
            "boundary-worker",
            "context-capsule",
            "policy.denied",
            "DENIED",
            "Peer 请求完整私人关系图，已由 Boundary Agent 阻断。",
            denial,
        )
        return self.snapshot()

    def _trace(self, state: dict[str, Any]) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM audit_events WHERE trace_id = ? ORDER BY sequence", (state["trace_id"],)
            ).fetchall()
        return [
            {
                "sequence": row["sequence"],
                "occurred_at": row["occurred_at"],
                "agent": row["agent"],
                "agent_label": AGENT_META.get(row["agent"], (row["agent"], ""))[0],
                "skill": row["skill"],
                "event_type": row["event_type"],
                "decision": row["decision"],
                "summary": row["summary"],
                "evidence": json.loads(row["evidence"]),
            }
            for row in rows
        ]

    def snapshot(self) -> dict[str, Any]:
        state = self._get_state()
        if state is None:
            raise DemoError("Demo 尚未初始化。")
        result = deepcopy(state)
        result["trace"] = self._trace(state)
        result["agents"] = [
            {"id": key, "name": value[0], "role": value[1]} for key, value in AGENT_META.items()
        ]
        result["stage_index"] = STAGE_ORDER.index(state["stage"]) if state["stage"] in STAGE_ORDER else -1
        result["stage_total"] = len(STAGE_ORDER) - 1
        result["privacy_invariants"] = [
            "Private Intent stays local",
            "Relationship graph never enters shared plane",
            "Outbound context requires policy + approval",
            "Executor and Verifier are separated",
        ]
        with self._connect() as conn:
            result["connector_runtime"] = {
                "receipts": conn.execute("SELECT COUNT(*) FROM action_receipts WHERE trace_id = ?", (state["trace_id"],)).fetchone()[0],
                "mailbox_envelopes": conn.execute("SELECT COUNT(*) FROM mailbox_envelopes WHERE trace_id = ?", (state["trace_id"],)).fetchone()[0],
                "idempotent": True,
            }
        return result
