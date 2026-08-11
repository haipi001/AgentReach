import type { AgentState, ExperiencePlane, ViewMode } from "@/types/agent";

export const EXPERIENCE_PLANES: { id: ExperiencePlane; label: string; promise: string }[] = [
  { id: "self", label: "自我", promise: "私有身份与记忆" },
  { id: "agency", label: "行动权", promise: "意图、策略与审批" },
  { id: "world", label: "现实世界", promise: "人、工具与行动" },
  { id: "evidence", label: "证据", promise: "验证与记忆" },
];

export function resolveExperiencePlane(view: ViewMode, agentState: AgentState): ExperiencePlane {
  if (view === "connected") return "evidence";
  if (view === "reach" || view === "capsule") return "world";
  if (agentState !== "idle") return "agency";
  return "self";
}

export const EXPERIENCE_INVARIANTS = [
  "自我是起点，而不是仪表盘标签。",
  "从意图到现实行动的每一步都必须经过行动权约束。",
  "现实世界访问必须有范围、经过批准并且可撤销。",
  "经验进入记忆之前必须先有证据。",
] as const;
