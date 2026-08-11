"""Deterministic, auditable AgentReach golden-loop service.

The demo intentionally needs no LLM or external API. Facts and policy decisions
remain deterministic so judges can inspect and reproduce every transition.
"""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import subprocess
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
    "WAITING_ACTION_EXECUTION",
    "WAITING_VERIFICATION",
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

SKILL_META = [
    ("intent-structuring", "Turn a human request into a private, validated Intent."),
    ("candidate-discovery", "Rank eligible peers from shared Claims and local context."),
    ("context-capsule", "Prepare minimum-sufficient disclosure with policy proof."),
    ("introduction-handshake", "Run the consented peer introduction protocol."),
    ("claim-publishing", "Publish bounded, revocable capability Claims."),
    ("commitment-verification", "Verify approvals, protocol state and world evidence."),
]


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
        existing = self._get_state()
        if existing is None:
            self.reset()
        elif "run_id" not in existing:
            existing.update(
                {
                    "run_id": f"run-{uuid4().hex[:8]}",
                    "runtime_status": "COMPLETED" if existing.get("stage") == "COMPLETED" else "RUNNING",
                    "attempt": 1,
                    "created_at": _iso(DEMO_NOW),
                    "updated_at": _iso(DEMO_NOW),
                    "finished_at": _iso(DEMO_NOW) if existing.get("stage") == "COMPLETED" else None,
                }
            )
            self._save_state(existing)

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
                CREATE TABLE IF NOT EXISTS task_runs (
                    run_id TEXT PRIMARY KEY,
                    task_id TEXT NOT NULL,
                    trace_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    attempt INTEGER NOT NULL,
                    human_request TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    finished_at TEXT,
                    state_payload TEXT
                );
                CREATE TABLE IF NOT EXISTS connector_registry (
                    connector_id TEXT PRIMARY KEY,
                    enabled INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    capability TEXT NOT NULL,
                    last_checked_at TEXT,
                    details TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS skill_registry (
                    skill_id TEXT PRIMARY KEY,
                    enabled INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    version TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS worker_jobs (
                    job_id TEXT PRIMARY KEY,
                    run_id TEXT NOT NULL,
                    trace_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    skill TEXT NOT NULL,
                    status TEXT NOT NULL,
                    attempt INTEGER NOT NULL,
                    max_attempts INTEGER NOT NULL,
                    payload TEXT NOT NULL,
                    result TEXT,
                    error TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS notifications (
                    notification_id TEXT PRIMARY KEY,
                    event_key TEXT NOT NULL UNIQUE,
                    run_id TEXT NOT NULL,
                    trace_id TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    title TEXT NOT NULL,
                    body TEXT NOT NULL,
                    status TEXT NOT NULL,
                    action TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                """
            )
            run_columns = {row["name"] for row in conn.execute("PRAGMA table_info(task_runs)").fetchall()}
            if "state_payload" not in run_columns:
                conn.execute("ALTER TABLE task_runs ADD COLUMN state_payload TEXT")
            conn.executemany(
                """INSERT OR IGNORE INTO connector_registry
                (connector_id, enabled, status, mode, capability, last_checked_at, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                [
                    ("github-remote/v1", 1, "UNKNOWN", "LIVE_READONLY", "repo:haipi001/AgentReach:metadata:read", None, "{}"),
                    ("github-local-sandbox/v1", 1, "HEALTHY", "LOCAL_WRITE", "repo:AgentReach:file:docs/vision.md", _iso(DEMO_NOW), "{}"),
                    ("agent-mailbox/v1", 1, "HEALTHY", "LOCAL_WRITE", "inbox:selected-peer:send", _iso(DEMO_NOW), "{}"),
                ],
            )
            conn.executemany(
                """INSERT OR IGNORE INTO skill_registry
                (skill_id, enabled, status, version, updated_at) VALUES (?, 1, 'READY', '0.1.0', ?)""",
                [(skill_id, _iso(DEMO_NOW)) for skill_id, _ in SKILL_META],
            )
            conn.execute(
                "UPDATE worker_jobs SET status = 'PENDING', error = 'recovered_after_restart' WHERE status = 'RUNNING'"
            )

    def _get_state(self) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute("SELECT payload FROM demo_state WHERE id = 1").fetchone()
        return json.loads(row["payload"]) if row else None

    def _save_state(self, state: dict[str, Any]) -> None:
        state["updated_at"] = _iso(DEMO_NOW + timedelta(seconds=self._trace_count(state)))
        serialized = json.dumps(state, ensure_ascii=False)
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO demo_state(id, payload, updated_at) VALUES(1, ?, ?)",
                (serialized, _iso(DEMO_NOW)),
            )
            conn.execute(
                """INSERT INTO task_runs
                (run_id, task_id, trace_id, status, stage, attempt, human_request, created_at, updated_at, finished_at, state_payload)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(run_id) DO UPDATE SET
                    status=excluded.status, stage=excluded.stage, attempt=excluded.attempt,
                    human_request=excluded.human_request, updated_at=excluded.updated_at,
                    finished_at=excluded.finished_at, state_payload=excluded.state_payload""",
                (
                    state["run_id"], state["task_id"], state["trace_id"],
                    state["runtime_status"], state["stage"], state["attempt"],
                    state.get("human_request"), state["created_at"], state["updated_at"],
                    state.get("finished_at"), serialized,
                ),
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

    def _notify(self, state: dict[str, Any], event_key: str, kind: str, title: str, body: str, action: str) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT OR IGNORE INTO notifications
                (notification_id, event_key, run_id, trace_id, kind, title, body, status, action, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'UNREAD', ?, ?)""",
                (
                    f"not-{uuid4().hex[:8]}", f"{state['run_id']}:{event_key}", state["run_id"], state["trace_id"],
                    kind, title, body, action, _iso(DEMO_NOW + timedelta(seconds=self._trace_count(state))),
                ),
            )

    def _trace_count(self, state: dict[str, Any]) -> int:
        with self._connect() as conn:
            return conn.execute(
                "SELECT COUNT(*) FROM audit_events WHERE trace_id = ?", (state["trace_id"],)
            ).fetchone()[0]

    def _require(self, *stages: str) -> dict[str, Any]:
        state = self._get_state()
        if state is not None and state.get("runtime_status", "RUNNING") != "RUNNING":
            raise DemoError(f"当前运行状态 {state['runtime_status']} 不允许执行任务步骤。")
        if state is None or state["stage"] not in stages:
            actual = state["stage"] if state else "MISSING"
            raise DemoError(f"当前状态 {actual} 不能执行此操作；需要 {' / '.join(stages)}。")
        return state

    def _schema(self, name: str) -> dict[str, Any]:
        return json.loads((PROTOCOL_DIR / name / "schema.json").read_text())

    def _validate(self, name: str, payload: dict[str, Any]) -> list[str]:
        validator = Draft202012Validator(self._schema(name), format_checker=FormatChecker())
        return [error.message for error in sorted(validator.iter_errors(payload), key=lambda e: list(e.path))]

    def reset(self, preserve_current: bool = False) -> dict[str, Any]:
        previous = self._get_state()
        if previous and previous.get("runtime_status") not in {"COMPLETED", "CANCELLED", "FAILED", "SUPERSEDED"}:
            previous["runtime_status"] = "PAUSED" if preserve_current else "SUPERSEDED"
            if not preserve_current:
                previous["finished_at"] = _iso(DEMO_NOW)
            self._save_state(previous)
        state = {
            "run_id": f"run-{uuid4().hex[:8]}",
            "task_id": f"task-{uuid4().hex[:8]}",
            "trace_id": f"trace-{uuid4().hex[:8]}",
            "principal_id": "haipi",
            "personal_agent_id": "haipi-agent",
            "stage": "CREATED",
            "runtime_status": "RUNNING",
            "attempt": 1,
            "created_at": _iso(DEMO_NOW),
            "updated_at": _iso(DEMO_NOW),
            "finished_at": None,
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

    def pause_run(self) -> dict[str, Any]:
        state = self._require(*STAGE_ORDER, "PEER_REJECTED", "FAILED")
        if state["stage"] in {"COMPLETED", "PEER_REJECTED", "FAILED"}:
            raise DemoError("已结束的任务不能暂停。")
        state["runtime_status"] = "PAUSED"
        self._event(state, "personal-manager", "task-orchestration", "run.paused", "PAUSED", "用户暂停当前任务；任何 Agent 均不得继续执行。", {"stage": state["stage"]})
        self._save_state(state)
        return self.snapshot()

    def resume_run(self) -> dict[str, Any]:
        state = self._get_state()
        if state is None or state.get("runtime_status") != "PAUSED":
            raise DemoError("只有已暂停的任务可以恢复。")
        state["runtime_status"] = "RUNNING"
        self._event(state, "personal-manager", "task-orchestration", "run.resumed", "RESUMED", "用户恢复当前任务；从持久化阶段继续。", {"stage": state["stage"]})
        self._save_state(state)
        return self.snapshot()

    def cancel_run(self) -> dict[str, Any]:
        state = self._get_state()
        if state is None or state.get("runtime_status") not in {"RUNNING", "PAUSED"}:
            raise DemoError("当前任务不能取消。")
        state["runtime_status"] = "CANCELLED"
        state["finished_at"] = _iso(DEMO_NOW + timedelta(seconds=self._trace_count(state)))
        self._event(state, "personal-manager", "task-orchestration", "run.cancelled", "CANCELLED", "用户取消当前任务；已发放但未使用的授权立即失效。", {"stage": state["stage"]})
        self._notify(state, "run.cancelled", "RUN", "任务已取消", "未完成的 Worker Job 与连接器授权均已终止。", "system")
        for grant in state["connector_grants"]:
            if grant["status"] != "USED":
                grant["status"] = "REVOKED"
        with self._connect() as conn:
            conn.execute(
                "UPDATE worker_jobs SET status = 'CANCELLED', updated_at = ? WHERE run_id = ? AND status IN ('PENDING', 'RUNNING')",
                (_iso(DEMO_NOW), state["run_id"]),
            )
        self._save_state(state)
        return self.snapshot()

    def retry_run(self) -> dict[str, Any]:
        previous = self._get_state()
        if previous is None or previous.get("runtime_status") not in {"CANCELLED", "FAILED"}:
            raise DemoError("只有已取消或失败的任务可以重试。")
        request = previous.get("human_request", "")
        attempt = int(previous.get("attempt", 1)) + 1
        self.reset()
        state = self._get_state()
        assert state is not None
        state["attempt"] = attempt
        state["retried_from"] = previous["run_id"]
        self._save_state(state)
        if request:
            self.enqueue_job("intent-worker", "intent-structuring", {"request": request})
            first = self.process_next_job()
            if first["worker_queue"]["jobs"][-1]["status"] != "SUCCEEDED":
                return first
            self.enqueue_job("discovery-worker", "candidate-discovery")
            return self.process_next_job()
        return self.snapshot()

    def list_runs(self) -> dict[str, Any]:
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT run_id, task_id, trace_id, status, stage, attempt, human_request,
                created_at, updated_at, finished_at, state_payload IS NOT NULL AS recoverable
                FROM task_runs ORDER BY rowid DESC LIMIT 30"""
            ).fetchall()
        items = [dict(row) | {"recoverable": bool(row["recoverable"])} for row in rows]
        return {"total": len(items), "items": items}

    def switch_run(self, run_id: str) -> dict[str, Any]:
        current = self._get_state()
        if current is not None and current["run_id"] == run_id:
            return self.snapshot()
        with self._connect() as conn:
            row = conn.execute("SELECT status, state_payload FROM task_runs WHERE run_id = ?", (run_id,)).fetchone()
        if row is None or not row["state_payload"]:
            raise DemoError("该 Run 没有可恢复的状态快照。")
        if current is not None and current.get("runtime_status") == "RUNNING":
            current["runtime_status"] = "PAUSED"
            self._save_state(current)
        target = json.loads(row["state_payload"])
        if target.get("runtime_status") == "PAUSED":
            target["runtime_status"] = "RUNNING"
        self._save_state(target)
        self._event(
            target, "personal-manager", "task-orchestration", "run.switched", "RESTORED",
            "用户切换到持久化任务快照。", {"run_id": run_id, "stage": target["stage"]},
        )
        return self.snapshot()

    def set_skill_enabled(self, skill_id: str, enabled: bool) -> dict[str, Any]:
        state = self._get_state()
        if state is None:
            raise DemoError("Demo 尚未初始化。")
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM skill_registry WHERE skill_id = ?", (skill_id,)).fetchone()
            if row is None:
                raise DemoError("Skill 不存在于本地装载清单。")
            if not enabled:
                active_job = conn.execute(
                    """SELECT job_id FROM worker_jobs WHERE skill = ? AND status IN ('PENDING', 'RUNNING') LIMIT 1""",
                    (skill_id,),
                ).fetchone()
                if active_job is not None:
                    raise DemoError("Skill 正在被 Worker 使用，不能停用。")
            status = "READY" if enabled else "DISABLED"
            conn.execute(
                "UPDATE skill_registry SET enabled = ?, status = ?, updated_at = ? WHERE skill_id = ?",
                (int(enabled), status, _iso(DEMO_NOW + timedelta(seconds=self._trace_count(state))), skill_id),
            )
        self._event(
            state, "personal-manager", "task-orchestration", "skill.loadout.changed",
            "ENABLED" if enabled else "DISABLED",
            f"用户已在本地 AI Loadout 中{'启用' if enabled else '停用'} {skill_id}。",
            {"skill_id": skill_id, "enabled": enabled, "scope": "local"},
        )
        return self.snapshot()

    def enqueue_job(self, agent_id: str, skill: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        state = self._get_state()
        if state is None or state.get("runtime_status") != "RUNNING":
            raise DemoError("只有运行中的任务可以接收 Worker Job。")
        supported = {
            "intent-structuring": "intent-worker",
            "candidate-discovery": "discovery-worker",
            "context-capsule": "boundary-worker",
            "introduction-handshake": "collaboration-worker",
            "action-execution": "action-worker",
            "commitment-verification": "verifier-worker",
        }
        if skill not in supported or supported[skill] != agent_id:
            raise DemoError("Worker 与 Skill 绑定不合法。")
        with self._connect() as conn:
            registry = conn.execute("SELECT enabled FROM skill_registry WHERE skill_id = ?", (skill,)).fetchone()
        if registry is not None and not registry["enabled"]:
            raise DemoError(f"Skill {skill} 已从 AI Loadout 停用，Worker 不得执行。")
        job_id = f"job-{uuid4().hex[:8]}"
        now = _iso(DEMO_NOW + timedelta(seconds=self._trace_count(state)))
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO worker_jobs VALUES (?, ?, ?, ?, ?, 'PENDING', 0, 3, ?, NULL, NULL, ?, ?)",
                (job_id, state["run_id"], state["trace_id"], agent_id, skill, json.dumps(payload or {}, ensure_ascii=False), now, now),
            )
        self._event(state, "personal-manager", "task-orchestration", "job.enqueued", "QUEUED", f"已将 {skill} 分派给 {agent_id}。", {"job_id": job_id, "agent": agent_id, "skill": skill})
        return self.snapshot()

    def process_next_job(self) -> dict[str, Any]:
        state = self._get_state()
        if state is None or state.get("runtime_status") != "RUNNING":
            raise DemoError("当前 Run 未处于 RUNNING，Worker 不得领取任务。")
        with self._connect() as conn:
            conn.execute("BEGIN IMMEDIATE")
            row = conn.execute(
                "SELECT * FROM worker_jobs WHERE run_id = ? AND status = 'PENDING' ORDER BY rowid LIMIT 1",
                (state["run_id"],),
            ).fetchone()
            if row is None:
                raise DemoError("当前 Run 没有待处理的 Worker Job。")
            attempt = row["attempt"] + 1
            conn.execute(
                "UPDATE worker_jobs SET status = 'RUNNING', attempt = ?, updated_at = ? WHERE job_id = ? AND status = 'PENDING'",
                (attempt, _iso(DEMO_NOW), row["job_id"]),
            )
        self._event(state, row["agent_id"], row["skill"], "job.started", "RUNNING", f"Worker 已原子领取 {row['job_id']}。", {"job_id": row["job_id"], "attempt": attempt})
        try:
            payload = json.loads(row["payload"])
            if row["skill"] == "intent-structuring":
                result = self.structure_intent(str(payload.get("request", "")))
            elif row["skill"] == "candidate-discovery":
                result = self.discover()
            elif row["skill"] == "context-capsule":
                result = self.select_candidate(str(payload.get("candidate_id", "")))
            elif row["skill"] == "introduction-handshake" and payload.get("operation") == "approve_introduction":
                result = self.approve_introduction()
            elif row["skill"] == "introduction-handshake" and payload.get("operation") == "peer_decision":
                result = self.peer_decision(bool(payload.get("accepted")))
            elif row["skill"] == "action-execution":
                result = self.execute_approved_actions()
            elif row["skill"] == "commitment-verification":
                result = self.verify_world_actions()
            else:
                raise DemoError("没有可执行该 Skill 的 Worker。")
        except DemoError as exc:
            with self._connect() as conn:
                conn.execute(
                    "UPDATE worker_jobs SET status = 'FAILED', error = ?, updated_at = ? WHERE job_id = ?",
                    (str(exc), _iso(DEMO_NOW), row["job_id"]),
                )
            current = self._get_state() or state
            self._event(current, row["agent_id"], row["skill"], "job.failed", "FAILED", f"Worker Job {row['job_id']} 执行失败。", {"job_id": row["job_id"], "error": str(exc), "attempt": attempt})
            self._notify(current, f"job.failed:{row['job_id']}:{attempt}", "ERROR", "Worker Job 执行失败", f"{row['skill']} 第 {attempt} 次执行失败，可在 Worker Runtime 中重试。", "system")
            return self.snapshot()
        with self._connect() as conn:
            conn.execute(
                "UPDATE worker_jobs SET status = 'SUCCEEDED', result = ?, error = NULL, updated_at = ? WHERE job_id = ?",
                (json.dumps({"stage": result["stage"]}, ensure_ascii=False), _iso(DEMO_NOW), row["job_id"]),
            )
        current = self._get_state() or state
        self._event(current, row["agent_id"], row["skill"], "job.succeeded", "SUCCEEDED", f"Worker Job {row['job_id']} 已完成。", {"job_id": row["job_id"], "stage": result["stage"], "attempt": attempt})
        return self.snapshot()

    def retry_job(self, job_id: str) -> dict[str, Any]:
        state = self._get_state()
        if state is None or state.get("runtime_status") != "RUNNING":
            raise DemoError("当前 Run 不能重试 Worker Job。")
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM worker_jobs WHERE job_id = ? AND run_id = ?", (job_id, state["run_id"])).fetchone()
            if row is None or row["status"] != "FAILED":
                raise DemoError("只有当前 Run 中失败的 Job 可以重试。")
            if row["attempt"] >= row["max_attempts"]:
                raise DemoError("Worker Job 已达到最大重试次数。")
            conn.execute("UPDATE worker_jobs SET status = 'PENDING', error = NULL, updated_at = ? WHERE job_id = ?", (_iso(DEMO_NOW), job_id))
        self._event(state, "personal-manager", "task-orchestration", "job.retried", "QUEUED", f"失败 Job {job_id} 已重新入队。", {"job_id": job_id, "next_attempt": row["attempt"] + 1})
        return self.snapshot()

    def list_notifications(self) -> dict[str, Any]:
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM notifications WHERE status != 'ARCHIVED' ORDER BY rowid DESC LIMIT 50").fetchall()
            unread = conn.execute("SELECT COUNT(*) FROM notifications WHERE status = 'UNREAD'").fetchone()[0]
        return {"unread": unread, "total": len(rows), "items": [dict(row) for row in rows]}

    def read_notification(self, notification_id: str) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute("SELECT notification_id FROM notifications WHERE notification_id = ?", (notification_id,)).fetchone()
            if row is None:
                raise DemoError("通知不存在。")
            conn.execute("UPDATE notifications SET status = 'READ' WHERE notification_id = ?", (notification_id,))
        return self.list_notifications()

    def read_all_notifications(self) -> dict[str, Any]:
        with self._connect() as conn:
            conn.execute("UPDATE notifications SET status = 'READ' WHERE status = 'UNREAD'")
        return self.list_notifications()

    def archive_notification(self, notification_id: str) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute("SELECT notification_id FROM notifications WHERE notification_id = ?", (notification_id,)).fetchone()
            if row is None:
                raise DemoError("通知不存在。")
            conn.execute("UPDATE notifications SET status = 'ARCHIVED' WHERE notification_id = ?", (notification_id,))
        return self.list_notifications()

    def start_task(self, request: str) -> dict[str, Any]:
        self.reset(preserve_current=True)
        self.enqueue_job("intent-worker", "intent-structuring", {"request": request})
        first = self.process_next_job()
        first_job = first["worker_queue"]["jobs"][-1]
        if first_job["status"] != "SUCCEEDED":
            return first
        self.enqueue_job("discovery-worker", "candidate-discovery")
        return self.process_next_job()

    def select_candidate_queued(self, candidate_id: str) -> dict[str, Any]:
        self.enqueue_job("boundary-worker", "context-capsule", {"candidate_id": candidate_id})
        return self.process_next_job()

    def approve_introduction_queued(self) -> dict[str, Any]:
        self.enqueue_job("collaboration-worker", "introduction-handshake", {"operation": "approve_introduction"})
        return self.process_next_job()

    def peer_decision_queued(self, accepted: bool) -> dict[str, Any]:
        self.enqueue_job("collaboration-worker", "introduction-handshake", {"operation": "peer_decision", "accepted": accepted})
        return self.process_next_job()

    def _connector(self, connector_id: str) -> sqlite3.Row:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM connector_registry WHERE connector_id = ?", (connector_id,)).fetchone()
        if row is None:
            raise DemoError("连接器不存在。")
        return row

    def _require_connector(self, connector_id: str) -> None:
        row = self._connector(connector_id)
        if not row["enabled"]:
            raise DemoError(f"连接器 {connector_id} 已停用，世界行动被阻断。")
        if row["status"] not in {"HEALTHY", "UNKNOWN"}:
            raise DemoError(f"连接器 {connector_id} 当前状态为 {row['status']}，世界行动被阻断。")

    def check_connector(self, connector_id: str) -> dict[str, Any]:
        row = self._connector(connector_id)
        status = "HEALTHY"
        details: dict[str, Any] = {}
        try:
            if connector_id == "github-remote/v1":
                remote = subprocess.run(
                    ["git", "remote", "get-url", "origin"], cwd=ROOT,
                    capture_output=True, text=True, timeout=4, check=True,
                ).stdout.strip()
                probe = subprocess.run(
                    ["git", "ls-remote", "--exit-code", "origin", "HEAD"], cwd=ROOT,
                    capture_output=True, text=True, timeout=10, check=True,
                )
                details = {"remote": remote, "head": probe.stdout.split()[0][:12], "write_tested": False}
            elif connector_id == "github-local-sandbox/v1":
                self.repo_root.mkdir(parents=True, exist_ok=True)
                if not os.access(self.repo_root, os.W_OK):
                    raise OSError("sandbox_not_writable")
                details = {"root": str(self.repo_root), "writable": True}
            elif connector_id == "agent-mailbox/v1":
                with self._connect() as conn:
                    conn.execute("SELECT 1 FROM mailbox_envelopes LIMIT 1").fetchone()
                details = {"storage": "LOCAL_SQLITE", "writable": True}
        except (OSError, subprocess.SubprocessError) as exc:
            status = "DEGRADED"
            details = {"reason": type(exc).__name__}
        checked_at = _iso(DEMO_NOW + timedelta(seconds=1))
        with self._connect() as conn:
            conn.execute(
                "UPDATE connector_registry SET status = ?, last_checked_at = ?, details = ? WHERE connector_id = ?",
                (status, checked_at, json.dumps(details, ensure_ascii=False), connector_id),
            )
        state = self._get_state()
        if state is not None:
            self._event(state, "personal-manager", "connector-health", "connector.checked", status, f"连接器 {connector_id} 健康检查完成。", {"connector": connector_id, "status": status})
        return self.snapshot()

    def set_connector_enabled(self, connector_id: str, enabled: bool) -> dict[str, Any]:
        self._connector(connector_id)
        with self._connect() as conn:
            conn.execute("UPDATE connector_registry SET enabled = ? WHERE connector_id = ?", (1 if enabled else 0, connector_id))
        state = self._get_state()
        if state is None:
            raise DemoError("Demo 尚未初始化。")
        if not enabled:
            for grant in state["connector_grants"]:
                if grant["connector"] == connector_id and grant["status"] in {"PENDING_APPROVAL", "ACTIVE"}:
                    grant["status"] = "REVOKED"
        self._save_state(state)
        self._event(state, "personal-manager", "connector-control", "connector.enabled" if enabled else "connector.disabled", "ALLOW_LOCAL_OWNER", f"连接器 {connector_id} 已{'启用' if enabled else '停用'}。", {"connector": connector_id, "enabled": enabled})
        return self.snapshot()

    def revoke_connector_grant(self, connector_id: str) -> dict[str, Any]:
        state = self._get_state()
        if state is None:
            raise DemoError("Demo 尚未初始化。")
        grant = next((item for item in state["connector_grants"] if item["connector"] == connector_id), None)
        if grant is None or grant["status"] not in {"PENDING_APPROVAL", "ACTIVE"}:
            raise DemoError("没有可撤销的连接器授权。")
        grant["status"] = "REVOKED"
        self._save_state(state)
        self._event(state, "boundary-worker", "connector-control", "connector.grant_revoked", "REVOKED", f"用户撤销 {connector_id} 的最小授权。", {"connector": connector_id, "scope": grant["scope"]})
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
        self._notify(state, "approval.capsule", "APPROVAL", f"审查发给 {candidate['display_name']} 的上下文", "Boundary Agent 已生成最小披露胶囊，需要你的二级批准。", "capsule")
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
        self._notify(state, "waiting.peer", "WAITING", f"等待 {state['selected_candidate']['display_name']} 回应", "介绍已安全送达，对方的私有上下文仍不可访问。", "capsule")
        return self.snapshot()

    def peer_decision(self, accepted: bool) -> dict[str, Any]:
        state = self._require("WAITING_PEER_APPROVAL")
        candidate = state["selected_candidate"]
        if not accepted:
            state["introduction"]["state"] = "declined"
            state["stage"] = "PEER_REJECTED"
            state["runtime_status"] = "FAILED"
            state["finished_at"] = _iso(DEMO_NOW + timedelta(minutes=2))
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
            self._notify(state, "peer.declined", "RESULT", f"{candidate['display_name']} 拒绝了介绍", "没有创建 Commitment，也没有执行任何世界动作。", "connected")
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
        self._notify(state, "approval.commitment", "APPROVAL", "需要三级强确认", f"{candidate['display_name']} 已同意，世界行动仍需你的最终批准。", "capsule")
        return self.snapshot()

    def approve_commitment(self) -> dict[str, Any]:
        state = self._require("COMMITMENT_PROPOSED")
        revoked = [grant["connector"] for grant in state["connector_grants"] if grant["status"] == "REVOKED"]
        if revoked:
            raise DemoError("连接器授权已撤销，不能执行世界行动：" + ", ".join(revoked))
        commitment_approval = f"apr-commit-{uuid4().hex[:6]}"
        state["commitment"]["party_a_approval"] = commitment_approval
        state["commitment"]["status"] = "accepted"
        for grant in state["connector_grants"]:
            if grant["status"] != "PENDING_APPROVAL":
                raise DemoError(f"连接器 {grant['connector']} 授权状态异常。")
            grant["status"] = "ACTIVE"
            grant["approval_id"] = commitment_approval
        state["stage"] = "WAITING_ACTION_EXECUTION"
        self._save_state(state)
        self._event(
            state,
            "personal-manager",
            "approval-engine",
            "commitment.approved",
            "ALLOW_L3",
            "Haipi 已强确认 Commitment；等待 Action Worker 执行审批范围内动作。",
            {"approval_id": commitment_approval, "commitment_hash": _hash(state["commitment"])},
        )
        return self.snapshot()

    def execute_approved_actions(self) -> dict[str, Any]:
        state = self._require("WAITING_ACTION_EXECUTION")
        commitment_approval = state["commitment"]["party_a_approval"]
        state["action_results"] = self._execute_world_actions(state, commitment_approval)
        state["world_changed"] = len(state["action_results"]) == 2
        state["stage"] = "WAITING_VERIFICATION"
        self._save_state(state)
        self._event(
            state,
            "action-worker",
            "action-execution",
            "actions.completed",
            "EXECUTED_WITH_GRANT",
            "Action Worker 已完成两项获批世界动作，等待独立 Verifier。",
            {"approval_id": commitment_approval, "actions": state["action_results"]},
        )
        return self.snapshot()

    def verify_world_actions(self) -> dict[str, Any]:
        state = self._require("WAITING_VERIFICATION")
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
        state["runtime_status"] = "COMPLETED" if passed else "FAILED"
        state["finished_at"] = _iso(DEMO_NOW + timedelta(minutes=5))
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
            self._notify(state, "run.verified", "RESULT", "世界变化已独立验证", "Repository 与 Agent Inbox 的两项变化均有证据，可信经验已写回。", "connected")
        return self.snapshot()

    def approve_and_verify_commitment(self) -> dict[str, Any]:
        self.approve_commitment()
        self.execute_approved_actions()
        return self.verify_world_actions()

    def approve_commitment_queued(self) -> dict[str, Any]:
        self.approve_commitment()
        self.enqueue_job("action-worker", "action-execution")
        action_state = self.process_next_job()
        action_job = action_state["worker_queue"]["jobs"][-1]
        if action_job["status"] != "SUCCEEDED":
            return action_state
        self.enqueue_job("verifier-worker", "commitment-verification")
        return self.process_next_job()

    def _execute_world_actions(self, state: dict[str, Any], approval_id: str) -> list[dict[str, Any]]:
        cached = self._cached_action_results(state["trace_id"])
        if len(cached) == 2:
            return cached
        self._require_connector("github-local-sandbox/v1")
        self._require_connector("agent-mailbox/v1")
        for connector_id in ("github-local-sandbox/v1", "agent-mailbox/v1"):
            grant = next((item for item in state["connector_grants"] if item["connector"] == connector_id), None)
            if grant is None or grant.get("status") != "ACTIVE" or grant.get("approval_id") != approval_id:
                raise DemoError(f"连接器 {connector_id} 缺少当前强审批授权。")
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
        next(item for item in state["connector_grants"] if item["connector"] == "github-local-sandbox/v1")["status"] = "USED"
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
        next(item for item in state["connector_grants"] if item["connector"] == "agent-mailbox/v1")["status"] = "USED"
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

    def search_memories(self, query: str = "") -> dict[str, Any]:
        normalized = query.strip().lower()
        terms = [term for term in normalized.replace("/", " ").split() if term]
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM memory_records ORDER BY created_at DESC"
            ).fetchall()
        items = []
        for row in rows:
            haystack = f"{row['kind']} {row['summary']} {row['trace_id']}".lower()
            score = sum(haystack.count(term) for term in terms) if terms else 1
            if terms and score == 0:
                continue
            items.append(
                {
                    "memory_id": row["memory_id"],
                    "trace_id": row["trace_id"],
                    "kind": row["kind"],
                    "summary": row["summary"],
                    "evidence": json.loads(row["evidence"]),
                    "created_at": row["created_at"],
                    "score": score,
                    "verified": True,
                }
            )
        items.sort(key=lambda item: (item["score"], item["created_at"]), reverse=True)
        return {"query": query, "total": len(items), "items": items}

    def forget_memory(self, memory_id: str) -> dict[str, Any]:
        state = self._get_state()
        if state is None:
            raise DemoError("Demo 尚未初始化。")
        with self._connect() as conn:
            row = conn.execute(
                "SELECT memory_id FROM memory_records WHERE memory_id = ?", (memory_id,)
            ).fetchone()
            if row is None:
                raise DemoError("Memory 不存在或已经被遗忘。")
            conn.execute("DELETE FROM memory_records WHERE memory_id = ?", (memory_id,))
        state["memory_updates"] = [
            item for item in state["memory_updates"] if item["memory_id"] != memory_id
        ]
        self._save_state(state)
        self._event(
            state,
            "personal-manager",
            "experience-memory",
            "memory.forgotten",
            "ALLOW_LOCAL_OWNER",
            "用户在本地 Memory Vault 中明确遗忘一条已验证经验。",
            {"memory_id": memory_id, "scope": "local"},
        )
        return self.search_memories()

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
        invocation_counts: dict[str, int] = {}
        for event in result["trace"]:
            invocation_counts[event["skill"]] = invocation_counts.get(event["skill"], 0) + 1
        latest_agent = result["trace"][-1]["agent"] if result["trace"] else None
        result["agents"] = [
            {
                "id": key,
                "name": value[0],
                "role": value[1],
                "status": "ACTIVE" if key == latest_agent else "READY",
                "events": sum(1 for event in result["trace"] if event["agent"] == key),
            }
            for key, value in AGENT_META.items()
        ]
        with self._connect() as conn:
            skill_rows = {row["skill_id"]: row for row in conn.execute("SELECT * FROM skill_registry").fetchall()}
        result["skills"] = [
            {
                "id": skill_id,
                "description": description,
                "version": skill_rows[skill_id]["version"],
                "status": skill_rows[skill_id]["status"],
                "enabled": bool(skill_rows[skill_id]["enabled"]),
                "updated_at": skill_rows[skill_id]["updated_at"],
                "invocations": invocation_counts.get(skill_id, 0),
            }
            for skill_id, description in SKILL_META
        ]
        result["stage_index"] = STAGE_ORDER.index(state["stage"]) if state["stage"] in STAGE_ORDER else -1
        result["stage_total"] = len(STAGE_ORDER) - 1
        run_list = self.list_runs()
        result["runtime"] = {
            "run_id": state["run_id"],
            "status": state["runtime_status"],
            "attempt": state["attempt"],
            "created_at": state["created_at"],
            "updated_at": state["updated_at"],
            "finished_at": state.get("finished_at"),
            "controls": {
                "can_pause": state["runtime_status"] == "RUNNING" and state["stage"] not in {"COMPLETED", "FAILED", "PEER_REJECTED"},
                "can_resume": state["runtime_status"] == "PAUSED",
                "can_cancel": state["runtime_status"] in {"RUNNING", "PAUSED"} and state["stage"] not in {"COMPLETED", "FAILED", "PEER_REJECTED"},
                "can_retry": state["runtime_status"] in {"CANCELLED", "FAILED"},
            },
            "history": run_list["items"],
        }
        result["privacy_invariants"] = [
            "Private Intent stays local",
            "Relationship graph never enters shared plane",
            "Outbound context requires policy + approval",
            "Executor and Verifier are separated",
        ]
        with self._connect() as conn:
            memory_count = conn.execute("SELECT COUNT(*) FROM memory_records").fetchone()[0]
            connector_rows = conn.execute("SELECT * FROM connector_registry ORDER BY connector_id").fetchall()
            job_rows = conn.execute("SELECT * FROM worker_jobs WHERE run_id = ? ORDER BY rowid", (state["run_id"],)).fetchall()
            unread_notifications = conn.execute("SELECT COUNT(*) FROM notifications WHERE status = 'UNREAD'").fetchone()[0]
            active_notifications = conn.execute("SELECT COUNT(*) FROM notifications WHERE status != 'ARCHIVED'").fetchone()[0]
            jobs = [
                {
                    "job_id": row["job_id"], "agent_id": row["agent_id"], "skill": row["skill"],
                    "status": row["status"], "attempt": row["attempt"], "max_attempts": row["max_attempts"],
                    "error": row["error"], "created_at": row["created_at"], "updated_at": row["updated_at"],
                }
                for row in job_rows
            ]
            result["worker_queue"] = {
                "jobs": jobs,
                "pending": sum(1 for job in jobs if job["status"] == "PENDING"),
                "running": sum(1 for job in jobs if job["status"] == "RUNNING"),
                "failed": sum(1 for job in jobs if job["status"] == "FAILED"),
                "succeeded": sum(1 for job in jobs if job["status"] == "SUCCEEDED"),
                "durable": True,
                "claim_mode": "SQLITE_IMMEDIATE",
            }
            result["notification_runtime"] = {
                "unread": unread_notifications,
                "total": active_notifications,
                "persistent": True,
            }
            result["connector_runtime"] = {
                "receipts": conn.execute("SELECT COUNT(*) FROM action_receipts WHERE trace_id = ?", (state["trace_id"],)).fetchone()[0],
                "mailbox_envelopes": conn.execute("SELECT COUNT(*) FROM mailbox_envelopes WHERE trace_id = ?", (state["trace_id"],)).fetchone()[0],
                "idempotent": True,
                "connectors": [
                    {
                        "id": row["connector_id"], "status": "DISABLED" if not row["enabled"] else row["status"],
                        "enabled": bool(row["enabled"]), "mode": row["mode"], "write_scope": row["capability"],
                        "last_checked_at": row["last_checked_at"], "details": json.loads(row["details"]),
                    }
                    for row in connector_rows
                ],
            }
            result["memory_runtime"] = {
                "records": memory_count,
                "verified_only": True,
                "storage": "LOCAL_SQLITE",
                "survives_task_reset": True,
            }
        return result
