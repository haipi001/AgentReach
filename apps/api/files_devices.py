from __future__ import annotations

import json
import mimetypes
import os
import platform
import subprocess
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

import psutil


def _iso(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp, timezone.utc).isoformat()


def _human_bytes(size: int) -> str:
    value = float(size)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if value < 1024 or unit == "TB":
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{value:.1f} TB"


def _walk_names(value: Any) -> list[str]:
    names: list[str] = []
    if isinstance(value, dict):
        if isinstance(value.get("_name"), str):
            names.append(value["_name"])
        for child in value.values():
            names.extend(_walk_names(child))
    elif isinstance(value, list):
        for child in value:
            names.extend(_walk_names(child))
    return names


@lru_cache(maxsize=1)
def _attached_hardware() -> dict:
    if platform.system() != "Darwin":
        return {"displays": [], "usb": []}
    try:
        result = subprocess.run(
            ["/usr/sbin/system_profiler", "SPDisplaysDataType", "SPUSBDataType", "-json", "-detailLevel", "mini"],
            capture_output=True, text=True, timeout=6, check=True,
        )
        payload = json.loads(result.stdout)
        display_names = [name for name in _walk_names(payload.get("SPDisplaysDataType", [])) if "display" in name.lower() or "显示" in name]
        usb_names = [name for name in _walk_names(payload.get("SPUSBDataType", [])) if name.lower() not in {"usb", "usb 3.1 bus", "usb 3.0 bus"}]
        return {"displays": list(dict.fromkeys(display_names)), "usb": list(dict.fromkeys(usb_names))}
    except (OSError, subprocess.SubprocessError, ValueError, TypeError):
        return {"displays": [], "usb": []}


class FileDeviceAuthority:
    """Bounded, read-only inventory. Policy scopes are not inferred from OS permissions."""

    def __init__(self, workspace_root: Path | str) -> None:
        self.workspace_root = Path(workspace_root).resolve()

    def _scopes(self) -> list[dict]:
        home = Path.home().resolve()
        return [
            {"id": "workspace", "name": "AgentReach 工作区", "path": str(self.workspace_root), "read": True, "write": False, "sensitive": False, "reason": "当前项目已进入本地工作上下文"},
            {"id": "runtime-world", "name": "受控运行世界", "path": str((self.workspace_root / "data" / "demo-world").resolve()), "read": True, "write": True, "sensitive": False, "reason": "仅由审批后的 Action Outbox 写入"},
            {"id": "evidence", "name": "验证证据", "path": str((self.workspace_root / "artifacts").resolve()), "read": True, "write": False, "sensitive": False, "reason": "Verifier 可追加，AI 只读"},
            {"id": "downloads", "name": "下载目录", "path": str(home / "Downloads"), "read": False, "write": False, "sensitive": True, "reason": "未授予目录访问"},
            {"id": "documents", "name": "个人文档", "path": str(home / "Documents"), "read": False, "write": False, "sensitive": True, "reason": "默认敏感，禁止遍历"},
        ]

    def _recent_files(self, scopes: list[dict]) -> list[dict]:
        files_by_path: dict[str, dict] = {}
        ignored = {".git", ".next", "node_modules", "__pycache__", ".pytest_cache", "tmp"}
        for scope in scopes:
            if not scope["read"]:
                continue
            root = Path(scope["path"])
            if not root.exists():
                continue
            candidates: list[Path] = []
            try:
                for directory, names, filenames in os.walk(root):
                    names[:] = [name for name in names if name not in ignored and not name.startswith(".")]
                    candidates.extend(Path(directory) / name for name in filenames if not name.startswith("."))
                    if len(candidates) >= 1200:
                        break
            except (OSError, PermissionError):
                continue
            for path in candidates[:1200]:
                try:
                    resolved = path.resolve()
                    resolved.relative_to(root.resolve())
                    stat = resolved.stat()
                    files_by_path[str(resolved)] = {
                        "id": f"{scope['id']}:{resolved.relative_to(root)}", "name": resolved.name,
                        "relative_path": str(resolved.relative_to(root)), "scope_id": scope["id"], "scope_name": scope["name"],
                        "mime": mimetypes.guess_type(resolved.name)[0] or "application/octet-stream",
                        "size": stat.st_size, "size_label": _human_bytes(stat.st_size), "modified_at": _iso(stat.st_mtime),
                        "readable": True, "writable": bool(scope["write"]),
                    }
                except (OSError, ValueError):
                    continue
        return sorted(files_by_path.values(), key=lambda item: item["modified_at"], reverse=True)[:16]

    def _devices(self) -> list[dict]:
        attached = _attached_hardware()
        devices = [{
            "id": "host", "kind": "MAC", "name": platform.node() or "当前 Mac", "status": "ONLINE",
            "connection": "LOCAL", "authority": "READ_ONLY", "detail": f"{platform.machine()} · 当前运行节点",
        }]
        for index, name in enumerate(attached["displays"]):
            devices.append({"id": f"display-{index}", "kind": "DISPLAY", "name": name, "status": "ONLINE", "connection": "LOCAL", "authority": "NONE", "detail": "只检测连接状态"})
        for index, name in enumerate(attached["usb"]):
            lower = name.lower()
            kind = "PHONE" if "iphone" in lower else "TABLET" if "ipad" in lower else "STORAGE" if any(word in lower for word in ("disk", "ssd", "storage")) else "USB"
            devices.append({"id": f"usb-{index}", "kind": kind, "name": name, "status": "ONLINE", "connection": "USB", "authority": "NONE", "detail": "未读取设备内容"})
        for partition in psutil.disk_partitions(all=False):
            if partition.mountpoint.startswith("/Volumes/"):
                devices.append({"id": f"volume-{len(devices)}", "kind": "STORAGE", "name": Path(partition.mountpoint).name, "status": "ONLINE", "connection": "VOLUME", "authority": "NONE", "detail": f"{partition.fstype or '文件系统'} · 未授权内容访问"})
        return devices

    def snapshot(self, evidence: list[dict] | None = None) -> dict:
        scopes = self._scopes()
        artifacts = []
        for index, item in enumerate(evidence or []):
            path = item.get("path")
            artifacts.append({
                "id": f"evidence-{index}", "type": str(item.get("type", "evidence")), "label": str(item.get("label", "未命名证据")),
                "verified": bool(item.get("verified")), "path": str(path) if path else None,
                "exists": bool(path and Path(path).exists()),
            })
        devices = self._devices()
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(), "read_only": True,
            "policy": "DENY_BY_DEFAULT", "scopes": scopes, "recent_files": self._recent_files(scopes),
            "evidence_artifacts": artifacts, "devices": devices,
            "summary": {"readable_scopes": sum(1 for item in scopes if item["read"]), "writable_scopes": sum(1 for item in scopes if item["write"]), "sensitive_scopes": sum(1 for item in scopes if item["sensitive"]), "online_devices": sum(1 for item in devices if item["status"] == "ONLINE")},
        }
