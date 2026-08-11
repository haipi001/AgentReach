"use client";

import type { ReactNode } from "react";
import { EXPERIENCE_PLANES, resolveExperiencePlane } from "@/experience/experience-model";
import { useAgentStore } from "@/stores/agent-store";

export function ExperienceFrame({ children }: { children: ReactNode }) {
  const view = useAgentStore((state) => state.view);
  const agentState = useAgentStore((state) => state.agentState);
  const plane = resolveExperiencePlane(view, agentState);

  return <main className={`spatial-app view-${view}`} data-plane={plane}>
    <nav><a href="#" className="brand"><i/><span>AGENTREACH</span></a><div className="experience-rail" aria-label="Experience plane">{EXPERIENCE_PLANES.map((item, index) => <span key={item.id} className={plane === item.id ? "active" : ""}>{index > 0 && <b>/</b>}{item.label}</span>)}</div><small>PRIVATE-BY-DEFAULT · LOCAL FIRST</small></nav>
    {children}
    <footer><span>HAIPI AGENT / ACTIVE</span><span>PLANE {plane.toUpperCase()}</span><span>BOUNDARY NORMAL</span></footer>
  </main>;
}
