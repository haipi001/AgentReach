"use client";

import { useEffect } from "react";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { AgentComposer } from "@/components/chat/AgentComposer";
import { TracePanel } from "@/components/debug/TracePanel";
import { CapsuleFlow } from "@/components/reach/CapsuleFlow";
import { ConnectedState } from "@/components/reach/ConnectedState";
import { ReachScene } from "@/components/reach/ReachScene";
import { AgentStage } from "@/components/spatial/AgentStage";
import { IdentityHalo } from "@/components/spatial/IdentityHalo";
import { PersonaStudio } from "@/components/spatial/PersonaStudio";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

export default function Home() {
  const view = useAgentStore((s) => s.view);
  const setDemo = useAgentStore((s) => s.setDemo);
  const openStudio = useAgentStore((s) => s.setPersonaStudioOpen);
  useEffect(() => { demoApi.get().then(setDemo).catch(() => undefined); }, [setDemo]);
  return <main className={`spatial-app view-${view}`}>
    <nav><a href="#" className="brand"><i/><span>AGENTREACH</span></a><div><span>SELF SPACE</span><b>/</b><span className={view !== "self" ? "active" : ""}>{view.toUpperCase()}</span></div><small>PRIVATE-BY-DEFAULT · LOCAL FIRST</small></nav>
    <AgentStage />
    <div className="grain" aria-hidden="true" />
    <section className="self-copy"><span>MY AI / 001</span><h1>Not a profile.<br/><em>A presence.</em></h1><p>Your context stays close. Your agent reaches outward only when you decide.</p></section>
    <IdentityHalo />
    {view === "self" && <button className="mobile-customize" onClick={() => openStudio(true)}>CUSTOMIZE AI FORM</button>}
    <PersonaStudio />
    <AgentPanel />
    {view === "self" && <AgentComposer />}
    <ReachScene /><CapsuleFlow /><ConnectedState /><TracePanel />
    <footer><span>HAIPI AGENT / ACTIVE</span><span>AUTONOMY L2</span><span>BOUNDARY NORMAL</span></footer>
  </main>;
}
