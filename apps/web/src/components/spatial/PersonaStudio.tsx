"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";
import type { PersonaConfig } from "@/types/agent";

const forms: { value: PersonaConfig["form"]; label: string; note: string }[] = [
  { value: "human", label: "虚拟人", note: "具身、亲切且熟悉" },
  { value: "monolith", label: "纪念碑", note: "安静、稳定且克制" },
  { value: "orbital", label: "轨道体", note: "开放、流动且探索" },
  { value: "totem", label: "图腾", note: "结构清晰且果断" },
];
const finishes: PersonaConfig["finish"][] = ["matte", "chrome", "porcelain"];
const accents: PersonaConfig["accent"][] = ["lichen", "cobalt", "ember"];
const faceShapes: PersonaConfig["face"]["shape"][] = ["soft", "oval", "angular"];
const hairStyles: PersonaConfig["face"]["hairStyle"][] = ["hood", "short", "bob", "bare"];
const skinTones: PersonaConfig["face"]["skin"][] = ["porcelain", "warm", "umber", "deep"];
const eyeColors: PersonaConfig["face"]["eyes"][] = ["charcoal", "hazel", "moss"];
const hairColors: PersonaConfig["face"]["hairColor"][] = ["ink", "brown", "silver"];

const labels = {
  finish: { matte: "哑光", chrome: "镜面金属", porcelain: "陶瓷" },
  faceShape: { soft: "柔和", oval: "椭圆", angular: "棱角" },
  hairStyle: { hood: "兜帽", short: "短发", bob: "波波头", bare: "无发" },
  skin: { porcelain: "瓷白", warm: "暖色", umber: "棕褐", deep: "深色" },
  eyes: { charcoal: "炭黑", hazel: "榛色", moss: "苔绿" },
  hairColor: { ink: "墨黑", brown: "棕色", silver: "银色" },
  accent: { lichen: "苔藓绿", cobalt: "钴蓝", ember: "余烬橙" },
} as const;

export function PersonaStudio() {
  const open = useAgentStore((s) => s.personaStudioOpen);
  const close = useAgentStore((s) => s.setPersonaStudioOpen);
  const persona = useAgentStore((s) => s.persona);
  const setPersona = useAgentStore((s) => s.setPersona);
  const avatarAsset = useAgentStore((s) => s.avatarAsset);
  const setAvatarAsset = useAgentStore((s) => s.setAvatarAsset);
  const reduce = useReducedMotion();

  return <AnimatePresence>{open && <motion.aside className="persona-studio" role="dialog" aria-modal="true" aria-label="自定义人工智能形象" initial={reduce ? false : { x: "100%" }} animate={{ x: 0 }} exit={reduce ? { opacity: 0 } : { x: "100%" }} transition={{ type: "spring", stiffness: 180, damping: 25 }}>
    <header><div><small>虚拟形象工作室</small><h2>塑造你的数字存在。</h2></div><button aria-label="关闭虚拟形象工作室" onClick={() => close(false)}>×</button></header>
    <p>形象只改变智能体如何呈现，不会改变它能够访问的内容。身份与权限始终相互独立。</p>
    <label className="persona-name"><span>显示名称</span><input aria-label="虚拟形象显示名称" maxLength={18} value={persona.name} onChange={(event) => setPersona({ name: event.target.value.toUpperCase() })} /></label>
    <section><h3>形态</h3><div className="form-options">{forms.map(form => <button key={form.value} className={persona.form === form.value ? "selected" : ""} onClick={() => setPersona({ form: form.value })}><i className={`form-glyph glyph-${form.value}`} /><strong>{form.label}</strong><small>{form.note}</small></button>)}</div></section>
    {persona.form === "human" && <><section className="model-import"><div><h3>虚拟人模型</h3><span>私有 · 仅限当前会话</span></div><p>从你的设备导入带骨骼的 GLB 模型。文件只保留在当前浏览器会话中。</p><label><input aria-label="选择本地 GLB 模型" type="file" accept=".glb,model/gltf-binary" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (avatarAsset) URL.revokeObjectURL(avatarAsset.url); setAvatarAsset({ url: URL.createObjectURL(file), name: file.name }); }} /><b>{avatarAsset ? avatarAsset.name : "选择本地 GLB"}</b></label>{avatarAsset && <button onClick={() => { URL.revokeObjectURL(avatarAsset.url); setAvatarAsset(null); }}>移除模型</button>}</section><section className="face-controls"><div className="face-heading"><h3>面部</h3><span>{avatarAsset ? "程序化形象备用" : "仅改变外观"}</span></div><div className="face-grid">
      <fieldset><legend>脸型</legend><div className="choice-row">{faceShapes.map(shape => <button key={shape} className={persona.face.shape === shape ? "selected" : ""} onClick={() => setPersona({ face: { ...persona.face, shape } })}>{labels.faceShape[shape]}</button>)}</div></fieldset>
      <fieldset><legend>发型</legend><div className="choice-row four">{hairStyles.map(hairStyle => <button key={hairStyle} className={persona.face.hairStyle === hairStyle ? "selected" : ""} onClick={() => setPersona({ face: { ...persona.face, hairStyle } })}>{labels.hairStyle[hairStyle]}</button>)}</div></fieldset>
      <fieldset><legend>肤色</legend><div className="appearance-swatches">{skinTones.map(skin => <button key={skin} aria-label={`肤色：${labels.skin[skin]}`} className={`skin-${skin} ${persona.face.skin === skin ? "selected" : ""}`} onClick={() => setPersona({ face: { ...persona.face, skin } })} />)}</div></fieldset>
      <fieldset><legend>瞳色</legend><div className="appearance-swatches small">{eyeColors.map(eyes => <button key={eyes} aria-label={`瞳色：${labels.eyes[eyes]}`} className={`eyes-${eyes} ${persona.face.eyes === eyes ? "selected" : ""}`} onClick={() => setPersona({ face: { ...persona.face, eyes } })} />)}</div></fieldset>
      <fieldset><legend>发色</legend><div className="appearance-swatches small">{hairColors.map(hairColor => <button key={hairColor} aria-label={`发色：${labels.hairColor[hairColor]}`} className={`hair-${hairColor} ${persona.face.hairColor === hairColor ? "selected" : ""}`} onClick={() => setPersona({ face: { ...persona.face, hairColor } })} />)}</div></fieldset>
    </div></section></>}
    <section><h3>材质</h3><div className="choice-row">{finishes.map(finish => <button key={finish} className={persona.finish === finish ? "selected" : ""} onClick={() => setPersona({ finish })}>{labels.finish[finish]}</button>)}</div></section>
    <section><h3>信号色</h3><div className="accent-row">{accents.map(accent => <button key={accent} aria-label={`信号色：${labels.accent[accent]}`} className={`${accent} ${persona.accent === accent ? "selected" : ""}`} onClick={() => setPersona({ accent })} />)}</div></section>
    <label className="aura-control"><span>光环强度</span><output>{Math.round(persona.aura * 100)}</output><input aria-label="光环强度" type="range" min="0.1" max="1" step="0.05" value={persona.aura} onChange={(event) => setPersona({ aura: Number(event.target.value) })} /></label>
    <footer><span>仅存储在本设备</span><button onClick={() => close(false)}>保存当前形象</button></footer>
  </motion.aside>}</AnimatePresence>;
}
