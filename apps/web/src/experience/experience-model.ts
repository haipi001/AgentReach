import type { AgentState, ExperiencePlane, ViewMode } from "@/types/agent";

export const EXPERIENCE_PLANES: { id: ExperiencePlane; label: string; promise: string }[] = [
  { id: "self", label: "SELF", promise: "Private identity and memory" },
  { id: "agency", label: "AGENCY", promise: "Intent, policy and approval" },
  { id: "world", label: "WORLD", promise: "People, tools and actions" },
  { id: "evidence", label: "EVIDENCE", promise: "Verification and memory" },
];

export function resolveExperiencePlane(view: ViewMode, agentState: AgentState): ExperiencePlane {
  if (view === "connected") return "evidence";
  if (view === "reach" || view === "capsule") return "world";
  if (agentState !== "idle") return "agency";
  return "self";
}

export const EXPERIENCE_INVARIANTS = [
  "Self is the origin, never a dashboard tab.",
  "Agency mediates every move from intent to world action.",
  "World access is scoped, approved and revocable.",
  "Evidence must exist before experience becomes memory.",
] as const;
