"use client";

import type { ReactNode } from "react";
import { EXPERIENCE_PLANES, resolveExperiencePlane } from "@/experience/experience-model";
import { useAgentStore } from "@/stores/agent-store";

export function ExperienceFrame({ children }: { children: ReactNode }) {
  const view = useAgentStore((state) => state.view);
  const agentState = useAgentStore((state) => state.agentState);
  const openStudio = useAgentStore((state) => state.setPersonaStudioOpen);
  const systemOpen = useAgentStore((state) => state.systemPanelOpen);
  const setSystemOpen = useAgentStore((state) => state.setSystemPanelOpen);
  const plane = resolveExperiencePlane(view, agentState);

  return <main className={`spatial-app view-${view}`} data-plane={plane}>
    <nav><a href="#" className="brand" onClick={(event) => event.preventDefault()}><span><em>AGENT</em><b>REACH</b></span></a><div className="experience-rail" aria-label="体验阶段">{EXPERIENCE_PLANES.map((item, index) => <span key={item.id} className={plane === item.id ? "active" : ""}>{index > 0 && <b>/</b>}{item.label}</span>)}</div><div className="nav-actions"><button className="nav-customize" onClick={() => openStudio(true)}>自定义</button><button className={`nav-menu ${systemOpen ? "active" : ""}`} aria-label={systemOpen ? "关闭系统控制面" : "打开系统控制面"} aria-expanded={systemOpen} onClick={() => setSystemOpen(!systemOpen)}><i/><i/></button></div></nav>
    {children}
    <footer><span>HAIPI 智能体 / 活跃</span><span>阶段 {EXPERIENCE_PLANES.find(item => item.id === plane)?.label}</span><span>边界正常</span></footer>
  </main>;
}
