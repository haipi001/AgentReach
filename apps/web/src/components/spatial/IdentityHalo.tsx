"use client";

import { motion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";

const ORBITS = ["IDENTITY", "MEMORY", "INTENT", "SKILLS", "RELATIONS", "BOUNDARY", "REACH"];

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
        {ORBITS.map((orbit, index) => {
          const angle = (index / ORBITS.length) * Math.PI * 2 - Math.PI / 2;
          const style = { "--x": `${Math.cos(angle) * 286}px`, "--y": `${Math.sin(angle) * 190}px` } as React.CSSProperties;
          return (
            <button
              key={orbit}
              style={style}
              className={`orbit-button orbit-${orbit.toLowerCase()} ${active === orbit ? "active" : ""}`}
              onClick={() => orbit === "REACH" ? setView("reach") : setActive(active === orbit ? null : orbit)}
            >
              <i />{orbit}
            </button>
          );
        })}
      </div>
      <div className="state-readout"><span>{agentState.replace("_", " ")}</span><small>{persona.name} / PERSONAL AGENT</small></div>
      <button className="customize-trigger" onClick={() => openStudio(true)}>CUSTOMIZE FORM</button>
    </div>
  );
}
