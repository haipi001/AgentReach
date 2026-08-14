export type EntityKind = "person" | "agent" | "application" | "project" | "file" | "device" | "organization" | "service";
export type RiskLevel = "safe" | "guarded" | "restricted" | "protected";
export type AgencyPlane = "self" | "local" | "reach" | "action" | "approval" | "evidence" | "engineering";

export interface Entity {
  id: string;
  kind: EntityKind;
  name: string;
  plane: AgencyPlane;
  summary?: string;
  attributes?: Readonly<Record<string, unknown>>;
}

export interface Capability {
  id: string;
  name: string;
  status: "available" | "active" | "disabled" | "degraded";
  risk: RiskLevel;
  provider?: string;
}

export interface Affordance {
  id: string;
  label: string;
  action: string;
  entityId?: string;
  risk: RiskLevel;
  approvalRequired: boolean;
  available: boolean;
  unavailableReason?: string;
}

export interface Intent {
  id: string;
  request: string;
  status: "draft" | "structured" | "active" | "fulfilled" | "cancelled";
  private: true;
}

export interface Action {
  id: string;
  actor: string;
  target: string;
  operation: string;
  status: "planned" | "waiting-approval" | "running" | "completed" | "failed";
  risk: RiskLevel;
}

export interface Approval {
  id: string;
  actionIds: readonly string[];
  status: "required" | "approved" | "rejected" | "expired";
  disclosureSummary: string;
}

export interface Evidence {
  id: string;
  actionId?: string;
  label: string;
  kind: string;
  verified: boolean;
  source?: string;
}
