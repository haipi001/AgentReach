"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { AgentState } from "@/types/agent";
import type { PersonaConfig } from "@/types/agent";

const stateColors: Record<AgentState, string> = {
  idle: "#171719",
  thinking: "#dfe7d4",
  searching: "#f1ffbc",
  waiting_approval: "#fff4cf",
  connected: "#dcebd5",
};

const accentColors = { lichen: "#e9f5bd", cobalt: "#4f67ba", ember: "#b6533f" };
const finishProps = {
  matte: { roughness: 0.72, metalness: 0.01, clearcoat: 0.03 },
  chrome: { roughness: 0.18, metalness: 0.86, clearcoat: 0.7 },
  porcelain: { roughness: 0.32, metalness: 0.02, clearcoat: 0.9 },
};

export function AgentAvatar({ state, persona }: { state: AgentState; persona: PersonaConfig }) {
  const group = useRef<Group>(null);
  useFrame((clock) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.clock.elapsedTime * 0.32) * 0.12;
    const pulse = state === "thinking" || state === "searching" ? 1 + Math.sin(clock.clock.elapsedTime * 2.4) * 0.025 : 1;
    group.current.scale.setScalar(pulse);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.28}>
      <group ref={group} position={[0, -0.12, 0]} scale={0.5}>
        {persona.form === "human" && <group position={[0, -.08, 0]}>
          <mesh position={[0, 1.39, -.04]} scale={[1.18, 1.28, .88]} castShadow><sphereGeometry args={[.34, 48, 48]} /><meshPhysicalMaterial color="#111113" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[0, 1.42, .24]} scale={[.72, .94, .24]} castShadow><sphereGeometry args={[.27, 48, 48]} /><meshPhysicalMaterial color="#343238" roughness={.84} /></mesh>
          <mesh position={[0, 1.15, 0]} castShadow><cylinderGeometry args={[.12, .14, .22, 24]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[0, .55, 0]} scale={[.9, 1, .58]} castShadow><capsuleGeometry args={[.38, .72, 12, 32]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[-.48, .56, 0]} rotation={[0, 0, -.13]} castShadow><capsuleGeometry args={[.115, .82, 10, 24]} /><meshPhysicalMaterial color="#1c1b1e" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[.48, .56, 0]} rotation={[0, 0, .13]} castShadow><capsuleGeometry args={[.115, .82, 10, 24]} /><meshPhysicalMaterial color="#1c1b1e" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[-.49, -.03, 0]}><sphereGeometry args={[.13, 24, 24]} /><meshPhysicalMaterial color="#343238" roughness={.75} /></mesh>
          <mesh position={[.49, -.03, 0]}><sphereGeometry args={[.13, 24, 24]} /><meshPhysicalMaterial color="#343238" roughness={.75} /></mesh>
          <mesh position={[-.19, -.55, 0]} castShadow><capsuleGeometry args={[.14, .86, 10, 24]} /><meshPhysicalMaterial color="#141416" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[.19, -.55, 0]} castShadow><capsuleGeometry args={[.14, .86, 10, 24]} /><meshPhysicalMaterial color="#141416" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[-.2, -1.12, .08]} scale={[1.25, .55, 1.9]} castShadow><sphereGeometry args={[.15, 24, 24]} /><meshPhysicalMaterial color="#111113" roughness={.68} /></mesh>
          <mesh position={[.2, -1.12, .08]} scale={[1.25, .55, 1.9]} castShadow><sphereGeometry args={[.15, 24, 24]} /><meshPhysicalMaterial color="#111113" roughness={.68} /></mesh>
          <mesh position={[0, .68, .35]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.29, .018, 12, 64]} /><meshStandardMaterial color={accentColors[persona.accent]} emissive={accentColors[persona.accent]} emissiveIntensity={persona.aura * 1.8} /></mesh>
          <mesh position={[0, -1.32, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.62, .018, 10, 72]} /><meshStandardMaterial color={accentColors[persona.accent]} transparent opacity={.52} /></mesh>
          <mesh position={[0, -1.36, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1.28}><torusGeometry args={[.62, .012, 10, 72]} /><meshStandardMaterial color={accentColors[persona.accent]} transparent opacity={.25} /></mesh>
        </group>}
        {persona.form === "monolith" && <>
          <mesh position={[0, 1.28, 0]} castShadow><sphereGeometry args={[0.36, 64, 64]} /><meshPhysicalMaterial color={stateColors[state]} {...finishProps[persona.finish]} /></mesh>
          <mesh position={[0, 0.18, 0]} castShadow><capsuleGeometry args={[0.52, 1.2, 14, 48]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[0, -0.84, 0]} scale={[1.12, 0.54, 0.62]} castShadow><sphereGeometry args={[0.52, 48, 48]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
        </>}
        {persona.form === "orbital" && <>
          <mesh position={[0, .18, 0]} castShadow><sphereGeometry args={[.86, 64, 64]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
          <mesh rotation={[Math.PI / 2.5, 0, .25]}><torusGeometry args={[1.15, .045, 16, 96]} /><meshStandardMaterial color={accentColors[persona.accent]} emissive={accentColors[persona.accent]} emissiveIntensity={persona.aura} /></mesh>
          <mesh position={[0, -1.02, 0]} scale={[1.15, .28, .7]} castShadow><sphereGeometry args={[.58, 48, 48]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
        </>}
        {persona.form === "totem" && <>
          <mesh position={[0, 1.1, 0]} rotation={[0, .2, 0]} castShadow><octahedronGeometry args={[.48, 2]} /><meshPhysicalMaterial color={stateColors[state]} {...finishProps[persona.finish]} /></mesh>
          <mesh position={[0, .05, 0]} castShadow><cylinderGeometry args={[.44, .68, 1.65, 8]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
          <mesh position={[0, -1, 0]} castShadow><cylinderGeometry args={[.9, .62, .3, 48]} /><meshPhysicalMaterial color="#171719" {...finishProps[persona.finish]} /></mesh>
        </>}
        <pointLight color={accentColors[persona.accent]} intensity={persona.aura * 5} distance={4} position={[0, .2, 1.2]} />
      </group>
    </Float>
  );
}
