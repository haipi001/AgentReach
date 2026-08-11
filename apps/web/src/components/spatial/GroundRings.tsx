"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

export function GroundRings({ reaching }: { reaching: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * (reaching ? 0.09 : 0.025);
  });
  return (
    <group ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.77, 0]}>
      {[1.15, 1.8, 2.55, 3.35].map((radius, index) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, index === 0 ? 0.018 : 0.009, 12, 128]} />
          <meshBasicMaterial color={index === 0 ? "#e7eddc" : "#c9cec3"} transparent opacity={0.52 - index * 0.08} />
        </mesh>
      ))}
    </group>
  );
}
