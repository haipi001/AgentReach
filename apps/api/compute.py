from __future__ import annotations

import json
import os
import platform
import subprocess
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

import psutil


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@lru_cache(maxsize=1)
def _apple_hardware() -> dict:
    if platform.system() != "Darwin":
        return {}
    try:
        result = subprocess.run(
            ["/usr/sbin/system_profiler", "SPHardwareDataType", "SPDisplaysDataType", "-json", "-detailLevel", "mini"],
            capture_output=True, text=True, timeout=5, check=True,
        )
        payload = json.loads(result.stdout)
        hardware = (payload.get("SPHardwareDataType") or [{}])[0]
        display = (payload.get("SPDisplaysDataType") or [{}])[0]
        return {
            "model": hardware.get("machine_model") or hardware.get("_name"),
            "chip": hardware.get("chip_type"),
            "memory_label": hardware.get("physical_memory"),
            "gpu": display.get("sppci_model") or display.get("_name"),
            "gpu_cores": int(display.get("sppci_cores", 0) or 0),
        }
    except (OSError, subprocess.SubprocessError, ValueError, TypeError):
        return {}


def _probe_models(url: str, field: str) -> tuple[str, list[str]]:
    try:
        request = Request(url, headers={"Accept": "application/json"})
        with urlopen(request, timeout=.35) as response:
            payload = json.loads(response.read().decode("utf-8"))
        items = payload.get(field, [])
        names = [str(item.get("name") or item.get("id")) for item in items if isinstance(item, dict) and (item.get("name") or item.get("id"))]
        return "HEALTHY", names
    except (URLError, OSError, TimeoutError, ValueError, json.JSONDecodeError):
        return "UNAVAILABLE", []


class ComputeAuthority:
    """Read-only host compute inventory and model endpoint health."""

    def snapshot(self) -> dict:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage(str(Path.home()))
        cpu_percent = psutil.cpu_percent(interval=.08)
        logical = psutil.cpu_count(logical=True) or 0
        physical = psutil.cpu_count(logical=False) or logical
        hardware = _apple_hardware()
        ollama_status, ollama_models = _probe_models("http://127.0.0.1:11434/api/tags", "models")
        vllm_status, vllm_models = _probe_models("http://127.0.0.1:8000/v1/models", "data")
        providers = [
            {"id": "ollama", "name": "Ollama", "kind": "LOCAL", "status": ollama_status, "models": ollama_models},
            {"id": "vllm", "name": "vLLM", "kind": "LOCAL", "status": vllm_status, "models": vllm_models},
            {"id": "openai", "name": "OpenAI", "kind": "CLOUD", "status": "CONFIGURED" if os.environ.get("OPENAI_API_KEY") else "NOT_CONFIGURED", "models": []},
            {"id": "anthropic", "name": "Anthropic", "kind": "CLOUD", "status": "CONFIGURED" if os.environ.get("ANTHROPIC_API_KEY") else "NOT_CONFIGURED", "models": []},
            {"id": "gemini", "name": "Gemini", "kind": "CLOUD", "status": "CONFIGURED" if (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")) else "NOT_CONFIGURED", "models": []},
        ]
        local = next((provider for provider in providers if provider["kind"] == "LOCAL" and provider["status"] == "HEALTHY"), None)
        cloud = next((provider for provider in providers if provider["kind"] == "CLOUD" and provider["status"] == "CONFIGURED"), None)
        selected = local or cloud
        route = "LOCAL" if local else "CLOUD" if cloud else "UNAVAILABLE"
        reason = f"本地优先：{selected['name']} 可用" if local else f"本地模型不可用，使用已配置的 {selected['name']}" if cloud else "未发现可用的本地模型服务或云端凭据"
        return {
            "generated_at": _now(), "read_only": True,
            "hardware": {
                "host": platform.node(), "system": platform.system(), "architecture": platform.machine(),
                "model": hardware.get("model") or platform.machine(), "chip": hardware.get("chip") or platform.processor() or "未知",
                "gpu": hardware.get("gpu") or "未识别", "gpu_cores": hardware.get("gpu_cores", 0),
                "cpu_physical_cores": physical, "cpu_logical_cores": logical,
            },
            "resources": {
                "cpu_percent": round(cpu_percent, 1),
                "memory_total_gb": round(memory.total / 1024 ** 3, 1), "memory_used_gb": round(memory.used / 1024 ** 3, 1), "memory_percent": round(memory.percent, 1),
                "disk_total_gb": round(disk.total / 1024 ** 3, 1), "disk_used_gb": round(disk.used / 1024 ** 3, 1), "disk_percent": round(disk.percent, 1),
            },
            "providers": providers,
            "router": {"policy": "LOCAL_FIRST", "route": route, "provider": selected["id"] if selected else None, "reason": reason},
        }
