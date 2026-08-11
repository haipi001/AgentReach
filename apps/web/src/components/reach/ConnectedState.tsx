"use client";

import { motion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";

export function ConnectedState() {
  const view = useAgentStore((s) => s.view);
  const demo = useAgentStore((s) => s.demo);
  const setView = useAgentStore((s) => s.setView);
  if (view !== "connected" || !demo) return null;
  const rejected = demo.stage === "PEER_REJECTED";
  return <motion.section className={`connected-layer ${rejected ? "is-rejected" : ""}`} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}>
    <span className="connected-kicker">{rejected ? "CONSENT RESPECTED" : "WORLD CHANGED / VERIFIED"}</span><div className="connection-visual"><i/><b/><i/></div><h2>{rejected ? "Alice chose not to connect." : "Intent became evidence."}</h2><p>{rejected ? "No commitment was created. No additional context was shared." : `${demo.selected_candidate?.display_name} ↔ Haipi · ${demo.commitment?.objective}`}</p>
    {!rejected && <><div className="world-proof">{demo.evidence.map(item => <article key={item.type}><small>{item.type.replace("_", " ")}</small><strong>✓ {item.label}</strong></article>)}<article><small>personal agent memory</small><strong>✓ Memory updated</strong></article></div><div className="verify-list">{demo.verification?.checks.filter(check => ["Repository updated", "Introduction sent", "2 actions independently verified"].includes(check.name)).map(check => <span key={check.name}>✓ {check.name}</span>)}</div></>}
    <button onClick={() => setView("self")}>RETURN TO SELF SPACE</button>
  </motion.section>;
}
