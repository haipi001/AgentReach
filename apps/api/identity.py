"""Local owner identities and isolated Personal Agent sessions."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from typing import Any
from uuid import uuid4

from apps.api.service import DemoError, DemoService


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class LocalIdentityRuntime:
    """Selects one fully isolated DemoService database per local owner."""

    def __init__(self, legacy_db: Path | str) -> None:
        self.legacy_db = Path(legacy_db)
        self.root = self.legacy_db.parent / "profiles"
        self.registry_db = self.legacy_db.parent / "identity-registry.db"
        self.root.mkdir(parents=True, exist_ok=True)
        self._lock = RLock()
        self._services: dict[str, DemoService] = {}
        self._init_registry()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.registry_db)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_registry(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS local_identities (
                    profile_id TEXT PRIMARY KEY,
                    display_name TEXT NOT NULL,
                    agent_name TEXT NOT NULL,
                    db_path TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    last_active_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS local_session (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    session_id TEXT NOT NULL,
                    active_profile_id TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                """
            )
            profile = conn.execute("SELECT profile_id FROM local_identities ORDER BY rowid LIMIT 1").fetchone()
            if profile is None:
                created = _now()
                conn.execute(
                    "INSERT INTO local_identities VALUES ('local-owner', '本机所有者', 'HAIPI', ?, ?, ?)",
                    (str(self.legacy_db), created, created),
                )
                active_id = "local-owner"
            else:
                active_id = profile["profile_id"]
            conn.execute(
                "INSERT OR IGNORE INTO local_session VALUES (1, ?, ?, ?)",
                (f"session-{uuid4().hex[:12]}", active_id, _now()),
            )

    def _active_row(self) -> sqlite3.Row:
        with self._connect() as conn:
            row = conn.execute(
                """SELECT i.*, s.session_id FROM local_session s
                JOIN local_identities i ON i.profile_id = s.active_profile_id WHERE s.id = 1"""
            ).fetchone()
        if row is None:
            raise DemoError("本地身份会话不可用。")
        return row

    def _service(self) -> DemoService:
        row = self._active_row()
        profile_id = row["profile_id"]
        with self._lock:
            if profile_id not in self._services:
                self._services[profile_id] = DemoService(Path(row["db_path"]))
            return self._services[profile_id]

    def _identity_payload(self) -> dict[str, Any]:
        active = self._active_row()
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT profile_id, display_name, agent_name, created_at, last_active_at FROM local_identities ORDER BY rowid"
            ).fetchall()
        return {
            "session_id": active["session_id"],
            "active_profile_id": active["profile_id"],
            "local_only": True,
            "profiles": [dict(row) | {"active": row["profile_id"] == active["profile_id"]} for row in rows],
        }

    def identities(self) -> dict[str, Any]:
        return self._identity_payload()

    def create_identity(self, display_name: str, agent_name: str) -> dict[str, Any]:
        display_name = display_name.strip()
        agent_name = agent_name.strip()
        if not display_name or not agent_name:
            raise DemoError("身份名称和 AI 名称不能为空。")
        with self._connect() as conn:
            if conn.execute("SELECT COUNT(*) FROM local_identities").fetchone()[0] >= 5:
                raise DemoError("本地身份最多创建 5 个。")
            profile_id = f"profile-{uuid4().hex[:8]}"
            db_path = self.root / f"{profile_id}.db"
            created = _now()
            conn.execute(
                "INSERT INTO local_identities VALUES (?, ?, ?, ?, ?, ?)",
                (profile_id, display_name, agent_name, str(db_path), created, created),
            )
        self.switch_identity(profile_id)
        return self._identity_payload()

    def switch_identity(self, profile_id: str) -> dict[str, Any]:
        with self._lock, self._connect() as conn:
            row = conn.execute("SELECT profile_id FROM local_identities WHERE profile_id = ?", (profile_id,)).fetchone()
            if row is None:
                raise DemoError("本地身份不存在。")
            session_id = f"session-{uuid4().hex[:12]}"
            now = _now()
            conn.execute("UPDATE local_identities SET last_active_at = ? WHERE profile_id = ?", (now, profile_id))
            conn.execute(
                "UPDATE local_session SET session_id = ?, active_profile_id = ?, updated_at = ? WHERE id = 1",
                (session_id, profile_id, now),
            )
        self._service()
        return self._identity_payload()

    def snapshot(self) -> dict[str, Any]:
        return self._augment(self._service().snapshot())

    def reset(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        return self._augment(self._service().reset(*args, **kwargs))

    def _augment(self, result: Any) -> Any:
        if isinstance(result, dict) and "stage" in result:
            normalized = dict(result)
            normalized.setdefault("human_request", None)
            return normalized | {"identity_runtime": self._identity_payload()}
        return result

    def __getattr__(self, name: str) -> Any:
        target = getattr(self._service(), name)
        if not callable(target):
            return target

        def invoke(*args: Any, **kwargs: Any) -> Any:
            return self._augment(target(*args, **kwargs))

        return invoke
