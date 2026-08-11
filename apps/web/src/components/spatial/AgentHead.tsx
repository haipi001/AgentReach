"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { SphereGeometry, type Group, type Mesh } from "three";
import type { PersonaConfig } from "@/types/agent";

const SKIN = { porcelain: "#deddd3", warm: "#aaa99e", umber: "#716f66", deep: "#46463f" } as const;
const ACCENT = { lichen: "#ceff00", cobalt: "#7891ff", ember: "#ff6f4c" } as const;

export function AgentHead({ persona }: { persona: PersonaConfig }) {
  const root = useRef<Group>(null);
  const mask = useRef<Group>(null);
  const upper = useRef<Mesh>(null);
  const lower = useRef<Mesh>(null);
  const signal = ACCENT[persona.accent];
  const headGeometry = useMemo(() => {
    const geometry = new SphereGeometry(1, 160, 120);
    const position = geometry.attributes.position;
    const chinStrength = persona.face.shape === "soft" ? .2 : persona.face.shape === "angular" ? .38 : .3;
    for (let index = 0; index < position.count; index += 1) {
      let px = position.getX(index);
      const py = position.getY(index);
      let pz = position.getZ(index);
      const lower = Math.max(0, (-py - .04) / .96);
      const crown = Math.max(0, (py - .58) / .42);
      const cheek = Math.exp(-Math.pow((py + .08) * 2.7, 2)) * .055;
      const width = 1 + cheek - lower * chinStrength - crown * .1;
      px *= width * (persona.face.shape === "soft" ? 1.035 : persona.face.shape === "angular" ? .97 : 1);
      if (pz > 0) pz *= .91 + Math.max(0, -.25 - py) * .08;
      else pz *= .96;
      position.setXYZ(index, px, py, pz);
    }
    geometry.scale(1.02, 1.34, .94);
    geometry.computeVertexNormals();
    return geometry;
  }, [persona.face.shape]);

  useFrame((state, delta) => {
    if (!root.current || !mask.current) return;
    const tx = state.pointer.x * .34;
    const ty = state.pointer.y * .16;
    root.current.rotation.y += (tx - root.current.rotation.y) * Math.min(1, delta * 5.5);
    root.current.rotation.x += (-ty - root.current.rotation.x) * Math.min(1, delta * 5.5);
    mask.current.rotation.y += (state.pointer.x * .5 - mask.current.rotation.y) * Math.min(1, delta * 7);
    const spread = Math.abs(state.pointer.x) * .34;
    if (upper.current) upper.current.position.x += ((-.18 - state.pointer.x * .22 - spread) - upper.current.position.x) * Math.min(1, delta * 8);
    if (lower.current) lower.current.position.x += ((.16 + state.pointer.x * .3 + spread) - lower.current.position.x) * Math.min(1, delta * 8);
  });

  return <Float speed={.7} rotationIntensity={.025} floatIntensity={.12}>
    <group ref={root} position={[0, -.05, 0]} scale={1.18}>
      <mesh castShadow geometry={headGeometry}>
        <meshPhysicalMaterial color={SKIN[persona.face.skin]} roughness={.24} metalness={.04} clearcoat={.72} clearcoatRoughness={.18} />
      </mesh>
      <mesh position={[-1.02, -.02, -.02]} scale={[.13, .29, .16]}><sphereGeometry args={[1, 48, 32]} /><meshPhysicalMaterial color={SKIN[persona.face.skin]} roughness={.3} /></mesh>
      <mesh position={[1.02, -.02, -.02]} scale={[.13, .29, .16]}><sphereGeometry args={[1, 48, 32]} /><meshPhysicalMaterial color={SKIN[persona.face.skin]} roughness={.3} /></mesh>

      <group ref={mask} position={[0, .02, .02]}>
        <mesh ref={upper} position={[-.18, .25, 0]} scale={[1, .78, 1]} castShadow>
          <cylinderGeometry args={[1.075, 1.095, .23, 160, 2, true]} />
          <meshPhysicalMaterial color="#0a0b0a" metalness={.9} roughness={.06} clearcoat={1} clearcoatRoughness={.04} side={2} />
        </mesh>
        <mesh ref={lower} position={[.16, -.04, .015]} scale={[1, .78, 1]} castShadow>
          <cylinderGeometry args={[1.075, 1.055, .18, 160, 2, true]} />
          <meshPhysicalMaterial color="#171a16" metalness={.78} roughness={.09} clearcoat={1} side={2} />
        </mesh>
        <mesh position={[0, .105, .99]} scale={[1.01, .025, .018]}>
          <boxGeometry args={[2, 1, 1]} /><meshStandardMaterial color={signal} emissive={signal} emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, -.205, .91]} scale={[.72, .012, .012]}>
          <boxGeometry args={[2, 1, 1]} /><meshStandardMaterial color="#f2f2e9" emissive="#f2f2e9" emissiveIntensity={.5} />
        </mesh>
        <mesh position={[-1.55, .34, -.2]} scale={[.7, .035, .035]}><boxGeometry /><meshStandardMaterial color={signal} /></mesh>
        <mesh position={[1.65, -.05, -.18]} scale={[.78, .028, .028]}><boxGeometry /><meshStandardMaterial color="#151715" /></mesh>
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, .08, -.2]} scale={[1.2, 1.05, 1]}>
        <torusGeometry args={[1.15, .012, 12, 160]} /><meshBasicMaterial color="#aeb0a5" transparent opacity={.46} />
      </mesh>
      <pointLight position={[0, .2, 2.2]} intensity={1.6 + persona.aura * 2} color={signal} distance={5} />
    </group>
  </Float>;
}
