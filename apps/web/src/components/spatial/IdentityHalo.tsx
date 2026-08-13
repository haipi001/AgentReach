"use client";

import { motion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";

const ORBITS = [
  { id: "IDENTITY", label: "身份", note: "自我 / 01", x: -92, y: -194 },
  { id: "MEMORY", label: "记忆", note: "本地 / 348", x: 226, y: -124 },
  { id: "INTENT", label: "意图", note: "私有 / 04", x: 266, y: 4 },
  { id: "SKILLS", label: "能力", note: "就绪 / 06", x: 218, y: 132 },
  { id: "RELATIONS", label: "关系", note: "自有 / 127", x: -330, y: 132 },
  { id: "BOUNDARY", label: "边界", note: "正常 / 二级", x: -372, y: 4 },
  { id: "REACH", label: "触达", note: "现实 / 询问", x: -332, y: -124 },
] as const;

export function IdentityHalo() {
  const view = useAgentStore((s) => s.view);
  const agentState = useAgentStore((s) => s.agentState);
  const active = useAgentStore((s) => s.activeOrbit);
  const setActive = useAgentStore((s) => s.setActiveOrbit);
  const setView = useAgentStore((s) => s.setView);
  const persona = useAgentStore((s) => s.persona);
  const openStudio = useAgentStore((s) => s.setPersonaStudioOpen);
  const stateLabel = { idle: "待机", thinking: "思考中", searching: "搜索中", waiting_approval: "等待批准", connected: "已连接" }[agentState];

  return (
    <div className={`identity-halo ${view === "reach" ? "is-reaching" : ""}`}>
      <motion.div
        className="halo-type halo-type-outer"
        animate={{ rotate: agentState === "searching" ? 360 : 18 }}
        transition={{ duration: agentState === "searching" ? 5 : 28, ease: "linear", repeat: Infinity }}
      >
        <span>你是谁 · 我们想要什么 · 我是谁 · 我们能够成为什么 · </span>
      </motion.div>
      <div className="orbit-menu">
        {ORBITS.map((orbit) => {
          const style = { "--x": `${orbit.x}px`, "--y": `${orbit.y}px` } as React.CSSProperties;
          return (
            <button
              key={orbit.id}
              style={style}
              className={`orbit-button orbit-${orbit.id.toLowerCase()} ${active === orbit.id ? "active" : ""}`}
              onClick={() => orbit.id === "REACH" ? setView("reach") : setActive(active === orbit.id ? null : orbit.id)}
            >
              <i /><span>{orbit.label}</span><small>{orbit.note}</small>
            </button>
          );
        })}
      </div>
      <div className="state-readout"><span>{stateLabel}</span><small>{persona.name} / 个人智能体</small></div>
      <button className="customize-trigger" onClick={() => openStudio(true)}>校准核心</button>
    </div>
  );
}
