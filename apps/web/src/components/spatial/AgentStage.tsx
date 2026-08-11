"use client";

import { Sparkles } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { AgentAvatar } from "./AgentAvatar";
import { GroundRings } from "./GroundRings";
import { useAgentStore } from "@/stores/agent-store";

export function AgentStage() {
  const agentState = useAgentStore((s) => s.agentState);
  const view = useAgentStore((s) => s.view);
  const persona = useAgentStore((s) => s.persona);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px), (max-aspect-ratio: 4/5)");
    const update = () => setCompact(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <div className={`canvas-shell state-${agentState} view-${view}`} aria-label={`AI avatar state ${agentState}`}>
      <Canvas key={compact ? "compact" : "wide"} shadows dpr={[1, 1.65]} camera={{ position: [0, compact ? 0.25 : 0.45, compact ? 9.3 : 7.3], fov: 36 }}>
        <fog attach="fog" args={["#aeadb6", 7.5, 13]} />
        <ambientLight intensity={1.55} />
        <directionalLight position={[4, 7, 5]} intensity={2.4} color="#eef2e7" castShadow />
        <pointLight position={[-4, 1, 3]} intensity={6} color="#dce7d3" distance={8} />
        <AgentAvatar state={agentState} persona={persona} />
        <GroundRings reaching={view === "reach"} />
        <Sparkles count={view === "reach" ? 85 : 34} scale={[11, 7, 5]} size={1.3} speed={0.12} opacity={0.3} color="#e8eee0" />
      </Canvas>
    </div>
  );
}
