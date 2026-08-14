export type AgentState = "idle" | "thinking" | "searching" | "waiting_approval" | "connected";
export type ViewMode = "identity" | "self" | "reach" | "capsule" | "connected";
export type PersonaFinish = "matte" | "chrome" | "porcelain";

export type PersonaConfig = {
  name: string;
  finish: PersonaFinish;
  accent: "lichen" | "cobalt" | "ember";
  aura: number;
};

export type ExperiencePlane = "self" | "agency" | "world" | "evidence";

export type SurfaceDestination =
  | { kind: "self" }
  | { kind: "dimension"; id: "relationship" | "parameters" | "local" | "applications" | "routines" | "compute" | "files" | "skills" | "memory" | "projects" | "boundary"; focus?: string }
  | { kind: "workspace"; runId?: string }
  | { kind: "system"; panel?: string };

export type LocalApplication = {
  id: string;
  name: string;
  installed: boolean;
  path: string | null;
  bundle_id: string | null;
  version: string | null;
  authority: "NONE";
  status: "UNAUTHORIZED" | "NOT_INSTALLED";
  control_surfaces: string[];
  learned_procedures: number;
  observed_routines: number;
  permissions: { observe: boolean; read: boolean; write: boolean; automate: boolean };
};

export type ApplicationAuthoritySnapshot = {
  generated_at: string;
  host: { system: string; machine: string };
  read_only: true;
  installed: number;
  total: number;
  applications: LocalApplication[];
};

export type RoutinePolicy = "IGNORE" | "LEARN" | "ASK_WHEN_READY" | "AUTO_EXECUTE";
export type LearnedRoutine = {
  routine_id: string;
  name: string;
  application_id: string;
  application_name: string;
  state: "OBSERVING" | "LEARNED" | "VERIFIED";
  policy: RoutinePolicy;
  observations: number;
  verified_runs: number;
  confidence: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  auto_execute_allowed: boolean;
  suggestion: string;
  semantic_steps: { index: number; label: string; boundary: string }[];
  updated_at: string | null;
};
export type RoutineLearningSnapshot = { generated_at: string; source: string; routines: LearnedRoutine[] };

export type ComputeAuthoritySnapshot = {
  generated_at: string;
  read_only: true;
  hardware: { host: string; system: string; architecture: string; model: string; chip: string; gpu: string; gpu_cores: number; cpu_physical_cores: number; cpu_logical_cores: number };
  resources: { cpu_percent: number; memory_total_gb: number; memory_used_gb: number; memory_percent: number; disk_total_gb: number; disk_used_gb: number; disk_percent: number };
  providers: { id: string; name: string; kind: "LOCAL" | "CLOUD"; status: "HEALTHY" | "UNAVAILABLE" | "CONFIGURED" | "NOT_CONFIGURED"; models: string[] }[];
  router: { policy: "LOCAL_FIRST"; route: "LOCAL" | "CLOUD" | "UNAVAILABLE"; provider: string | null; reason: string };
};

export type FileDeviceAuthoritySnapshot = {
  generated_at: string;
  read_only: true;
  policy: "DENY_BY_DEFAULT";
  scopes: { id: string; name: string; path: string; read: boolean; write: boolean; sensitive: boolean; reason: string }[];
  recent_files: { id: string; name: string; relative_path: string; scope_id: string; scope_name: string; mime: string; size: number; size_label: string; modified_at: string; readable: boolean; writable: boolean }[];
  evidence_artifacts: { id: string; type: string; label: string; verified: boolean; path: string | null; exists: boolean }[];
  devices: { id: string; kind: "MAC" | "DISPLAY" | "PHONE" | "TABLET" | "STORAGE" | "USB"; name: string; status: "ONLINE" | "OFFLINE"; connection: string; authority: "READ_ONLY" | "NONE"; detail: string }[];
  summary: { readable_scopes: number; writable_scopes: number; sensitive_scopes: number; online_devices: number };
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

export type IdentityProfile = {
  profile_id: string;
  display_name: string;
  agent_name: string;
  created_at: string;
  last_active_at: string;
  active: boolean;
};

export type IdentityRuntime = {
  session_id: string;
  active_profile_id: string;
  local_only: boolean;
  profiles: IdentityProfile[];
};

export type OwnerBackup = {
  format: "agentreach-owner-backup/v1";
  exported_at: string;
  profile: { display_name: string; agent_name: string };
  database_base64: string;
  database_sha256: string;
  bytes: number;
  encrypted: false;
  warning: string;
};

export type OperationalMetrics = {
  health: "HEALTHY" | "ATTENTION" | "CRITICAL";
  generated_at: string;
  runs: { total: number; active: number; paused: number; completed: number; failed: number; cancelled: number; success_rate: number };
  workers: { total: number; pending: number; running: number; failed: number; succeeded: number };
  actions: { total: number; pending: number; running: number; failed: number; succeeded: number; receipts: number };
  connectors: { enabled: number; healthy: number; degraded: number };
  memory_records: number;
  unread_notifications: number;
  recovery_events: number;
  incidents: { source: "WORKER" | "OUTBOX"; item_id: string; operation: string; status: string; error: string | null; updated_at: string }[];
};

export type DemoState = {
  stage: string;
  trace_id: string;
  human_request: string | null;
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
  skills: { id: string; description: string; version: string; status: string; enabled: boolean; updated_at: string; invocations: number }[];
  connector_grants: { connector: string; scope: string; status: string; approval_id?: string }[];
  connector_runtime: {
    receipts: number;
    mailbox_envelopes: number;
    idempotent: boolean;
    recoverable: boolean;
    outbox: {
      outbox_id: string;
      action_id: string;
      connector_id: string;
      status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
      attempt: number;
      max_attempts: number;
      error: string | null;
      updated_at: string;
    }[];
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
      recoverable: boolean;
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
  identity_runtime?: IdentityRuntime;
};
