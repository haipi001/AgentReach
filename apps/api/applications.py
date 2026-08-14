"""Read-only local application authority for the AgentReach world model."""

from __future__ import annotations

import plistlib
import platform
from datetime import datetime, timezone
from pathlib import Path


KNOWN_APPLICATIONS = (
    ("chrome", "Chrome", ("Google Chrome.app",)),
    ("vscode", "VS Code", ("Visual Studio Code.app",)),
    ("excel", "Excel", ("Microsoft Excel.app",)),
    ("notion", "Notion", ("Notion.app",)),
    ("feishu", "飞书", ("Lark.app", "Feishu.app", "LarkSuite.app")),
    ("slack", "Slack", ("Slack.app",)),
    ("mail", "Mail", ("Mail.app",)),
    ("calendar", "Calendar", ("Calendar.app",)),
    ("figma", "Figma", ("Figma.app",)),
    ("finder", "Finder / Files", ("Finder.app",)),
    ("terminal", "Terminal", ("Terminal.app", "iTerm.app")),
)


class ApplicationAuthority:
    """Discovers known macOS apps without requesting or implying control."""

    def __init__(self, roots: tuple[Path, ...] | None = None):
        self.roots = roots or (
            Path("/Applications"),
            Path.home() / "Applications",
            Path("/System/Applications"),
            Path("/System/Applications/Utilities"),
            Path("/System/Library/CoreServices"),
        )

    def _locate(self, candidates: tuple[str, ...]) -> Path | None:
        for root in self.roots:
            for candidate in candidates:
                path = root / candidate
                if path.is_dir():
                    return path.resolve()
        return None

    @staticmethod
    def _metadata(path: Path) -> dict[str, str | None]:
        plist = path / "Contents" / "Info.plist"
        try:
            with plist.open("rb") as handle:
                info = plistlib.load(handle)
        except (OSError, plistlib.InvalidFileException):
            info = {}
        return {
            "bundle_id": info.get("CFBundleIdentifier"),
            "version": info.get("CFBundleShortVersionString") or info.get("CFBundleVersion"),
        }

    def snapshot(self) -> dict:
        applications = []
        for app_id, name, candidates in KNOWN_APPLICATIONS:
            path = self._locate(candidates)
            metadata = self._metadata(path) if path else {"bundle_id": None, "version": None}
            applications.append({
                "id": app_id,
                "name": name,
                "installed": path is not None,
                "path": str(path) if path else None,
                **metadata,
                "authority": "NONE",
                "status": "UNAUTHORIZED" if path else "NOT_INSTALLED",
                "control_surfaces": [],
                "learned_procedures": 0,
                "observed_routines": 0,
                "permissions": {"observe": False, "read": False, "write": False, "automate": False},
            })
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "host": {"system": platform.system(), "machine": platform.machine()},
            "read_only": True,
            "installed": sum(1 for item in applications if item["installed"]),
            "total": len(applications),
            "applications": applications,
        }
