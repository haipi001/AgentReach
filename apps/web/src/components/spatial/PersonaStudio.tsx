"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AgentCore } from "./AgentCore";
import { useAgentStore } from "@/stores/agent-store";
import type { PersonaConfig } from "@/types/agent";

const finishes: PersonaConfig["finish"][] = ["matte", "chrome", "porcelain"];
const accents: PersonaConfig["accent"][] = ["lichen", "cobalt", "ember"];
const labels = {
  finish: { matte: "柔雾", chrome: "虹彩镜面", porcelain: "乳白玻璃" },
  accent: { lichen: "薄荷绿", cobalt: "钴蓝", ember: "暖金" },
} as const;

export function PersonaStudio() {
  const open = useAgentStore((state) => state.personaStudioOpen);
  const close = useAgentStore((state) => state.setPersonaStudioOpen);
  const persona = useAgentStore((state) => state.persona);
  const setPersona = useAgentStore((state) => state.setPersona);
  const reduce = useReducedMotion();

  return <AnimatePresence>{open && <motion.aside className="persona-studio core-studio" role="dialog" aria-modal="true" aria-label="校准人工智能核心" initial={reduce ? false : { x: "100%" }} animate={{ x: 0 }} exit={reduce ? { opacity: 0 } : { x: "100%" }} transition={{ type: "spring", stiffness: 180, damping: 25 }}>
    <header><div><small>核心校准台</small><h2>校准你的数字核心。</h2></div><button aria-label="关闭核心校准台" onClick={() => close(false)}>×</button></header>
    <p>光球是智能体运行状态的抽象表达，不模拟人物，也不改变身份、权限或行动边界。</p>
    <div className="core-studio-preview"><AgentCore/><span>实时 3D 核心 / 私有运行</span></div>
    <label className="persona-name"><span>核心名称</span><input aria-label="智能体核心名称" maxLength={18} value={persona.name} onChange={(event) => setPersona({ name: event.target.value.toUpperCase() })}/></label>
    <section><h3>表面质感</h3><div className="choice-row">{finishes.map((finish) => <button key={finish} className={persona.finish === finish ? "selected" : ""} onClick={() => setPersona({ finish })}>{labels.finish[finish]}</button>)}</div></section>
    <section><h3>信号色</h3><div className="accent-row">{accents.map((accent) => <button key={accent} aria-label={`信号色：${labels.accent[accent]}`} className={`${accent} ${persona.accent === accent ? "selected" : ""}`} onClick={() => setPersona({ accent })}/>)}</div></section>
    <label className="aura-control"><span>场强</span><output>{Math.round(persona.aura * 100)}</output><input aria-label="光球场强" type="range" min="0.1" max="1" step="0.05" value={persona.aura} onChange={(event) => setPersona({ aura: Number(event.target.value) })}/></label>
    <footer><span>仅保存核心偏好 · 本机存储</span><button onClick={() => close(false)}>保存校准</button></footer>
  </motion.aside>}</AnimatePresence>;
}
