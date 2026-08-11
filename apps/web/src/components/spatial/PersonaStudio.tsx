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
const faceShapes: PersonaConfig["face"]["shape"][] = ["soft", "oval", "angular"];
const hairStyles: PersonaConfig["face"]["hairStyle"][] = ["hood", "short", "bob", "bare"];
const skinTones: PersonaConfig["face"]["skin"][] = ["porcelain", "warm", "umber", "deep"];
const eyeColors: PersonaConfig["face"]["eyes"][] = ["charcoal", "hazel", "moss"];
const hairColors: PersonaConfig["face"]["hairColor"][] = ["ink", "brown", "silver"];

export function PersonaStudio() {
  const open = useAgentStore((s) => s.personaStudioOpen);
  const close = useAgentStore((s) => s.setPersonaStudioOpen);
  const persona = useAgentStore((s) => s.persona);
  const setPersona = useAgentStore((s) => s.setPersona);
  const avatarAsset = useAgentStore((s) => s.avatarAsset);
  const setAvatarAsset = useAgentStore((s) => s.setAvatarAsset);
  const reduce = useReducedMotion();

  return <AnimatePresence>{open && <motion.aside className="persona-studio" role="dialog" aria-modal="true" aria-label="Customize AI form" initial={reduce ? false : { x: "100%" }} animate={{ x: 0 }} exit={reduce ? { opacity: 0 } : { x: "100%" }} transition={{ type: "spring", stiffness: 180, damping: 25 }}>
    <header><div><small>PERSONA STUDIO</small><h2>Shape your presence.</h2></div><button aria-label="Close persona studio" onClick={() => close(false)}>×</button></header>
    <p>Your form changes how your agent appears, not what it may access. Identity and permissions remain separate.</p>
    <label className="persona-name"><span>DISPLAY NAME</span><input maxLength={18} value={persona.name} onChange={(event) => setPersona({ name: event.target.value.toUpperCase() })} /></label>
    <section><h3>FORM</h3><div className="form-options">{forms.map(form => <button key={form.value} className={persona.form === form.value ? "selected" : ""} onClick={() => setPersona({ form: form.value })}><i className={`form-glyph glyph-${form.value}`} /><strong>{form.label}</strong><small>{form.note}</small></button>)}</div></section>
    {persona.form === "human" && <><section className="model-import"><div><h3>HUMAN MODEL</h3><span>PRIVATE · SESSION ONLY</span></div><p>Import a rigged GLB from your device. The file stays in this browser session.</p><label><input type="file" accept=".glb,model/gltf-binary" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (avatarAsset) URL.revokeObjectURL(avatarAsset.url); setAvatarAsset({ url: URL.createObjectURL(file), name: file.name }); }} /><b>{avatarAsset ? avatarAsset.name : "CHOOSE LOCAL GLB"}</b></label>{avatarAsset && <button onClick={() => { URL.revokeObjectURL(avatarAsset.url); setAvatarAsset(null); }}>REMOVE MODEL</button>}</section><section className="face-controls"><div className="face-heading"><h3>FACE</h3><span>{avatarAsset ? "PROCEDURAL FALLBACK" : "APPEARANCE ONLY"}</span></div><div className="face-grid">
      <fieldset><legend>SHAPE</legend><div className="choice-row">{faceShapes.map(shape => <button key={shape} className={persona.face.shape === shape ? "selected" : ""} onClick={() => setPersona({ face: { ...persona.face, shape } })}>{shape}</button>)}</div></fieldset>
      <fieldset><legend>HAIR</legend><div className="choice-row four">{hairStyles.map(hairStyle => <button key={hairStyle} className={persona.face.hairStyle === hairStyle ? "selected" : ""} onClick={() => setPersona({ face: { ...persona.face, hairStyle } })}>{hairStyle}</button>)}</div></fieldset>
      <fieldset><legend>SKIN</legend><div className="appearance-swatches">{skinTones.map(skin => <button key={skin} aria-label={`Skin ${skin}`} className={`skin-${skin} ${persona.face.skin === skin ? "selected" : ""}`} onClick={() => setPersona({ face: { ...persona.face, skin } })} />)}</div></fieldset>
      <fieldset><legend>EYES</legend><div className="appearance-swatches small">{eyeColors.map(eyes => <button key={eyes} aria-label={`Eyes ${eyes}`} className={`eyes-${eyes} ${persona.face.eyes === eyes ? "selected" : ""}`} onClick={() => setPersona({ face: { ...persona.face, eyes } })} />)}</div></fieldset>
      <fieldset><legend>HAIR COLOR</legend><div className="appearance-swatches small">{hairColors.map(hairColor => <button key={hairColor} aria-label={`Hair ${hairColor}`} className={`hair-${hairColor} ${persona.face.hairColor === hairColor ? "selected" : ""}`} onClick={() => setPersona({ face: { ...persona.face, hairColor } })} />)}</div></fieldset>
    </div></section></>}
    <section><h3>FINISH</h3><div className="choice-row">{finishes.map(finish => <button key={finish} className={persona.finish === finish ? "selected" : ""} onClick={() => setPersona({ finish })}>{finish}</button>)}</div></section>
    <section><h3>SIGNAL COLOR</h3><div className="accent-row">{accents.map(accent => <button key={accent} aria-label={accent} className={`${accent} ${persona.accent === accent ? "selected" : ""}`} onClick={() => setPersona({ accent })} />)}</div></section>
    <label className="aura-control"><span>AURA INTENSITY</span><output>{Math.round(persona.aura * 100)}</output><input aria-label="Aura intensity" type="range" min="0.1" max="1" step="0.05" value={persona.aura} onChange={(event) => setPersona({ aura: Number(event.target.value) })} /></label>
    <footer><span>STORED ON THIS DEVICE</span><button onClick={() => close(false)}>KEEP THIS FORM</button></footer>
  </motion.aside>}</AnimatePresence>;
}
