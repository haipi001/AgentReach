"use client";

import { AgentCore } from "./AgentCore";
import { useAgentStore } from "@/stores/agent-store";
import { orbStateFromStage } from "@agentreach/agency-events";

export function AgentStage() {
  const agentState = useAgentStore((s) => s.agentState);
  const stage = useAgentStore((s) => s.demo?.stage);
  const view = useAgentStore((s) => s.view);
  const runtimeStatus = useAgentStore((s) => s.demo?.runtime.status);
  const semanticState = orbStateFromStage(stage, runtimeStatus);
  const persistedState = semanticState === "waiting-approval" ? "waiting_approval" : semanticState === "acting" || semanticState === "verifying" ? "thinking" : semanticState === "error" ? "idle" : semanticState;
  const visualState = agentState === "idle" ? persistedState : agentState;
  const stateLabel = { idle: "待机", thinking: "思考中", searching: "搜索中", waiting_approval: "等待批准", connected: "已连接" }[visualState];
  return <div className={`canvas-shell agent-core-stage state-${visualState} view-${view}`} aria-label={`人工智能核心状态：${stateLabel}`}>
    <AgentCore />
  </div>;
}
