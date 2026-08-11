"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useState } from "react";

const PARAMETERS = [
  { id: "identity", label: "IDENTITY", value: "LOCAL / OWNED", detail: "Name, form and voice stay bound to your local identity profile." },
  { id: "memory", label: "MEMORY", value: "GUARDED / 128", detail: "Only independently verified experience can enter durable memory." },
  { id: "intent", label: "INTENT", value: "PRIVATE / LIVE", detail: "Raw intent remains private while minimum claims can be shared." },
  { id: "boundary", label: "BOUNDARY", value: "NORMAL / L2", detail: "Policy and human approval constrain every outward action." },
  { id: "skills", label: "SKILLS", value: "06 / SCOPED", detail: "Each tool has a narrow target, grant and reversible path." },
  { id: "relations", label: "RELATIONS", value: "127 / PRIVATE", detail: "Connections remain directional and never become a public score." },
  { id: "reach", label: "REACH", value: "READY / MUTUAL", detail: "Contact begins with a minimum capsule and requires mutual consent." },
] as const;

export function ParameterConstellation({ progress }: { progress: MotionValue<number> }) {
  const [active, setActive] = useState<(typeof PARAMETERS)[number]>(PARAMETERS[0]);
  const opacity = useTransform(progress, [0, .08, .28, .72, .9], [.42, .58, 1, 1, 0]);
  const scale = useTransform(progress, [0, .25, .72], [.94, 1, 1.035]);
  const detailX = useTransform(progress, [0, .2], [28, 0]);

  return <motion.div className="parameter-constellation" style={{ opacity, scale }}>
    <div className="parameter-orbit" aria-label="Personal agent parameters">
      {PARAMETERS.map((parameter) => <button
        key={parameter.id}
        className={`parameter-node node-${parameter.id}${active.id === parameter.id ? " active" : ""}`}
        onMouseEnter={() => setActive(parameter)}
        onFocus={() => setActive(parameter)}
        onClick={() => setActive(parameter)}
      ><i/><span>{parameter.label}</span><b>{parameter.value}</b></button>)}
    </div>
    <motion.aside className="parameter-detail" style={{ x: detailX }} key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <span>PARAMETER / {String(PARAMETERS.indexOf(active) + 1).padStart(2, "0")}</span>
      <strong>{active.label}</strong>
      <p>{active.detail}</p>
      <small>HOVER NODES TO INSPECT</small>
    </motion.aside>
  </motion.div>;
}
