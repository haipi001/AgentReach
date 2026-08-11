"use client";

import UnicornScene from "unicornstudio-react/next";
import { useReducedMotion } from "motion/react";

const PROJECT_ID = "gzKUereYwNwPVq4UOg1X";

export function UnicornAtmosphere() {
  const reduceMotion = useReducedMotion();

  return <div className="unicorn-atmosphere" aria-hidden="true">
    <UnicornScene
      projectId={PROJECT_ID}
      width="100%"
      height="100%"
      scale={0.65}
      dpi={1}
      fps={reduceMotion ? 15 : 30}
      paused={Boolean(reduceMotion)}
      lazyLoad
      production
      altText="Abstract spatial light field"
      ariaLabel="Decorative spatial light field"
      showPlaceholderOnError={false}
      showPlaceholderWhileLoading={false}
    />
  </div>;
}
