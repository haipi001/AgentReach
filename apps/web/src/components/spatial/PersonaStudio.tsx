"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";
import type { PersonaConfig } from "@/types/agent";

const forms: { value: PersonaConfig["form"]; label: string; note: string }[] = [
  { value: "human", label: "Human", note: "Embodied and familiar" },
  { value: "monolith", label: "Monolith", note: "Quiet and grounded" },
  { value: "orbital", label: "Orbital", note: "Open and exploratory" },
  { value: "totem", label: "Totem", note: "Structured and decisive" },
];
const finishes: PersonaConfig["finish"][] = ["matte", "chrome", "porcelain"];
const accents: PersonaConfig["accent"][] = ["lichen", "cobalt", "ember"];

export function PersonaStudio() {
  const open = useAgentStore((s) => s.personaStudioOpen);
  const close = useAgentStore((s) => s.setPersonaStudioOpen);
  const persona = useAgentStore((s) => s.persona);
  const setPersona = useAgentStore((s) => s.setPersona);
  const reduce = useReducedMotion();

  return <AnimatePresence>{open && <motion.aside className="persona-studio" role="dialog" aria-modal="true" aria-label="Customize AI form" initial={reduce ? false : { x: "100%" }} animate={{ x: 0 }} exit={reduce ? { opacity: 0 } : { x: "100%" }} transition={{ type: "spring", stiffness: 180, damping: 25 }}>
    <header><div><small>PERSONA STUDIO</small><h2>Shape your presence.</h2></div><button aria-label="Close persona studio" onClick={() => close(false)}>×</button></header>
    <p>Your form changes how your agent appears, not what it may access. Identity and permissions remain separate.</p>
    <label className="persona-name"><span>DISPLAY NAME</span><input maxLength={18} value={persona.name} onChange={(event) => setPersona({ name: event.target.value.toUpperCase() })} /></label>
    <section><h3>FORM</h3><div className="form-options">{forms.map(form => <button key={form.value} className={persona.form === form.value ? "selected" : ""} onClick={() => setPersona({ form: form.value })}><i className={`form-glyph glyph-${form.value}`} /><strong>{form.label}</strong><small>{form.note}</small></button>)}</div></section>
    <section><h3>FINISH</h3><div className="choice-row">{finishes.map(finish => <button key={finish} className={persona.finish === finish ? "selected" : ""} onClick={() => setPersona({ finish })}>{finish}</button>)}</div></section>
    <section><h3>SIGNAL COLOR</h3><div className="accent-row">{accents.map(accent => <button key={accent} aria-label={accent} className={`${accent} ${persona.accent === accent ? "selected" : ""}`} onClick={() => setPersona({ accent })} />)}</div></section>
    <label className="aura-control"><span>AURA INTENSITY</span><output>{Math.round(persona.aura * 100)}</output><input aria-label="Aura intensity" type="range" min="0.1" max="1" step="0.05" value={persona.aura} onChange={(event) => setPersona({ aura: Number(event.target.value) })} /></label>
    <footer><span>STORED ON THIS DEVICE</span><button onClick={() => close(false)}>KEEP THIS FORM</button></footer>
  </motion.aside>}</AnimatePresence>;
}
