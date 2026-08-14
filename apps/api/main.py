from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from apps.api.identity import LocalIdentityRuntime
from apps.api.applications import ApplicationAuthority
from apps.api.compute import ComputeAuthority
from apps.api.files_devices import FileDeviceAuthority
from apps.api.service import DEFAULT_DB, DemoError, ROOT

DB_PATH = Path(os.environ.get("AGENTREACH_PERSONAL_DB", DEFAULT_DB))
ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get("AGENTREACH_ALLOWED_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000").split(",") if origin.strip()]
service = LocalIdentityRuntime(DB_PATH)
application_authority = ApplicationAuthority()
compute_authority = ComputeAuthority()
file_device_authority = FileDeviceAuthority(ROOT)
if os.environ.get("AGENTREACH_RESET_ON_START", "0") == "1":
    service.reset()
app = FastAPI(
    title="AgentReach Demo API",
    version="0.1.0",
    description="Deterministic Human ↔ Personal Agent ↔ Personal Agent demo.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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


class MemorySearchRequest(BaseModel):
    query: str = Field(default="", max_length=200)


class MemoryForgetRequest(BaseModel):
    memory_id: str = Field(min_length=1, max_length=100)


class ConnectorRequest(BaseModel):
    connector_id: str = Field(min_length=1, max_length=100)


class ConnectorToggleRequest(ConnectorRequest):
    enabled: bool


class SkillToggleRequest(BaseModel):
    skill_id: str = Field(min_length=1, max_length=100)
    enabled: bool


class WorkerJobRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=100)


class NotificationRequest(BaseModel):
    notification_id: str = Field(min_length=1, max_length=100)


class RunRequest(BaseModel):
    run_id: str = Field(min_length=1, max_length=100)


class IdentityCreateRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=40)
    agent_name: str = Field(min_length=1, max_length=40)


class IdentitySwitchRequest(BaseModel):
    profile_id: str = Field(min_length=1, max_length=100)


class OutboxRetryRequest(BaseModel):
    outbox_id: str = Field(min_length=1, max_length=100)


class IdentityRestoreRequest(BaseModel):
    backup: dict
    display_name: str | None = Field(default=None, max_length=40)


class IdentityUpdateRequest(BaseModel):
    profile_id: str = Field(min_length=1, max_length=100)
    display_name: str = Field(min_length=1, max_length=40)
    agent_name: str = Field(min_length=1, max_length=40)


class IdentityDeleteRequest(BaseModel):
    profile_id: str = Field(min_length=1, max_length=100)


class RoutinePolicyRequest(BaseModel):
    routine_id: str = Field(min_length=1, max_length=120)
    policy: str = Field(min_length=1, max_length=40)


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


@app.get("/api/local-world/applications")
def list_local_applications():
    return application_authority.snapshot()


@app.get("/api/local-world/routines")
def list_routines():
    return service.routine_learning()


@app.get("/api/local-world/compute")
def read_compute():
    return compute_authority.snapshot()


@app.get("/api/local-world/files-devices")
def read_files_devices():
    return file_device_authority.snapshot(service.snapshot().get("evidence", []))


@app.post("/api/local-world/routines/policy")
def update_routine_policy(payload: RoutinePolicyRequest):
    return call(service.set_routine_policy, payload.routine_id, payload.policy)


@app.get("/api/identities")
def list_identities():
    return service.identities()


@app.post("/api/identities")
def create_identity(payload: IdentityCreateRequest):
    return call(service.create_identity, payload.display_name, payload.agent_name)


@app.post("/api/identities/switch")
def switch_identity(payload: IdentitySwitchRequest):
    call(service.switch_identity, payload.profile_id)
    return service.snapshot()


@app.get("/api/identities/export")
def export_identity():
    return call(service.export_active_identity)


@app.post("/api/identities/restore")
def restore_identity(payload: IdentityRestoreRequest):
    call(service.restore_identity, payload.backup, payload.display_name)
    return service.snapshot()


@app.post("/api/identities/rename")
def rename_identity(payload: IdentityUpdateRequest):
    return call(service.rename_identity, payload.profile_id, payload.display_name, payload.agent_name)


@app.post("/api/identities/delete")
def delete_identity(payload: IdentityDeleteRequest):
    return call(service.delete_identity, payload.profile_id)


@app.post("/api/demo/reset")
def reset_demo():
    return service.reset()


@app.post("/api/demo/intent")
def structure_intent(payload: IntentRequest):
    return call(service.structure_intent, payload.request)


@app.post("/api/runtime/start")
def start_task(payload: IntentRequest):
    return call(service.start_task, payload.request)


@app.post("/api/demo/discover")
def discover():
    return call(service.discover)


@app.post("/api/demo/select")
def select_candidate(payload: CandidateRequest):
    return call(service.select_candidate_queued, payload.candidate_id)


@app.post("/api/demo/approve-introduction")
def approve_introduction():
    return call(service.approve_introduction_queued)


@app.post("/api/demo/peer-decision")
def peer_decision(payload: PeerDecisionRequest):
    return call(service.peer_decision_queued, payload.accepted)


@app.post("/api/demo/approve-commitment")
def approve_commitment():
    return call(service.approve_commitment_queued)


@app.post("/api/demo/privacy-attack")
def privacy_attack():
    return call(service.deny_privacy_request)


@app.post("/api/runtime/pause")
def pause_run():
    return call(service.pause_run)


@app.post("/api/runtime/resume")
def resume_run():
    return call(service.resume_run)


@app.post("/api/runtime/cancel")
def cancel_run():
    return call(service.cancel_run)


@app.post("/api/runtime/retry")
def retry_run():
    return call(service.retry_run)


@app.post("/api/runtime/jobs/process-next")
def process_next_job():
    return call(service.process_next_job)


@app.post("/api/runtime/jobs/retry")
def retry_worker_job(payload: WorkerJobRequest):
    return call(service.retry_job, payload.job_id)


@app.post("/api/runtime/outbox/retry")
def retry_outbox_action(payload: OutboxRetryRequest):
    return call(service.retry_outbox_action, payload.outbox_id)


@app.get("/api/runtime/runs")
def list_runs():
    return service.list_runs()


@app.get("/api/runtime/metrics")
def runtime_metrics():
    return service.operational_metrics()


@app.post("/api/runtime/switch")
def switch_run(payload: RunRequest):
    return call(service.switch_run, payload.run_id)


@app.get("/api/notifications")
def list_notifications():
    return service.list_notifications()


@app.post("/api/notifications/read")
def read_notification(payload: NotificationRequest):
    return call(service.read_notification, payload.notification_id)


@app.post("/api/notifications/read-all")
def read_all_notifications():
    return service.read_all_notifications()


@app.post("/api/notifications/archive")
def archive_notification(payload: NotificationRequest):
    return call(service.archive_notification, payload.notification_id)


@app.post("/api/connectors/check")
def check_connector(payload: ConnectorRequest):
    return call(service.check_connector, payload.connector_id)


@app.post("/api/connectors/toggle")
def toggle_connector(payload: ConnectorToggleRequest):
    return call(service.set_connector_enabled, payload.connector_id, payload.enabled)


@app.post("/api/skills/toggle")
def toggle_skill(payload: SkillToggleRequest):
    return call(service.set_skill_enabled, payload.skill_id, payload.enabled)


@app.post("/api/connectors/revoke-grant")
def revoke_connector_grant(payload: ConnectorRequest):
    return call(service.revoke_connector_grant, payload.connector_id)


@app.post("/api/memory/search")
def search_memory(payload: MemorySearchRequest):
    return call(service.search_memories, payload.query)


@app.post("/api/memory/forget")
def forget_memory(payload: MemoryForgetRequest):
    return call(service.forget_memory, payload.memory_id)
