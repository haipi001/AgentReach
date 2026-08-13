"use client";

import { AgentCore } from "./AgentCore";
import { useAgentStore } from "@/stores/agent-store";

export function AgentStage() {
  const agentState = useAgentStore((s) => s.agentState);
  const stage = useAgentStore((s) => s.demo?.stage);
  const view = useAgentStore((s) => s.view);
  const persistedState = stage === "COMPLETED" ? "connected" : stage?.startsWith("WAITING_") ? "waiting_approval" : stage === "CANDIDATES_FOUND" || stage === "INTRO_SENT" ? "searching" : "idle";
  const visualState = agentState === "idle" ? persistedState : agentState;
  const stateLabel = { idle: "待机", thinking: "思考中", searching: "搜索中", waiting_approval: "等待批准", connected: "已连接" }[visualState];
  return <div className={`canvas-shell agent-core-stage state-${visualState} view-${view}`} aria-label={`人工智能核心状态：${stateLabel}`}>
    <AgentCore />
  </div>;
}
