from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from apps.api.service import DEFAULT_DB, DemoError, DemoService, ROOT

DB_PATH = Path(os.environ.get("AGENTREACH_PERSONAL_DB", DEFAULT_DB))
service = DemoService(DB_PATH)
if os.environ.get("AGENTREACH_RESET_ON_START", "1") == "1":
    service.reset()
app = FastAPI(
    title="AgentReach Demo API",
    version="0.1.0",
    description="Deterministic Human ↔ Personal Agent ↔ Personal Agent demo.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class IntentRequest(BaseModel):
    request: str = Field(min_length=1, max_length=500)


class CandidateRequest(BaseModel):
    candidate_id: str


class PeerDecisionRequest(BaseModel):
    accepted: bool


def call(action, *args):
    try:
        return action(*args)
    except DemoError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/", include_in_schema=False)
def index():
    return {
        "service": "agentreach-demo-api",
        "status": "ok",
        "frontend": "http://127.0.0.1:3000",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "agentreach-demo", "version": "0.1.0"}


@app.get("/api/demo")
def get_demo():
    return service.snapshot()


@app.post("/api/demo/reset")
def reset_demo():
    return service.reset()


@app.post("/api/demo/intent")
def structure_intent(payload: IntentRequest):
    return call(service.structure_intent, payload.request)


@app.post("/api/demo/discover")
def discover():
    return call(service.discover)


@app.post("/api/demo/select")
def select_candidate(payload: CandidateRequest):
    return call(service.select_candidate, payload.candidate_id)


@app.post("/api/demo/approve-introduction")
def approve_introduction():
    return call(service.approve_introduction)


@app.post("/api/demo/peer-decision")
def peer_decision(payload: PeerDecisionRequest):
    return call(service.peer_decision, payload.accepted)


@app.post("/api/demo/approve-commitment")
def approve_commitment():
    return call(service.approve_and_verify_commitment)


@app.post("/api/demo/privacy-attack")
def privacy_attack():
    return call(service.deny_privacy_request)
