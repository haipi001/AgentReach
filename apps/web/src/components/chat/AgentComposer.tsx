"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { demoApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";

export function AgentComposer() {
  const [text, setText] = useState("最近我想继续做个人智能体，有没有合适的人？");
  const [error, setError] = useState("");
  const setDemo = useAgentStore((s) => s.setDemo);
  const setState = useAgentStore((s) => s.setAgentState);
  const setView = useAgentStore((s) => s.setView);

  async function reach() {
    if (!text.trim()) return;
    setError("");
    try {
      setState("thinking");
      await demoApi.reset();
      await demoApi.intent(text);
      setState("searching");
      const result = await demoApi.discover();
      setDemo(result);
      window.setTimeout(() => { setView("reach"); setState("idle"); }, 650);
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "无法连接个人智能体");
    }
  }

  return (
    <motion.div className="composer" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .35 }}>
      <div className="composer-prompt"><span>我们正在思考什么？</span><i>仅本地</i></div>
      <div className="composer-row"><span className="prompt-mark">›</span><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && reach()} aria-label="与你的智能体对话" /><button onClick={reach}>开始触达 <b>↗</b></button></div>
      {error && <p className="composer-error">{error}</p>}
    </motion.div>
  );
}
