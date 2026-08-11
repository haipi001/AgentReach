"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

export function CapsuleFlow() {
  const view = useAgentStore((s) => s.view);
  const demo = useAgentStore((s) => s.demo);
  const setDemo = useAgentStore((s) => s.setDemo);
  const setView = useAgentStore((s) => s.setView);
  const setState = useAgentStore((s) => s.setAgentState);
  const [step, setStep] = useState<"capsule" | "peer" | "commitment">("capsule");
  const [busy, setBusy] = useState(false);

  async function perform(action: () => Promise<Awaited<ReturnType<typeof demoApi.get>>>, next: typeof step | "done") {
    setBusy(true);
    try {
      const result = await action(); setDemo(result);
      if (next === "done") { setState("connected"); setView("connected"); }
      else setStep(next);
    } finally { setBusy(false); }
  }
  if (!demo) return null;

  return <AnimatePresence>{view === "capsule" && (
    <motion.section className="capsule-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="capsule-window" initial={{ y: 60, scale: .94 }} animate={{ y: 0, scale: 1 }}>
        <header><span>CONTEXT CAPSULE / L2</span><button onClick={() => { setState("idle"); setView("reach"); }}>×</button></header>
        {step === "capsule" && <>
          <h2>You are about to<br/><em>reach {demo.selected_candidate?.display_name}.</em></h2><p className="capsule-lead">Your Boundary Agent prepared the minimum sufficient context for this introduction.</p>
          <div className="disclosure-grid"><div><span>SHARE</span><ul><li>706 membership</li><li>Personal Agent interest</li><li>Potential collaboration request</li><li>24-hour capsule expiry</li></ul></div><div className="private"><span>STAYS PRIVATE</span><ul>{demo.removed_fields.map(field => <li key={field}>{field}</li>)}</ul></div></div>
          <div className="capsule-actions"><button className="ghost-action" onClick={() => { setState("idle"); setView("reach"); }}>CANCEL</button><button className="reach-action" disabled={busy} onClick={() => perform(demoApi.approveIntro, "peer")}>APPROVE + REACH ↗</button></div>
        </>}
        {step === "peer" && <div className="peer-consent"><span className="signal-ring"><i/></span><small>ALICE AGENT / INBOX</small><h2>Haipi would like to discuss<br/>Personal Agent protocols.</h2><p>Only the approved Context Capsule arrived. Alice&apos;s private context remains inaccessible.</p><div className="capsule-actions"><button className="ghost-action" disabled={busy} onClick={() => perform(() => demoApi.peerDecision(false), "done")}>DECLINE</button><button className="reach-action" disabled={busy} onClick={() => perform(() => demoApi.peerDecision(true), "commitment")}>ALICE ACCEPTS</button></div></div>}
        {step === "commitment" && demo.commitment && <div className="commitment-view"><span>WORLD ACTION GATE / L3 STRONG CONFIRM</span><h2>{demo.commitment.objective}</h2><dl><dt>PARTIES</dt><dd>{demo.commitment.parties.join(" ↔ ")}</dd><dt>ACTION 01</dt><dd>CREATE AgentReach/docs/vision.md</dd><dt>ACTION 02</dt><dd>SEND collaboration request → Alice Inbox</dd><dt>BOUNDARY</dt><dd>Only these 2 actions · local GitHub sandbox</dd><dt>VERIFIER</dt><dd>INDEPENDENT / READ ONLY</dd></dl><div className="capsule-actions"><button className="ghost-action" onClick={() => setView("self")}>NOT NOW</button><button className="reach-action" disabled={busy} onClick={() => perform(demoApi.approveCommitment, "done")}>ACT + VERIFY ↗</button></div></div>}
      </motion.div>
    </motion.section>
  )}</AnimatePresence>;
}
