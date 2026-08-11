export type AgentState = "idle" | "thinking" | "searching" | "waiting_approval" | "connected";
export type ViewMode = "self" | "reach" | "capsule" | "connected";
export type PersonaForm = "human" | "monolith" | "orbital" | "totem";
export type PersonaFinish = "matte" | "chrome" | "porcelain";

export type PersonaConfig = {
  name: string;
  form: PersonaForm;
  finish: PersonaFinish;
  accent: "lichen" | "cobalt" | "ember";
  aura: number;
};

export type Candidate = {
  id: string;
  agent: string;
  display_name: string;
  score_percent: number;
  reasons: string[];
};

export type TraceEvent = {
  sequence: number;
  agent: string;
  agent_label: string;
  event_type: string;
  decision: string;
  summary: string;
};

export type DemoState = {
  stage: string;
  trace_id: string;
  candidates: Candidate[];
  selected_candidate: Candidate | null;
  capsule: Record<string, unknown> | null;
  removed_fields: string[];
  commitment: { objective: string; status: string; parties: string[] } | null;
  verification: { verdict: string; checks: { name: string; passed: boolean }[] } | null;
  privacy_denials: { decision: string; reason: string }[];
  entities: { id: string; type: string; name: string; plane: string }[];
  action_plan: { id: string; actor: string; target: string; action: string }[];
  action_results: { action_id: string; status: string; target: string; connector: string }[];
  evidence: { type: string; label: string; verified: boolean; path?: string; envelope_id?: string }[];
  memory_updates: { memory_id: string; kind: string; summary: string }[];
  world_changed: boolean;
  trace: TraceEvent[];
};
