"use client";

import { AnimatePresence, motion } from "motion/react";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

const positions = ["node-a", "node-b", "node-c"];

export function ReachScene() {
  const view = useAgentStore((s) => s.view);
  const demo = useAgentStore((s) => s.demo);
  const setDemo = useAgentStore((s) => s.setDemo);
  const setView = useAgentStore((s) => s.setView);
  const setState = useAgentStore((s) => s.setAgentState);

  async function select(id: string) {
    setState("waiting_approval");
    const result = await demoApi.select(id);
    setDemo(result); setView("capsule");
  }

  return (
    <AnimatePresence>
      {view === "reach" && demo && (
        <motion.section className="reach-layer" initial={{ opacity: 0, scale: 1.18 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} transition={{ duration: .8, ease: [0.22,1,0.36,1] }}>
          <div className="reach-heading"><span>REACH MODE / DOMAIN:706</span><h2>Your agent found<br />three possible paths.</h2><p>Shared Claims × private relationship context. Matching happened locally.</p></div>
          <button className="back-link" onClick={() => setView("self")}>← SELF SPACE</button>
          <div className="network-lines" aria-hidden="true"><i/><i/><i/></div>
          <div className="self-node"><span>YOU</span><strong>HAIPI AGENT</strong></div>
          {demo.candidates.map((candidate, index) => (
            <motion.button key={candidate.id} className={`peer-node ${positions[index]}`} onClick={() => select(candidate.id)} initial={{ opacity: 0, scale: .4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .25 + index * .16, type: "spring" }}>
              <span className="peer-score">{candidate.score_percent}</span><i/><strong>{candidate.display_name}</strong><small>{candidate.reasons[0]}<br/>{candidate.reasons[2]}</small><b>INSPECT →</b>
            </motion.button>
          ))}
          <div className="domain-node domain-706">706<small>COMMUNITY</small></div><div className="domain-node domain-ai">CODING<small>CAPABILITY</small></div><div className="world-entity"><small>REPOSITORY / WRITE GATED</small><strong>AgentReach</strong><span>docs/vision.md</span></div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
