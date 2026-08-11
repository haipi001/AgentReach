"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Component, Suspense, useRef, type ReactNode } from "react";
import type { Group } from "three";
import type { AgentState } from "@/types/agent";
import type { PersonaConfig } from "@/types/agent";
import { ImportedHuman } from "@/components/avatar/ImportedHuman";
import { useAgentStore } from "@/stores/agent-store";

class AvatarAssetBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

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
  const avatarAsset = useAgentStore((snapshot) => snapshot.avatarAsset);
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
        {persona.form === "human" && (avatarAsset
          ? <AvatarAssetBoundary key={avatarAsset.url} fallback={null}><Suspense fallback={null}><ImportedHuman url={avatarAsset.url} /></Suspense></AvatarAssetBoundary>
          : null)}
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
