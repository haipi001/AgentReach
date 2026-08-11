"use client";

import type { PersonaConfig } from "@/types/agent";

const skinColors = { porcelain: "#d8b9a8", warm: "#b98267", umber: "#81533f", deep: "#4d3028" };
const eyeColors = { charcoal: "#252327", hazel: "#69513a", moss: "#485441" };
const hairColors = { ink: "#161519", brown: "#392b27", silver: "#8f9095" };
const accentColors = { lichen: "#e9f5bd", cobalt: "#4f67ba", ember: "#b6533f" };
const faceScale = { soft: [1.04, .96, .92], oval: [.92, 1.08, .9], angular: [.96, 1.02, .84] } as const;

export function RealisticHuman({ persona }: { persona: PersonaConfig }) {
  const skin = skinColors[persona.face.skin];
  const hair = hairColors[persona.face.hairColor];
  const eyes = eyeColors[persona.face.eyes];
  const accent = accentColors[persona.accent];
  const shape = faceScale[persona.face.shape];

  return <group position={[0, -.06, 0]}>
    {persona.face.hairStyle === "hood" && <mesh position={[0, 1.39, -.035]} scale={[1.2, 1.28, .92]} castShadow><sphereGeometry args={[.34, 48, 48]} /><meshPhysicalMaterial color={hair} roughness={.83} /></mesh>}
    {persona.face.hairStyle === "bob" && <><mesh position={[0, 1.43, -.02]} scale={[1.14, 1.15, .92]} castShadow><sphereGeometry args={[.31, 48, 48]} /><meshPhysicalMaterial color={hair} roughness={.8} /></mesh><mesh position={[-.25, 1.24, .01]} scale={[.38, 1.25, .55]}><sphereGeometry args={[.25, 32, 32]} /><meshStandardMaterial color={hair} roughness={.82} /></mesh><mesh position={[.25, 1.24, .01]} scale={[.38, 1.25, .55]}><sphereGeometry args={[.25, 32, 32]} /><meshStandardMaterial color={hair} roughness={.82} /></mesh></>}
    {persona.face.hairStyle === "short" && <mesh position={[0, 1.56, -.015]} scale={[1.05, .48, .92]} castShadow><sphereGeometry args={[.3, 40, 40]} /><meshPhysicalMaterial color={hair} roughness={.78} /></mesh>}

    <mesh position={[0, 1.42, .185]} scale={shape} castShadow><sphereGeometry args={[.265, 56, 56]} /><meshPhysicalMaterial color={skin} roughness={.68} clearcoat={.06} /></mesh>
    <mesh position={[-.082, 1.455, .418]} scale={[1.25, .62, .4]}><sphereGeometry args={[.038, 24, 24]} /><meshStandardMaterial color="#ded8d0" roughness={.5} /></mesh>
    <mesh position={[.082, 1.455, .418]} scale={[1.25, .62, .4]}><sphereGeometry args={[.038, 24, 24]} /><meshStandardMaterial color="#ded8d0" roughness={.5} /></mesh>
    <mesh position={[-.082, 1.455, .446]}><sphereGeometry args={[.017, 20, 20]} /><meshStandardMaterial color={eyes} roughness={.34} /></mesh>
    <mesh position={[.082, 1.455, .446]}><sphereGeometry args={[.017, 20, 20]} /><meshStandardMaterial color={eyes} roughness={.34} /></mesh>
    <mesh position={[0, 1.39, .448]} rotation={[Math.PI / 2, 0, 0]} scale={[.55, 1, .72]}><coneGeometry args={[.035, .09, 20]} /><meshStandardMaterial color={skin} roughness={.7} /></mesh>
    <mesh position={[0, 1.32, .433]}><boxGeometry args={[.095, .012, .012]} /><meshStandardMaterial color="#704a45" roughness={.72} /></mesh>

    <mesh position={[0, 1.13, .03]} castShadow><cylinderGeometry args={[.105, .13, .22, 24]} /><meshPhysicalMaterial color={skin} roughness={.72} /></mesh>
    <mesh position={[0, .58, 0]} scale={[.96, 1, .6]} castShadow><capsuleGeometry args={[.34, .68, 14, 36]} /><meshPhysicalMaterial color="#1a191c" roughness={.76} clearcoat={.03} /></mesh>
    <mesh position={[0, .14, 0]} scale={[1.02, .58, .62]} castShadow><sphereGeometry args={[.36, 36, 36]} /><meshPhysicalMaterial color="#18171a" roughness={.78} /></mesh>

    <group position={[-.39, .76, 0]} rotation={[0, 0, -.1]}><mesh position={[0, -.24, 0]} castShadow><capsuleGeometry args={[.1, .4, 10, 24]} /><meshPhysicalMaterial color="#1b1a1d" roughness={.78} /></mesh><mesh position={[.01, -.66, .015]} castShadow><capsuleGeometry args={[.085, .33, 10, 24]} /><meshPhysicalMaterial color="#1a191c" roughness={.78} /></mesh><mesh position={[.02, -.92, .02]}><sphereGeometry args={[.11, 24, 24]} /><meshPhysicalMaterial color={skin} roughness={.72} /></mesh></group>
    <group position={[.39, .76, 0]} rotation={[0, 0, .1]}><mesh position={[0, -.24, 0]} castShadow><capsuleGeometry args={[.1, .4, 10, 24]} /><meshPhysicalMaterial color="#1b1a1d" roughness={.78} /></mesh><mesh position={[-.01, -.66, .015]} castShadow><capsuleGeometry args={[.085, .33, 10, 24]} /><meshPhysicalMaterial color="#1a191c" roughness={.78} /></mesh><mesh position={[-.02, -.92, .02]}><sphereGeometry args={[.11, 24, 24]} /><meshPhysicalMaterial color={skin} roughness={.72} /></mesh></group>

    <group position={[-.17, -.18, 0]}><mesh position={[0, -.32, 0]} castShadow><capsuleGeometry args={[.115, .44, 10, 24]} /><meshPhysicalMaterial color="#151417" roughness={.8} /></mesh><mesh position={[0, -.78, .01]} castShadow><capsuleGeometry args={[.095, .36, 10, 24]} /><meshPhysicalMaterial color="#131215" roughness={.8} /></mesh><mesh position={[0, -1.06, .085]} scale={[1.25, .52, 1.8]} castShadow><sphereGeometry args={[.13, 24, 24]} /><meshPhysicalMaterial color="#111013" roughness={.72} /></mesh></group>
    <group position={[.17, -.18, 0]}><mesh position={[0, -.32, 0]} castShadow><capsuleGeometry args={[.115, .44, 10, 24]} /><meshPhysicalMaterial color="#151417" roughness={.8} /></mesh><mesh position={[0, -.78, .01]} castShadow><capsuleGeometry args={[.095, .36, 10, 24]} /><meshPhysicalMaterial color="#131215" roughness={.8} /></mesh><mesh position={[0, -1.06, .085]} scale={[1.25, .52, 1.8]} castShadow><sphereGeometry args={[.13, 24, 24]} /><meshPhysicalMaterial color="#111013" roughness={.72} /></mesh></group>

    <mesh position={[0, .64, .37]}><boxGeometry args={[.52, .025, .025]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={persona.aura * 1.8} /></mesh>
    <mesh position={[0, -1.38, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.61, .018, 10, 72]} /><meshStandardMaterial color={accent} transparent opacity={.52} /></mesh>
    <mesh position={[0, -1.42, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1.28}><torusGeometry args={[.61, .012, 10, 72]} /><meshStandardMaterial color={accent} transparent opacity={.25} /></mesh>
  </group>;
}
