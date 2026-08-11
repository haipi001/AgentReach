"use client";

import { useEffect } from "react";
import { TracePanel } from "@/components/debug/TracePanel";
import { CapsuleFlow } from "@/components/reach/CapsuleFlow";
import { ConnectedState } from "@/components/reach/ConnectedState";
import { ReachScene } from "@/components/reach/ReachScene";
import { PersonaStudio } from "@/components/spatial/PersonaStudio";
import { ExperienceFrame } from "@/components/experience/ExperienceFrame";
import { CapabilityAtlas } from "@/components/experience/CapabilityAtlas";
import { ImmersiveHero } from "@/components/experience/ImmersiveHero";
import { AgencyManifesto } from "@/components/experience/AgencyManifesto";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

export default function Home() {
  const view = useAgentStore((s) => s.view);
  const setDemo = useAgentStore((s) => s.setDemo);
  useEffect(() => { demoApi.get().then(setDemo).catch(() => undefined); }, [setDemo]);
  return <ExperienceFrame>
    <ImmersiveHero />
    {view === "self" && <AgencyManifesto />}
    {view === "self" && <CapabilityAtlas />}
    <PersonaStudio />
    <ReachScene /><CapsuleFlow /><ConnectedState /><TracePanel />
  </ExperienceFrame>;
}
