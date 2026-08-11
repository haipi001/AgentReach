"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const SYSTEMS = [
  { index: "01", zone: "HEAD", plane: "SELF", title: "Identity is embodied, not exposed.", copy: "The face, voice and name make the agent recognisable to you. They never become proof of authority and never widen access.", signals: ["IDENTITY / LOCAL", "FACE / USER OWNED", "VOICE / REVOCABLE", "MASK / OPTIONAL", "NAME / HAIPI", "EXPORT / LOCKED"] },
  { index: "02", zone: "CORE", plane: "AGENCY", title: "Intent passes through a boundary.", copy: "The core translates what you want into a scoped plan. Disclosure, contact and commitment stop here until policy and human approval agree.", signals: ["INTENT / PRIVATE", "BOUNDARY / NORMAL", "AUTONOMY / L2", "POLICY / ACTIVE", "APPROVAL / HUMAN", "SCOPE / MINIMUM"] },
  { index: "03", zone: "HANDS", plane: "WORLD", title: "Skills touch the world deliberately.", copy: "Tools are not personality traits. Each capability has a narrow grant, a visible target and a reversible path before it can act outside SELF.", signals: ["SKILLS / 06", "GRANTS / SCOPED", "REACH / HUMAN ASK", "GITHUB / LOCAL", "MAILBOX / READY", "REVOKE / READY"] },
  { index: "04", zone: "NETWORK", plane: "WORLD", title: "Relations remain directional.", copy: "People and communities are approached through minimum context capsules. Your private relationship graph never becomes a global score.", signals: ["RELATIONS / 127", "CLAIMS / MINIMUM", "CONSENT / MUTUAL", "DOMAINS / 03", "OPEN LOOPS / 06", "GRAPH / PRIVATE"] },
  { index: "05", zone: "TRACE", plane: "EVIDENCE", title: "Proof returns before memory.", copy: "A separate verifier reads the resulting world state. Only verified effects can become durable experience for the Personal Agent.", signals: ["EVIDENCE / VERIFIED", "TRACE / 12", "MEMORY / GUARDED", "RECEIPTS / 02", "DENIALS / VISIBLE", "WRITEBACK / PROVED"] },
] as const;

export function CapabilityAtlas() {
  const reduceMotion = useReducedMotion();
  return <section className="capability-atlas" aria-labelledby="atlas-title">
    <header className="atlas-intro"><span>ANATOMY OF A PERSONAL AGENT</span><h2 id="atlas-title">One body.<br/><em>Five trust systems.</em></h2><p>Scroll through the body to see where appearance ends, agency begins, and proof returns.</p></header>
    <div className="atlas-grid">
      <figure className="atlas-body" aria-hidden="true"><div className="atlas-body-glow"/><Image className="atlas-base" src="/images/agentreach-base-body-v1.png" width={943} height={1676} alt="" sizes="(max-width: 820px) 86vw, 42vw"/><Image className="atlas-armor" src="/images/agentreach-armor-overlay-v1.png" width={943} height={1676} alt="" sizes="(max-width: 820px) 86vw, 42vw"/></figure>
      <div className="atlas-systems">{SYSTEMS.map((system) => <motion.article key={system.index} className="atlas-system" initial={false} whileInView={reduceMotion ? undefined : { y: [28, 0] }} viewport={{ amount: .32 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}>
        <div className="system-meta"><b>{system.index}</b><span>{system.zone}</span><i>{system.plane}</i></div>
        <h3>{system.title}</h3><p>{system.copy}</p>
        <div className="system-signals">{system.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
      </motion.article>)}</div>
    </div>
  </section>;
}
