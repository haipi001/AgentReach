"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SYSTEMS = [
  { index: "01", zone: "HEAD", plane: "SELF", title: "Identity is embodied, not exposed.", copy: "The face, voice and name make the agent recognisable to you. They never become proof of authority and never widen access.", signals: ["IDENTITY / LOCAL", "FACE / USER OWNED", "VOICE / REVOCABLE", "MASK / OPTIONAL", "NAME / HAIPI", "EXPORT / LOCKED"] },
  { index: "02", zone: "CORE", plane: "AGENCY", title: "Intent passes through a boundary.", copy: "The core translates what you want into a scoped plan. Disclosure, contact and commitment stop here until policy and human approval agree.", signals: ["INTENT / PRIVATE", "BOUNDARY / NORMAL", "AUTONOMY / L2", "POLICY / ACTIVE", "APPROVAL / HUMAN", "SCOPE / MINIMUM"] },
  { index: "03", zone: "HANDS", plane: "WORLD", title: "Skills touch the world deliberately.", copy: "Tools are not personality traits. Each capability has a narrow grant, a visible target and a reversible path before it can act outside SELF.", signals: ["SKILLS / 06", "GRANTS / SCOPED", "REACH / HUMAN ASK", "GITHUB / LOCAL", "MAILBOX / READY", "REVOKE / READY"] },
  { index: "04", zone: "NETWORK", plane: "WORLD", title: "Relations remain directional.", copy: "People and communities are approached through minimum context capsules. Your private relationship graph never becomes a global score.", signals: ["RELATIONS / 127", "CLAIMS / MINIMUM", "CONSENT / MUTUAL", "DOMAINS / 03", "OPEN LOOPS / 06", "GRAPH / PRIVATE"] },
  { index: "05", zone: "TRACE", plane: "EVIDENCE", title: "Proof returns before memory.", copy: "A separate verifier reads the resulting world state. Only verified effects can become durable experience for the Personal Agent.", signals: ["EVIDENCE / VERIFIED", "TRACE / 12", "MEMORY / GUARDED", "RECEIPTS / 02", "DENIALS / VISIBLE", "WRITEBACK / PROVED"] },
] as const;

export function CapabilityAtlas() {
  const reduceMotion = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const systems = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  useEffect(() => {
    const measure = () => {
      if (!systems.current) return;
      setTravel(Math.max(0, systems.current.scrollWidth - window.innerWidth * .58));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (systems.current) observer.observe(systems.current);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  return <section className="capability-atlas" aria-labelledby="atlas-title">
    <header className="atlas-intro"><span>ANATOMY OF A PERSONAL AGENT / 003</span><h2 id="atlas-title">One presence.<br/><em>Five trust systems.</em></h2><p>Every part is a bounded capability—not an upgrade slot, and never a hidden permission.</p></header>
    <div ref={track} className="atlas-horizontal-track">
      <div className="atlas-sticky">
        <div className="atlas-title-rail"><span>SYSTEM MAP</span><b>01—05</b></div>
        <figure className="atlas-body" aria-hidden="true"><div className="atlas-wire-head"><i/><i/><i/><b/></div><figcaption>SELF / LOCAL HEAD</figcaption></figure>
        <motion.div ref={systems} className="atlas-systems" style={reduceMotion ? undefined : { x }}>{SYSTEMS.map((system) => <motion.article key={system.index} className="atlas-system">
        <div className="system-meta"><b>{system.index}</b><span>{system.zone}</span><i>{system.plane}</i></div>
        <h3>{system.title}</h3><p>{system.copy}</p>
        <div className="system-signals">{system.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
      </motion.article>)}</motion.div>
        <motion.div className="atlas-progress" style={{ scaleX: scrollYProgress }} />
      </div>
    </div>
    <section className="atlas-end"><span>ALL SYSTEMS VISIBLE / 005</span><h3>Your agent can act.<br/><em>You stay in control.</em></h3><p>Every capability remains inspectable, scoped and reversible.</p></section>
  </section>;
}
