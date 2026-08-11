"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { demoApi } from "@/lib/api";
import { zh } from "@/lib/i18n";
import { useAgentStore } from "@/stores/agent-store";

export function TracePanel() {
  const [open, setOpen] = useState(false);
  const demo = useAgentStore((s) => s.demo);
  const setDemo = useAgentStore((s) => s.setDemo);
  async function attack() { setDemo(await demoApi.privacyAttack()); }
  return <>
    <button className="trace-trigger" onClick={() => setOpen(!open)}><i /> 轨迹 <span>{demo?.trace.length ?? 0}</span></button>
    <AnimatePresence>{open && <motion.aside className="trace-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
      <header><div><span>执行证据</span><strong>{demo?.trace_id ?? "暂无活动轨迹"}</strong></div><button aria-label="关闭轨迹面板" onClick={() => setOpen(false)}>×</button></header>
      <div className="trace-verdict"><span>独立验证器</span><strong>{demo?.verification ? zh(demo.verification.verdict) : "尚未运行"}</strong>{demo?.verification?.checks.map(check => <p key={check.name}>{check.passed ? "✓" : "×"} {zh(check.name)}</p>)}</div>
      <button className="attack-action" onClick={attack}>测试隐私边界 <span>请求完整关系图</span></button>
      {demo?.privacy_denials.at(-1) && <div className="denied-proof">已拒绝 / {zh(demo.privacy_denials.at(-1)?.reason)}</div>}
      <div className="trace-events">{[...(demo?.trace ?? [])].reverse().map(event => <article key={event.sequence}><small>#{event.sequence} / {zh(event.agent_label)}</small><strong>{zh(event.event_type)}</strong><p>{event.summary}</p><span>{zh(event.decision)}</span></article>)}</div>
    </motion.aside>}</AnimatePresence>
  </>;
}
