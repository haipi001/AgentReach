"use client";

import { useEffect } from "react";
import { TracePanel } from "@/components/debug/TracePanel";
import { CapsuleFlow } from "@/components/reach/CapsuleFlow";
import { ConnectedState } from "@/components/reach/ConnectedState";
import { ReachScene } from "@/components/reach/ReachScene";
import { PersonaStudio } from "@/components/spatial/PersonaStudio";
import { ExperienceFrame } from "@/components/experience/ExperienceFrame";
import { ProductWorkspace } from "@/components/workspace/ProductWorkspace";
import { SystemPanel } from "@/components/system/SystemPanel";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { IdentityLoadout } from "@/components/identity/IdentityLoadout";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

export default function Home() {
  const view = useAgentStore((s) => s.view);
  const setDemo = useAgentStore((s) => s.setDemo);
  useEffect(() => { demoApi.get().then(setDemo).catch(() => undefined); }, [setDemo]);
  return <ExperienceFrame>
    {(view === "identity" || view === "self") && <div className="identity-scroll"><IdentityLoadout/><div id="task-workspace"><ProductWorkspace/></div></div>}
    <SystemPanel />
    <NotificationCenter />
    <PersonaStudio />
    <ReachScene /><CapsuleFlow /><ConnectedState /><TracePanel />
  </ExperienceFrame>;
}
