"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type MouseEvent } from "react";
import { EditorialPortrait } from "./EditorialPortrait";
import { ParameterConstellation } from "./ParameterConstellation";
import { UnicornAtmosphere } from "./UnicornAtmosphere";
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
  const presenceScale = useTransform(scrollYProgress, [0, .62, 1], [1, 1.035, .88]);
  const presenceY = useTransform(scrollYProgress, [0, .62, 1], [0, -10, 88]);
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
      <UnicornAtmosphere />
      <div className="hero-monogram" aria-hidden="true">AR</div>
      <motion.div className="hero-presence-stage" style={{ x, y: useTransform([y, presenceY], ([a, b]) => Number(a) + Number(b)), scale: presenceScale }}>
        <EditorialPortrait cursorX={x} cursorY={y} scroll={scrollYProgress} />
      </motion.div>
      <ParameterConstellation progress={scrollYProgress} />
      <div className="grain" aria-hidden="true" />
      {view === "self" && <button className="mobile-customize" onClick={() => openStudio(true)}>校准智能体核心</button>}
      <aside className="hero-status-card">
        <small>信任状态</small>
        <div className="status-orbit" aria-hidden="true"><i/><i/></div>
        <i />
        <dl><dt>智能体</dt><dd>HAIPI</dd><dt>边界</dt><dd>本地</dd></dl>
      </aside>
      <div className="hero-lock-label"><span>移动指针扰动核心光场</span><b>拖动 / 滚动</b></div>
      <motion.div className="hero-caption" style={{ y: copyY, opacity: copyOpacity }}><span>我的智能体</span><b>私密存在<br/>始于 2026</b></motion.div>
      <div className="hero-scroll-label"><span>向下滚动</span><b>↓</b></div>
      <motion.div className="global-scroll-progress" style={{ scaleY: scrollYProgress }} />
    </div>
  </section>;
}
