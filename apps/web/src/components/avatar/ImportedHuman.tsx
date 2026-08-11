"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Box3, Vector3 } from "three";

export function ImportedHuman({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const transform = useMemo(() => {
    const bounds = new Box3().setFromObject(scene);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const scale = size.y > 0 ? 3.45 / size.y : 1;
    return {
      scale,
      position: [-center.x * scale, -bounds.min.y * scale - 1.58, -center.z * scale] as [number, number, number],
    };
  }, [scene]);

  return <group scale={transform.scale} position={transform.position}><Clone object={scene} castShadow receiveShadow /></group>;
}
