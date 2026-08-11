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

export type MemoryRecord = {
  memory_id: string;
  trace_id: string;
  kind: string;
  summary: string;
  evidence: { type: string; label: string; verified: boolean }[];
  created_at: string;
  score: number;
  verified: boolean;
};

export type MemorySearchResult = {
  query: string;
  total: number;
  items: MemoryRecord[];
};

export type NotificationRecord = {
  notification_id: string;
  run_id: string;
  trace_id: string;
  kind: "APPROVAL" | "WAITING" | "RESULT" | "ERROR" | "RUN";
  title: string;
  body: string;
  status: "UNREAD" | "READ";
  action: "capsule" | "connected" | "system";
  created_at: string;
};

export type NotificationResult = { unread: number; total: number; items: NotificationRecord[] };

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
    connectors: {
      id: string;
      status: string;
      enabled: boolean;
      mode: string;
      write_scope: string;
      last_checked_at: string | null;
      details: { remote?: string; head?: string; root?: string; storage?: string; writable?: boolean; write_tested?: boolean; reason?: string };
    }[];
  };
  privacy_invariants: string[];
  stage_index: number;
  stage_total: number;
  memory_runtime: {
    records: number;
    verified_only: boolean;
    storage: string;
    survives_task_reset: boolean;
  };
  runtime: {
    run_id: string;
    status: "RUNNING" | "PAUSED" | "CANCELLED" | "FAILED" | "COMPLETED" | "SUPERSEDED";
    attempt: number;
    created_at: string;
    updated_at: string;
    finished_at: string | null;
    controls: {
      can_pause: boolean;
      can_resume: boolean;
      can_cancel: boolean;
      can_retry: boolean;
    };
    history: {
      run_id: string;
      task_id: string;
      trace_id: string;
      status: string;
      stage: string;
      attempt: number;
      human_request: string | null;
      created_at: string;
      updated_at: string;
      finished_at: string | null;
    }[];
  };
  worker_queue: {
    jobs: {
      job_id: string;
      agent_id: string;
      skill: string;
      status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
      attempt: number;
      max_attempts: number;
      error: string | null;
      created_at: string;
      updated_at: string;
    }[];
    pending: number;
    running: number;
    failed: number;
    succeeded: number;
    durable: boolean;
    claim_mode: string;
  };
  notification_runtime: { unread: number; total: number; persistent: boolean };
};
