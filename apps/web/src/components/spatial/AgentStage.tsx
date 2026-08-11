"use client";

import { Sparkles } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { AgentAvatar } from "./AgentAvatar";
import { GroundRings } from "./GroundRings";
import { AgentHead } from "./AgentHead";
import { useAgentStore } from "@/stores/agent-store";

export function AgentStage() {
  const agentState = useAgentStore((s) => s.agentState);
  const view = useAgentStore((s) => s.view);
  const persona = useAgentStore((s) => s.persona);
  const avatarAsset = useAgentStore((s) => s.avatarAsset);
  const [compact, setCompact] = useState(false);
  const stateLabel = { idle: "待机", thinking: "思考中", searching: "搜索中", waiting_approval: "等待批准", connected: "已连接" }[agentState];
  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px), (max-aspect-ratio: 4/5)");
    const update = () => setCompact(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return <>
    <div className={`canvas-shell state-${agentState} view-${view}`} aria-label={`人工智能虚拟人状态：${stateLabel}`}>
      <Canvas key={compact ? "compact" : "wide"} shadows dpr={[1, 1.8]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, compact ? 0 : .02, compact ? 9.4 : 9], fov: compact ? 32 : 30 }}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[3.6, 5, 5]} intensity={4.2} color="#fffef2" castShadow />
        <directionalLight position={[-4, 1, 2]} intensity={2.1} color="#c9ff50" />
        {avatarAsset ? <AgentAvatar state={agentState} persona={persona} /> : <AgentHead persona={persona} />}
        {view === "reach" && <><GroundRings reaching /><Sparkles count={50} scale={[8, 6, 4]} size={1} speed={.1} opacity={.2} color="#d2ff00" /></>}
      </Canvas>
    </div>
  </>;
}
