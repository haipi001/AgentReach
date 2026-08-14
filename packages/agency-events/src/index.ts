export const AGENCY_EVENT_TYPES = [
  "agent.state.changed", "intent.created", "entity.discovered", "approval.required",
  "approval.resolved", "action.started", "action.completed", "verification.started",
  "verification.passed", "verification.failed", "evidence.created", "memory.updated",
  "capability.loaded", "capability.unloaded", "interface.proposal.created", "interface.updated",
] as const;

export type AgencyEventType = typeof AGENCY_EVENT_TYPES[number];
export type OrbState = "idle" | "thinking" | "searching" | "waiting-approval" | "acting" | "verifying" | "connected" | "error";

export interface AgencyEvent<T = Readonly<Record<string, unknown>>> {
  id: string;
  type: AgencyEventType;
  occurredAt: string;
  runId?: string;
  traceId?: string;
  source: "runtime" | "human" | "interface";
  payload: T;
}

export interface AgencySnapshot {
  stage: string;
  trace_id?: string;
  human_request?: string | null;
  candidates?: readonly { id: string; display_name: string }[];
  evidence?: readonly { type: string; label: string; verified: boolean }[];
  memory_updates?: readonly { memory_id: string; kind: string; summary: string }[];
  action_plan?: readonly { id: string; actor: string; target: string; action: string }[];
  action_results?: readonly { action_id: string; status: string }[];
  verification?: { verdict: string } | null;
  runtime?: { run_id: string; status: string; updated_at: string };
}

function event<T extends Readonly<Record<string, unknown>>>(snapshot: AgencySnapshot, type: AgencyEventType, suffix: string, payload: T): AgencyEvent<T> {
  const runId = snapshot.runtime?.run_id;
  return { id: `${runId ?? "local"}:${type}:${suffix}`, type, occurredAt: snapshot.runtime?.updated_at ?? new Date(0).toISOString(), runId, traceId: snapshot.trace_id, source: "runtime", payload };
}

export function eventsFromSnapshot(snapshot: AgencySnapshot): AgencyEvent[] {
  const events: AgencyEvent[] = [event(snapshot, "agent.state.changed", snapshot.stage, { stage: snapshot.stage, state: orbStateFromStage(snapshot.stage, snapshot.runtime?.status) })];
  if (snapshot.human_request) events.push(event(snapshot, "intent.created", "intent", { request: snapshot.human_request, private: true }));
  for (const candidate of snapshot.candidates ?? []) events.push(event(snapshot, "entity.discovered", candidate.id, { entityId: candidate.id, name: candidate.display_name, kind: "person" }));
  if (snapshot.stage.startsWith("WAITING_") || snapshot.stage === "COMMITMENT_PROPOSED") events.push(event(snapshot, "approval.required", snapshot.stage, { stage: snapshot.stage }));
  if ((snapshot.action_plan?.length ?? 0) > 0) events.push(event(snapshot, "action.started", "plan", { count: snapshot.action_plan?.length ?? 0 }));
  for (const result of snapshot.action_results ?? []) if (result.status === "SUCCEEDED") events.push(event(snapshot, "action.completed", result.action_id, { actionId: result.action_id }));
  for (const proof of snapshot.evidence ?? []) events.push(event(snapshot, "evidence.created", proof.type, { kind: proof.type, label: proof.label, verified: proof.verified }));
  if (snapshot.verification) events.push(event(snapshot, snapshot.verification.verdict === "VERIFIED" ? "verification.passed" : "verification.failed", "verification", { verdict: snapshot.verification.verdict }));
  for (const memory of snapshot.memory_updates ?? []) events.push(event(snapshot, "memory.updated", memory.memory_id, { memoryId: memory.memory_id, kind: memory.kind, summary: memory.summary }));
  return events;
}

export function orbStateFromStage(stage?: string, runtimeStatus?: string): OrbState {
  if (runtimeStatus === "FAILED" || runtimeStatus === "CANCELLED") return "error";
  if (stage === "COMPLETED") return "connected";
  if (stage === "WAITING_VERIFICATION") return "verifying";
  if (stage === "WAITING_ACTION_EXECUTION") return "acting";
  if (stage?.startsWith("WAITING_") || stage === "COMMITMENT_PROPOSED") return "waiting-approval";
  if (stage === "CANDIDATES_FOUND" || stage === "INTRO_SENT") return "searching";
  if (stage && stage !== "CREATED") return "thinking";
  return "idle";
}
