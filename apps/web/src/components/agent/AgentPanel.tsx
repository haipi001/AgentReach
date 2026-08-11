"use client";

import { AnimatePresence, motion } from "motion/react";
import { personalAgentData } from "@/data/personal-agent";
import { useAgentStore } from "@/stores/agent-store";

export function AgentPanel() {
  const active = useAgentStore((s) => s.activeOrbit);
  const setActive = useAgentStore((s) => s.setActiveOrbit);
  const data = active ? personalAgentData[active] : null;
  const orbitName = active ? ({ IDENTITY: "身份", MEMORY: "记忆", INTENT: "意图", SKILLS: "能力", RELATIONS: "关系", BOUNDARY: "边界", REACH: "触达" } as const)[active] : "";
  return (
    <AnimatePresence>
      {data && (
        <motion.aside className="agent-panel" initial={{ opacity: 0, x: 30, scale: .98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 24 }}>
          <button className="panel-close" onClick={() => setActive(null)} aria-label="关闭面板">×</button>
          <span className="panel-kicker">个人层 / {orbitName}</span>
          <h2>{data.title}</h2><p>{data.lead}</p>
          <div className="agent-stats">{data.items.map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong>{item.note && <small>{item.note}</small>}</div>)}</div>
          <div className="panel-proof"><i />私有空间已验证</div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
