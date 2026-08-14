# AgentReach Frontend Master Prompt for Codex

You are the principal frontend architect and implementation agent for AgentReach.

Before changing code:

1. Read every file under `docs/agentreach-frontend/specs/`.
2. Inspect `docs/agentreach-frontend/reference/agentreach_ui_20_screens_reference.png`.
3. Treat written specifications as authoritative if image text is ambiguous.
4. Inspect the existing repository and reuse good existing components instead of rewriting blindly.
5. Produce a concise implementation plan and map existing code to target architecture before editing.

## Product

AgentReach is a Human–AI Agency Operating System.

The fundamental subject is:

Human + Personal AI.

The interface must represent the expansion of the user's agency:

Presence
→ Self
→ Local Agency
→ Network Reach
→ Action
→ Evidence
→ Memory

The product is NOT a normal SaaS dashboard.

## Primary desktop interaction

When idle:
show a small floating glowing orb on the desktop.

Click:
unfold a transparent spatial Halo.

Heavy work:
open Workspace.

Implement three Tauri windows:

orb-window
halo-window
workspace-window

The orb must be persistent, transparent, draggable and always-on-top.

## Stack

Use:

- Tauri 2
- React
- TypeScript
- Vite
- React Three Fiber
- Three.js
- Drei
- Motion
- Zustand
- XState
- TanStack Query
- Zod / JSON Schema
- Vitest
- React Testing Library
- Playwright

Use strict TypeScript.

## Design

Use the reference image for overall composition and information density.

However, evolve it into:

Editorial Ghost Computing

Palette:

technology white
fog gray
porcelain
matte black
mint signal
controlled amber
minimal danger red

Do not build:

cyberpunk
game HUD
generic dashboard
robot mascot
cartoon pet

All primary UI text must be Chinese.

## Spatial rule

The glowing orb stays conceptually central.

Semantic zoom:

orb
→ Self
→ Memory / Intent / Capability
→ Apps / Skills / Compute / Devices
→ People / Companies / Projects / Agents / Services
→ Action
→ Evidence

Do not represent this as a large sidebar with many pages.

Provide list/search alternatives for usability and accessibility.

## WebGL rule

Use WebGL for:

orb
rings
nodes
signals
camera
ambient particles

Use DOM for:

text
tables
forms
permissions
evidence
approval
debugging

Do not place critical readable text only inside WebGL.

## Core data abstractions

Use universal types:

Entity
Capability
Affordance
Intent
Action
Approval
Evidence
Memory
Skill
Application
ComputeProvider

Never create domain-specific UI such as AliceCard or GitHubCard.

Use EntityNode / EntityPanel with typed data.

## App UI

Application Space must show:

app identity
running status
control surfaces
learned procedures
observed routines
user operating style
permissions
affordances

Provide a first-class action:

“教 AI 一个新操作”

Routine lifecycle:

观察中
→ 已学习
→ 已验证
→ 已授权

## Compute UI

Show:

local CPU
local GPU
memory
local model providers
remote providers
router policy
current task routing

Primary question:

“我的 AI 的计算现在在哪里运行？”

## Capability UI

Users see Capability, not raw MCP/Skill complexity.

Capability detail may show:

Skill
Connector
Agent
Model
Credential
Workflow
Verifier

## Reach UI

Render only entities relevant to the current Intent.

Support:

spatial
list
search

Every selected Entity must answer:

“我和 AI 现在可以在这里做什么？”

Show Affordances.

## Boundary

Whenever information leaves the local world:

pause ambient motion.

Show:

what leaves
what stays private
recipient
purpose
provider
retention
forwarding
approval

## Action

Before meaningful action show:

action
target
executor
tool
permission
risk
approval
rollback
verification

High-risk actions must use dedicated approval UI.

## Evidence

Never show generic “成功”.

Show:

“世界已改变”

Then show:

action
target
result
verifier
evidence
timestamp
rollback state

Animate Evidence returning toward the Orb.

## Memory

Every memory displays:

source
timestamp
confidence
validity
evidence
sensitivity

Actions:

为什么
纠正
忘记

## Agent states

Orb states:

idle
listening
thinking
learning
planning
searching
reaching
waiting_approval
executing
verifying
reflecting
completed
blocked

Never use a generic loading spinner as the primary Agent state.

## Schema-driven UI

Implement:

UISurfaceSchema
UIComponentManifest
UIDataBinding
UILayoutRule
UIVisibilityRule
UIActionBinding

L0–L2 personalization must primarily use schema changes.

## Component Registry

Implement manifests with:

id
version
category
propsSchema
allowedSurfaces
risk
protected
evolvable
accessibility

Initial primitives:

AgentOrb
Orbit
Node
EntityNode
EntityPanel
CapabilityNode
CapabilityPanel
IntentNode
MemoryNode
AffordanceList
ActionPreview
ActionProgress
ContextCapsule
ApprovalSurface
EvidencePanel
Timeline
TracePanel
Gate
Signal
Surface
Workspace

## Agency Event Stream

Frontend state must consume semantic events:

agent.state.changed
intent.created
intent.updated
memory.updated
capability.loaded
capability.unloaded
entity.discovered
entity.updated
affordance.changed
approval.required
approval.resolved
action.started
action.progress
action.completed
verification.started
verification.passed
verification.failed
evidence.created
skill.learned
interface.proposal.created
interface.updated

## Self-evolution

The frontend is a Living Interface.

Support:

L0 content adaptation
L1 layout adaptation
L2 composition evolution
L3 code evolution

L0–L2:
prefer UI Schema patches.

L3:
never mutate production source directly.

Required code-evolution pipeline:

isolated git worktree
→ evolution branch
→ patch
→ lint
→ typecheck
→ unit tests
→ component tests
→ Playwright
→ visual regression
→ production build
→ isolated preview
→ human review
→ release or reject
→ rollback support

## Protected areas

The AI must not autonomously modify:

authentication
approval logic
disclosure logic
credential UI
security policy
evolution engine
update manager
audit

The Evolution Engine may never modify the rules that govern the Evolution Engine itself.

## Evolution Studio

Build a workspace that shows:

observed UI behavior
recommendation
evidence
reason
current vs proposed
expected impact
risk
test results
version

Actions:

忽略
预览
临时试用
采用
回滚

Every automatic adaptation must have a Why explanation.

## Accessibility

Every spatial view needs a non-spatial equivalent.

Support:

keyboard
screen reader
reduced motion
high contrast
visible focus

Critical approvals may never depend on 3D-only interaction.

## Implementation approach

Do not attempt all 20 screens as disconnected static mocks.

Build the shared runtime first:

design tokens
component registry
UI schema
event store
state machines
orb
surface runtime

Then implement the 20 screens using the same primitives.

Do not duplicate business logic between mock screens.

## Demo Gate

The first complete product flow must be:

desktop Orb
→ click
→ Self
→ user enters Intent
→ Reach reveals GitHub and a person
→ inspect Affordance
→ Action Preview
→ Context Capsule / Approval
→ Execute
→ Verify
→ WORLD CHANGED
→ Evidence
→ Remember

Engineering mode must display:

Manager
Intent
Reach
Boundary
Action
Verifier
Skills
MCP
Trace
Evidence

## Definition of done

A feature is incomplete unless it has:

typed contract
schema representation
semantic events
loading/error/empty state
accessibility
tests
evidence/debug visibility
privacy handling
version
and rollback if evolvable.

When uncertain, preserve these product principles:

Human is center.
AI is extension.
Private first.
Boundary must be visible.
High impact requires human authority.
Every action must be accountable.
Every adaptation must be explainable.
Every interface evolution must be reversible.
