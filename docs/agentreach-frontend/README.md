# AgentReach Frontend Codex Pack

This package is intended to be placed in, or uploaded alongside, the AgentReach frontend repository and used as the primary implementation brief for Codex.

## Priority order

1. `prompts/FRONTEND_MASTER_PROMPT.md` — primary execution prompt.
2. `specs/PRODUCT_UI_SPEC.md` — product behavior and UI logic.
3. `specs/SCREEN_SPECS_20.md` — the 20-screen visual/functional contract.
4. `specs/FRONTEND_ARCHITECTURE.md` — technical architecture.
5. `specs/SELF_EVOLUTION_UI.md` — controlled UI self-evolution.
6. `specs/DESIGN_SYSTEM.md` — visual system.
7. `reference/agentreach_ui_20_screens_reference.png` — visual reference only.

If text in the reference image is unclear, the written specifications are the source of truth.

## Product concept

AgentReach is a Human–AI Agency OS.

The frontend should not feel like a normal SaaS dashboard. It should represent a persistent AI presence that expands from:

Presence Orb
→ Self
→ Local Agency
→ Network Reach
→ Action
→ Evidence
→ Memory

The desktop idle state is a glowing orb. Clicking it unfolds a spatial surface. Heavy work opens a standard workspace.

## How to give this to Codex

Recommended: upload or copy the entire package into the project repo under:

`docs/agentreach-frontend/`

Then tell Codex:

> Read `docs/agentreach-frontend/prompts/FRONTEND_MASTER_PROMPT.md` first. Treat the remaining files in that folder as binding product and engineering requirements. Use the PNG under `reference/` as the visual reference. Implement incrementally, but do not change the architectural principles.

## Target stack

- Tauri 2
- React + TypeScript
- Vite
- React Three Fiber / Three.js / Drei
- Zustand
- XState
- TanStack Query
- Zod / JSON Schema
- Motion
- Vitest
- React Testing Library
- Playwright

## Core rule

The frontend must be schema-driven and evolvable. AI may propose and generate UI changes, but production UI changes must go through versioned preview, tests, approval, release and rollback.
