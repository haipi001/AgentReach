"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";

export function EditorialPresence() {
  const persona = useAgentStore((state) => state.persona);
  const reduceMotion = useReducedMotion();

  return <motion.figure
    className="editorial-presence"
    initial={reduceMotion ? false : { opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    aria-label={`${persona.name}, personal AI presence`}
  >
    <div className="presence-aura" aria-hidden="true" />
    <Image
      className="presence-base"
      src="/images/agentreach-base-body-v1.png"
      width={943}
      height={1676}
      priority
      sizes="(max-width: 900px) 72vw, 46vw"
      alt="A faceless personal AI base body"
    />
    <Image className="presence-armor" src="/images/agentreach-armor-overlay-v1.png" width={943} height={1676} priority sizes="(max-width: 900px) 72vw, 46vw" alt="" aria-hidden="true" />
    <span className="presence-layer-label layer-base">BASE / SELF</span><span className="presence-layer-label layer-mask">MASK / IDENTITY</span><span className="presence-layer-label layer-armor">ARMOR / CAPABILITY</span>
    <figcaption><span>EMBODIED SELF</span><b>{persona.name} / LOCAL PRESENCE</b></figcaption>
  </motion.figure>;
}
