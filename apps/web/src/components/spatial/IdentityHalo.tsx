"use client";

import { motion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";

const ORBITS = [
  { id: "IDENTITY", note: "SELF / 01", x: -92, y: -194 },
  { id: "MEMORY", note: "LOCAL / 348", x: 226, y: -124 },
  { id: "INTENT", note: "PRIVATE / 04", x: 266, y: 4 },
  { id: "SKILLS", note: "READY / 06", x: 218, y: 132 },
  { id: "RELATIONS", note: "OWNED / 127", x: -330, y: 132 },
  { id: "BOUNDARY", note: "NORMAL / L2", x: -372, y: 4 },
  { id: "REACH", note: "WORLD / ASK", x: -332, y: -124 },
] as const;

export function IdentityHalo() {
  const view = useAgentStore((s) => s.view);
  const agentState = useAgentStore((s) => s.agentState);
  const active = useAgentStore((s) => s.activeOrbit);
  const setActive = useAgentStore((s) => s.setActiveOrbit);
  const setView = useAgentStore((s) => s.setView);
  const persona = useAgentStore((s) => s.persona);
  const openStudio = useAgentStore((s) => s.setPersonaStudioOpen);

  return (
    <div className={`identity-halo ${view === "reach" ? "is-reaching" : ""}`}>
      <motion.div
        className="halo-type halo-type-outer"
        animate={{ rotate: agentState === "searching" ? 360 : 18 }}
        transition={{ duration: agentState === "searching" ? 5 : 28, ease: "linear", repeat: Infinity }}
      >
        <span>WHO ARE YOU · WHAT DO WE WANT · WHO AM I · WHAT CAN WE BECOME · </span>
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
              <i /><span>{orbit.id}</span><small>{orbit.note}</small>
            </button>
          );
        })}
      </div>
      <div className="state-readout"><span>{agentState.replace("_", " ")}</span><small>{persona.name} / PERSONAL AGENT</small></div>
      <button className="customize-trigger" onClick={() => openStudio(true)}>CUSTOMIZE FORM</button>
    </div>
  );
}
