"use client";

import { motion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";
import { zh } from "@/lib/i18n";

export function ConnectedState() {
  const view = useAgentStore((s) => s.view);
  const demo = useAgentStore((s) => s.demo);
  const setView = useAgentStore((s) => s.setView);
  if (view !== "connected" || !demo) return null;
  const rejected = demo.stage === "PEER_REJECTED";
  return <motion.section className={`connected-layer ${rejected ? "is-rejected" : ""}`} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}>
    <span className="connected-kicker">{rejected ? "尊重对方选择" : "现实已改变 / 验证通过"}</span><div className="connection-visual"><i/><b/><i/></div><h2>{rejected ? "Alice 选择不建立连接。" : "意图已经成为证据。"}</h2><p>{rejected ? "没有创建协作承诺，也没有共享更多上下文。" : `${demo.selected_candidate?.display_name} ↔ Haipi · ${zh(demo.commitment?.objective)}`}</p>
    {!rejected && <><div className="world-proof">{demo.evidence.map(item => <article key={item.type}><small>{zh(item.type)}</small><strong>✓ {zh(item.label)}</strong></article>)}<article><small>{zh("personal agent memory")}</small><strong>✓ {zh("Memory updated")}</strong></article></div><div className="verify-list">{demo.verification?.checks.filter(check => ["Repository updated", "Introduction sent", "2 actions independently verified"].includes(check.name)).map(check => <span key={check.name}>✓ {zh(check.name)}</span>)}</div></>}
    <button onClick={() => setView("self")}>返回个人空间</button>
  </motion.section>;
}
