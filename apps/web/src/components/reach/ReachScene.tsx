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
          <div className="reach-heading"><span>触达模式 / 706 信任域</span><h2>你的智能体发现了<br />三条可能的路径。</h2><p>共享声明 × 私有关系上下文。匹配仅在本地完成。</p></div>
          <button className="back-link" onClick={() => setView("self")}>← 返回个人空间</button>
          <div className="network-lines" aria-hidden="true"><i/><i/><i/></div>
          <div className="self-node"><span>你</span><strong>HAIPI 智能体</strong></div>
          {demo.candidates.map((candidate, index) => (
            <motion.button key={candidate.id} className={`peer-node ${positions[index]}`} onClick={() => select(candidate.id)} initial={{ opacity: 0, scale: .4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .25 + index * .16, type: "spring" }}>
              <span className="peer-score">{candidate.score_percent}</span><i/><strong>{candidate.display_name}</strong><small>{candidate.reasons[0]}<br/>{candidate.reasons[2]}</small><b>查看 →</b>
            </motion.button>
          ))}
          <div className="domain-node domain-706">706<small>社区</small></div><div className="domain-node domain-ai">编程<small>能力</small></div><div className="world-entity"><small>代码仓库 / 写入受控</small><strong>AgentReach</strong><span>docs/vision.md</span></div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
