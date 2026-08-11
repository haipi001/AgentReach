#!/usr/bin/env python3
"""Start the AgentReach local demo."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

if __name__ == "__main__":
    uvicorn.run(
        "apps.api.main:app",
        host=os.environ.get("AGENTREACH_HOST", "127.0.0.1"),
        port=int(os.environ.get("AGENTREACH_PORT", "8765")),
        reload=False,
    )
