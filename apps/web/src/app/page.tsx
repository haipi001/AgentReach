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
import { ExperienceFrame } from "@/components/experience/ExperienceFrame";
import { CapabilityAtlas } from "@/components/experience/CapabilityAtlas";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

export default function Home() {
  const view = useAgentStore((s) => s.view);
  const setDemo = useAgentStore((s) => s.setDemo);
  const openStudio = useAgentStore((s) => s.setPersonaStudioOpen);
  useEffect(() => { demoApi.get().then(setDemo).catch(() => undefined); }, [setDemo]);
  return <ExperienceFrame>
    <section className="self-stage">
      <AgentStage />
      <div className="grain" aria-hidden="true" />
      <section className="self-copy"><span>MY AI / 001</span><h1>Not a profile.<br/><em>A presence.</em></h1><p>Your context stays close. Your agent reaches outward only when you decide.</p></section>
      <IdentityHalo />
      {view === "self" && <button className="mobile-customize" onClick={() => openStudio(true)}>CUSTOMIZE AI FORM</button>}
      <AgentPanel />
      {view === "self" && <AgentComposer />}
      {view === "self" && <a className="scroll-cue" href="#atlas-title">EXPLORE SYSTEMS <b>↓</b></a>}
    </section>
    {view === "self" && <CapabilityAtlas />}
    <PersonaStudio />
    <ReachScene /><CapsuleFlow /><ConnectedState /><TracePanel />
  </ExperienceFrame>;
}
