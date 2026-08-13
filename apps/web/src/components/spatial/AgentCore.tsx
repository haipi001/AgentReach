"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";

type Scene = { destroy: () => void };
type UnicornRuntime = { addScene: (options: Record<string, unknown>) => Promise<Scene> };

declare global {
  interface Window { UnicornStudio?: UnicornRuntime }
}

const SDK = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.8/dist/unicornStudio.umd.js";
const PROJECT_ID = "jeRudEcskzwdXZt7Hbgr";

export function AgentCore() {
  const id = `agent-core-${useId().replaceAll(":", "")}`;
  const reduceMotion = useReducedMotion();
  const persona = useAgentStore((state) => state.persona);
  const [ready, setReady] = useState(false);
  const hue = { lichen: "0deg", cobalt: "54deg", ember: "-72deg" }[persona.accent];
  const style = { "--core-aura": persona.aura, "--core-hue": hue } as CSSProperties;

  useEffect(() => {
    if (reduceMotion) return;
    let active = true;
    let scene: Scene | undefined;

    async function mount() {
      if (!window.UnicornStudio?.addScene) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK}"]`);
          if (existing) {
            if (window.UnicornStudio?.addScene) resolve();
            else {
              existing.addEventListener("load", () => resolve(), { once: true });
              existing.addEventListener("error", () => reject(new Error("3D 核心加载失败")), { once: true });
            }
            return;
          }
          const script = document.createElement("script");
          script.src = SDK;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("3D 核心加载失败"));
          document.head.appendChild(script);
        });
      }
      if (!active || !window.UnicornStudio?.addScene) return;
      scene = await window.UnicornStudio.addScene({
        elementId: id,
        projectId: PROJECT_ID,
        scale: .72,
        dpi: 1.25,
        fps: 60,
        lazyLoad: false,
        production: true,
        altText: "AgentReach 私人智能体 3D 光球核心",
        ariaLabel: "AgentReach 私人智能体 3D 光球核心",
        interactivity: { mouse: { disabled: false, disableMobile: false } },
      });
      if (active) setReady(true);
    }

    mount().catch(() => setReady(false));
    return () => { active = false; scene?.destroy(); };
  }, [id, reduceMotion]);

  return <div style={style} className={`agent-core finish-${persona.finish} accent-${persona.accent} ${ready ? "is-ready" : "is-fallback"}`} role="img" aria-label={`私人智能体光球核心，场强 ${Math.round(persona.aura * 100)}%`}>
    <div className="agent-core-fallback" aria-hidden="true"><i/><i/><i/></div>
    <div id={id} className="agent-core-webgl" aria-hidden="true" />
    <div className="agent-core-rings" aria-hidden="true"><i/><i/></div>
  </div>;
}
