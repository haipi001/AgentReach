"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type MouseEvent } from "react";
import { AgentComposer } from "@/components/chat/AgentComposer";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { AgentStage } from "@/components/spatial/AgentStage";
import { IdentityHalo } from "@/components/spatial/IdentityHalo";
import { useAgentStore } from "@/stores/agent-store";

export function ImmersiveHero() {
  const track = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const view = useAgentStore((state) => state.view);
  const openStudio = useAgentStore((state) => state.setPersonaStudioOpen);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 24 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 24 });
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end start"] });
  const presenceScale = useTransform(scrollYProgress, [0, .72, 1], [1, 1.08, .82]);
  const presenceY = useTransform(scrollYProgress, [0, .72, 1], [0, -18, 120]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyOpacity = useTransform(scrollYProgress, [0, .72, 1], [1, .8, 0]);

  function move(event: MouseEvent<HTMLElement>) {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - .5) * 24);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - .5) * 14);
  }

  return <section ref={track} className="hero-track" onMouseMove={move} onMouseLeave={() => { pointerX.set(0); pointerY.set(0); }}>
    <div className="hero-sticky">
      <div className="hero-chapter"><span>001</span><b>EMBODIED AGENT</b></div>
      <motion.div className="hero-type hero-type-left" style={{ x: useTransform(x, value => value * -.65), y: copyY, opacity: copyOpacity }} aria-hidden="true">MY</motion.div>
      <motion.div className="hero-type hero-type-right" style={{ x: useTransform(x, value => value * .65), y: copyY, opacity: copyOpacity }} aria-hidden="true">AI</motion.div>
      <motion.div className="hero-presence-stage" style={{ x, y: useTransform([y, presenceY], ([a, b]) => Number(a) + Number(b)), scale: presenceScale }}>
        <AgentStage />
      </motion.div>
      <div className="grain" aria-hidden="true" />
      <motion.section className="self-copy" style={{ y: copyY, opacity: copyOpacity }}>
        <span>AGENTREACH / PRIVATE PRESENCE</span>
        <h1>Not a profile.<br/><em>A presence.</em></h1>
        <p>Your context stays close. Your agent reaches outward only when you decide.</p>
      </motion.section>
      <IdentityHalo />
      {view === "self" && <button className="mobile-customize" onClick={() => openStudio(true)}>CUSTOMIZE AI FORM</button>}
      <aside className="hero-status-card">
        <header><span>LIVE</span><b>AR</b></header>
        <div><small>ACTIVE SYSTEM</small><strong>HAIPI<br/>LOCAL</strong></div>
        <i />
        <dl><dt>AUTONOMY</dt><dd>L2</dd><dt>BOUNDARY</dt><dd>NORMAL</dd></dl>
      </aside>
      {view === "self" && <AgentPanel />}
      {view === "self" && <AgentComposer />}
      <div className="hero-scroll-label"><span>SCROLL TO ENTER</span><b>↓</b></div>
      <motion.div className="global-scroll-progress" style={{ scaleY: scrollYProgress }} />
    </div>
  </section>;
}
