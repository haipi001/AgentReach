export type AgentState = "idle" | "thinking" | "searching" | "waiting_approval" | "connected";
export type ViewMode = "self" | "reach" | "capsule" | "connected";
export type PersonaForm = "human" | "monolith" | "orbital" | "totem";
export type PersonaFinish = "matte" | "chrome" | "porcelain";
export type FaceShape = "soft" | "oval" | "angular";
export type SkinTone = "porcelain" | "warm" | "umber" | "deep";
export type EyeColor = "charcoal" | "hazel" | "moss";
export type HairStyle = "hood" | "short" | "bob" | "bare";
export type HairColor = "ink" | "brown" | "silver";

export type FaceConfig = {
  shape: FaceShape;
  skin: SkinTone;
  eyes: EyeColor;
  hairStyle: HairStyle;
  hairColor: HairColor;
};

export type PersonaConfig = {
  name: string;
  form: PersonaForm;
  finish: PersonaFinish;
  accent: "lichen" | "cobalt" | "ember";
  aura: number;
  face: FaceConfig;
};

export type ExperiencePlane = "self" | "agency" | "world" | "evidence";

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
  agents: { id: string; name: string; role: string; status: "ACTIVE" | "READY"; events: number }[];
  skills: { id: string; description: string; version: string; status: string; invocations: number }[];
  connector_grants: { connector: string; scope: string; status: string; approval_id?: string }[];
  connector_runtime: {
    receipts: number;
    mailbox_envelopes: number;
    idempotent: boolean;
    connectors: { id: string; status: string; mode: string; write_scope: string }[];
  };
  privacy_invariants: string[];
  stage_index: number;
  stage_total: number;
};
