"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

export function TracePanel() {
  const [open, setOpen] = useState(false);
  const demo = useAgentStore((s) => s.demo);
  const setDemo = useAgentStore((s) => s.setDemo);
  async function attack() { setDemo(await demoApi.privacyAttack()); }
  return <>
    <button className="trace-trigger" onClick={() => setOpen(!open)}><i /> TRACE <span>{demo?.trace.length ?? 0}</span></button>
    <AnimatePresence>{open && <motion.aside className="trace-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
      <header><div><span>EXECUTION EVIDENCE</span><strong>{demo?.trace_id ?? "NO ACTIVE TRACE"}</strong></div><button onClick={() => setOpen(false)}>×</button></header>
      <div className="trace-verdict"><span>VERIFIER</span><strong>{demo?.verification?.verdict ?? "NOT RUN"}</strong>{demo?.verification?.checks.map(check => <p key={check.name}>{check.passed ? "✓" : "×"} {check.name}</p>)}</div>
      <button className="attack-action" onClick={attack}>RUN PRIVACY ATTACK <span>request relationship graph</span></button>
      {demo?.privacy_denials.at(-1) && <div className="denied-proof">DENIED / {demo.privacy_denials.at(-1)?.reason}</div>}
      <div className="trace-events">{[...(demo?.trace ?? [])].reverse().map(event => <article key={event.sequence}><small>#{event.sequence} / {event.agent_label}</small><strong>{event.event_type}</strong><p>{event.summary}</p><span>{event.decision}</span></article>)}</div>
    </motion.aside>}</AnimatePresence>
  </>;
}
