"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

type PortraitProps = {
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  scroll: MotionValue<number>;
};

export function EditorialPortrait({ cursorX, cursorY, scroll }: PortraitProps) {
  const baseX = useTransform(cursorX, (value) => value * -.16);
  const baseY = useTransform(cursorY, (value) => value * -.12);
  const upperX = useTransform([cursorX, scroll], ([pointer, progress]) => Number(pointer) * -2.5 - Number(progress) * 190);
  const eyeX = useTransform([cursorX, scroll], ([pointer, progress]) => Number(pointer) * 3.1 + Number(progress) * 260);
  const mouthX = useTransform([cursorX, scroll], ([pointer, progress]) => Number(pointer) * -1.8 - Number(progress) * 330);
  const maskX = useTransform([cursorX, scroll], ([pointer, progress]) => Number(pointer) * 4.1 + Number(progress) * 390);
  const maskRotate = useTransform(cursorY, [-8, 8], [-2.2, 2.2]);

  return <figure className="editorial-photo" aria-label="Faceless virtual personal AI">
    <motion.div className="portrait-image portrait-base" style={{ x: baseX, y: baseY }} />
    <motion.div className="portrait-image portrait-slice slice-upper" aria-hidden="true" style={{ x: upperX }} />
    <motion.div className="portrait-image portrait-slice slice-eye" aria-hidden="true" style={{ x: eyeX }} />
    <motion.div className="portrait-image portrait-slice slice-mouth" aria-hidden="true" style={{ x: mouthX }} />
    <motion.div className="portrait-mask mask-primary" aria-hidden="true" style={{ x: maskX, rotate: maskRotate }} />
    <motion.div className="portrait-mask mask-secondary" aria-hidden="true" style={{ x: upperX }} />
    <motion.div className="portrait-signal signal-a" aria-hidden="true" style={{ x: eyeX }} />
    <motion.div className="portrait-signal signal-b" aria-hidden="true" style={{ x: mouthX }} />
    <figcaption><b>SELF / 001</b><span>FACE PRIVATE · MASK OPTIONAL</span></figcaption>
  </figure>;
}
