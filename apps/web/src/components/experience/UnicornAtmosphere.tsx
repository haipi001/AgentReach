"use client";

import { useEffect, useId } from "react";
import { useReducedMotion } from "motion/react";

type Scene = { destroy: () => void };
type UnicornRuntime = {
  addScene: (options: Record<string, unknown>) => Promise<Scene>;
};

declare global {
  interface Window { UnicornStudio?: UnicornRuntime }
}

const SDK = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.8/dist/unicornStudio.umd.js";

export function UnicornAtmosphere() {
  const id = `unicorn-${useId().replaceAll(":", "")}`;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    let active = true;
    let scene: Scene | undefined;

    const mount = async () => {
      if (!window.UnicornStudio) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK}"]`);
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Unicorn Studio failed to load")), { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = SDK;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Unicorn Studio failed to load"));
          document.head.appendChild(script);
        });
      }
      if (!active || !window.UnicornStudio) return;
      scene = await window.UnicornStudio.addScene({
        elementId: id,
        projectId: "gzKUereYwNwPVq4UOg1X",
        scale: .45,
        dpi: 1,
        fps: 30,
        lazyLoad: false,
        production: true,
        altText: "Ambient interactive AI field",
        ariaLabel: "Ambient interactive AI field",
        interactivity: { mouse: { disableMobile: true, disabled: false } },
      });
    };

    mount().catch(() => undefined);
    return () => { active = false; scene?.destroy(); };
  }, [id, reduceMotion]);

  return <div id={id} className="unicorn-atmosphere" aria-hidden="true" />;
}
