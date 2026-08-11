"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { demoApi } from "@/lib/api";
import { zh } from "@/lib/i18n";
import { useAgentStore } from "@/stores/agent-store";

export function CapsuleFlow() {
  const view = useAgentStore((s) => s.view);
  const demo = useAgentStore((s) => s.demo);
  const setDemo = useAgentStore((s) => s.setDemo);
  const setView = useAgentStore((s) => s.setView);
  const setState = useAgentStore((s) => s.setAgentState);
  const [step, setStep] = useState<"capsule" | "peer" | "commitment">("capsule");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (demo?.stage === "WAITING_PEER_APPROVAL" || demo?.stage === "INTRO_SENT") setStep("peer");
    if (demo?.stage === "COMMITMENT_PROPOSED" || demo?.stage === "INTRO_ACCEPTED") setStep("commitment");
    if (demo?.stage === "WAITING_USER_APPROVAL") setStep("capsule");
  }, [demo?.stage]);

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
        <header><span>上下文胶囊 / 二级授权</span><button aria-label="关闭上下文胶囊" onClick={() => { setState("idle"); setView("reach"); }}>×</button></header>
        {step === "capsule" && <>
          <h2>你即将触达<br/><em>{demo.selected_candidate?.display_name}。</em></h2><p className="capsule-lead">边界智能体已为这次介绍准备好最小充分上下文。</p>
          <div className="disclosure-grid"><div><span>将会共享</span><ul><li>706 成员身份</li><li>个人智能体方向的兴趣</li><li>潜在协作请求</li><li>上下文胶囊将在 24 小时后失效</li></ul></div><div className="private"><span>保持私有</span><ul>{demo.removed_fields.map(field => <li key={field}>{field}</li>)}</ul></div></div>
          <div className="capsule-actions"><button className="ghost-action" onClick={() => { setState("idle"); setView("reach"); }}>取消</button><button className="reach-action" disabled={busy} onClick={() => perform(demoApi.approveIntro, "peer")}>批准并触达 ↗</button></div>
        </>}
        {step === "peer" && <div className="peer-consent"><span className="signal-ring"><i/></span><small>ALICE 智能体 / 收件箱</small><h2>Haipi 希望讨论<br/>个人智能体协作协议。</h2><p>只有经过批准的上下文胶囊抵达。Alice 的私有上下文仍不可访问。</p><div className="capsule-actions"><button className="ghost-action" disabled={busy} onClick={() => perform(() => demoApi.peerDecision(false), "done")}>拒绝</button><button className="reach-action" disabled={busy} onClick={() => perform(() => demoApi.peerDecision(true), "commitment")}>ALICE 接受</button></div></div>}
        {step === "commitment" && demo.commitment && <div className="commitment-view"><span>现实行动闸门 / 三级强确认</span><h2>{zh(demo.commitment.objective)}</h2><dl><dt>参与方</dt><dd>{demo.commitment.parties.join(" ↔ ")}</dd><dt>行动 01</dt><dd>创建 AgentReach/docs/vision.md</dd><dt>行动 02</dt><dd>发送协作请求 → Alice 收件箱</dd><dt>边界</dt><dd>仅限这两项行动 · 本地 GitHub 沙箱</dd><dt>验证器</dt><dd>独立运行 / 只读</dd></dl><div className="capsule-actions"><button className="ghost-action" onClick={() => setView("self")}>暂不执行</button><button className="reach-action" disabled={busy} onClick={() => perform(demoApi.approveCommitment, "done")}>执行并验证 ↗</button></div></div>}
      </motion.div>
    </motion.section>
  )}</AnimatePresence>;
}
