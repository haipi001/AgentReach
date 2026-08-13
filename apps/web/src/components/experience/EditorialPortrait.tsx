"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { AgentCore } from "@/components/spatial/AgentCore";

type PortraitProps = {
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  scroll: MotionValue<number>;
};

export function EditorialPortrait({ cursorX, cursorY, scroll }: PortraitProps) {
  const baseX = useTransform(cursorX, (value) => value * -.16);
  const baseY = useTransform(cursorY, (value) => value * -.12);
  const ringX = useTransform([cursorX, scroll], ([pointer, progress]) => Number(pointer) * 2.2 + Number(progress) * 120);
  const signalX = useTransform([cursorX, scroll], ([pointer, progress]) => Number(pointer) * -1.7 - Number(progress) * 160);
  const signalRotate = useTransform(cursorY, [-8, 8], [-2.2, 2.2]);

  return <figure className="editorial-photo editorial-core" aria-label="私人智能体 3D 光球核心">
    <motion.div className="editorial-core-object" style={{ x: baseX, y: baseY }}><AgentCore/></motion.div>
    <motion.div className="core-signal-band core-signal-a" aria-hidden="true" style={{ x: ringX, rotate: signalRotate }}/>
    <motion.div className="core-signal-band core-signal-b" aria-hidden="true" style={{ x: signalX }}/>
    <figcaption><b>自我 / 001</b><span>本地核心 · 状态可见</span></figcaption>
  </figure>;
}
