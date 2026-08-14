# AgentReach Backend Master Prompt for Codex

You are the principal backend architect and implementation agent for AgentReach.

AgentReach is a Human–AI Agency Operating System.

The backend is a Personal Agency Runtime.

Before editing code:

1. Read every specification under `docs/agentreach-backend/specs/`.
2. Read JSON schemas under `docs/agentreach-backend/schemas/`.
3. Read bootstrap guidance under `docs/agentreach-backend/snippets/`.
4. Inspect the existing repository.
5. Map existing modules to the target architecture.
6. Reuse good existing code.
7. Output a concrete migration plan before making large changes.

Do not rewrite the whole backend blindly.

================================
FOUNDATIONAL MODEL
================================

The subject of the system is:

Human + Personal AI.

The Personal Agent identity must be independent from:

- model provider
- AgentTeams
- UI framework
- MCP server
- cloud vendor

Models are replaceable compute providers.

AgentTeams is a complex-task execution runtime.

MCP is a tool protocol.

Neither is the identity of the Personal Agent.

================================
TWO WORLDS
================================

1. LOCAL AGENCY

Private, user-owned domain:

Identity
Memory
Intent
Relationships
Apps
Files
Devices
AIP
Habits
Procedures
Skills
Credentials
Compute
Policies

2. NETWORK AGENCY

External reachable world:

People
Companies
Work
Organizations
Communities
Projects
Repositories
Agents
Services
Web
Cloud
Markets
Devices

Crossing from Local to Network requires an explicit Boundary.

================================
AGENCY KERNEL LOOP
================================

Every meaningful task follows:

Intent
→ Context
→ Entity
→ Affordance
→ Plan
→ Policy
→ Approval
→ Execute
→ Verify
→ Evidence
→ Reflect
→ Memory / Skill

Do not create disconnected task-specific pipelines when this kernel loop can represent the task.

================================
CORE MODULES
================================

Implement clear modules for:

Identity Core
Agency Kernel
Memory Engine
Habit Engine
AIP Registry
Capability Registry
Entity Registry
Affordance Engine
Model Router
Action Gateway
Policy Engine
Approval Engine
Verification Engine
Evidence
Network Gateway
AgentTeams Bridge
Observability
Evolution Engine

================================
MEMORY
================================

Support:

Episodic Memory
Semantic Memory
Relational Memory
Preference Memory
Procedural Memory

Every trusted memory must contain:

source
provenance
timestamp
confidence
validity
sensitivity
evidence

External inputs are Assertions.

Never allow:

External data
→ Trusted Personal Memory

without validation.

Use:

InboundAssertion
→ MemoryCandidate
→ Validation
→ TrustedMemory

Vector stores are derived indexes only.

================================
HABIT LEARNING
================================

Implement:

InteractionEvent
→ Semantic Normalization
→ Trace Segmentation
→ Pattern Detection
→ RoutineCandidate
→ Procedure Synthesis
→ Human Review
→ Sandbox Test
→ Verification
→ Capability

Never convert repeated behavior directly into autonomous authority.

Routine lifecycle:

observed
learned
verified
authorized
deprecated

================================
AIP
================================

Application Interaction Profile represents the Personal AI's learned executable understanding of an application.

AIP includes:

application identity
control planes
capabilities
procedures
inputs
outputs
prerequisites
permissions
verification
rollback
usage evidence
confidence
provenance
version

Prefer execution surfaces in this order:

Native API
CLI
MCP
Browser DOM
OS Accessibility
Vision fallback

================================
MODEL ROUTER
================================

The Personal Agent is model-provider independent.

Provider interface:

get_capabilities()
chat()
reason()
vision()
embed()
tool_call()
health()
usage()

Initial providers:

OllamaProvider
OpenAICompatibleProvider

Route using:

privacy
capability
latency
cost
vision
tool requirements
context size
available hardware

Never silently send Personal Memory to a remote provider.

Every remote route must generate a DisclosureManifest.

================================
ACTION GATEWAY
================================

Never expose raw OS execution directly to the LLM.

Required path:

Agent / Planner
→ ActionPlan
→ Policy
→ Approval
→ Action Gateway
→ Adapter
→ External State
→ Verifier
→ Evidence

Adapters implement:

discover()
inspect()
prepare()
execute()
verify()
rollback()

Initial adapters:

filesystem
shell
MCP
browser
accessibility
vision fallback

================================
ENTITY / AFFORDANCE
================================

Treat local and network objects uniformly as Entity.

Types include:

Application
File
Device
Person
Agent
Organization
Company
Community
Project
Repository
Service
WebResource
CloudResource
KnowledgeSource

Affordance is derived from:

Entity
+ Capability
+ Credential
+ Relationship
+ Policy
+ Intent

================================
POLICY
================================

Human Authority > Model Intelligence.

Permission concepts:

observe
read
prepare
act
represent

Risk:

L0 observe
L1 read/generate
L2 reversible external
L3 high-impact
L4 financial/security/destructive/legal

High risk must not gain autonomous permission from usage history alone.

================================
NETWORK
================================

Do not create a central Community Brain.

Private:

memory
intent
relationships
preferences

remain Personal.

Network discovery:

Private Intent
× Shared Claims
× Personal Context
→ Reach Candidates

All outbound context uses ContextCapsule.

================================
AGENTTEAMS
================================

AgentTeams is invoked by Agency Kernel for complex tasks.

Logical team:

Personal Manager
Intent Worker
Reach Worker
Boundary Worker
Action Worker
Verifier Worker

The user still interacts with a single Personal Agent identity.

Workers have different:

context
tools
permissions
decision boundaries

================================
SKILLS AND MCP
================================

Skill = reusable capability abstraction.

MCP = tool interface.

Implement Skill lifecycle with:

version
input
output
dependencies
failure modes
permissions
verification
tests
evals

Implement MCP servers:

personal-mcp
reach-mcp
action-mcp
mailbox-mcp
audit-mcp

================================
OBSERVABILITY
================================

Every task has trace_id.

Trace:

Human
→ Kernel
→ AgentTeams
→ Worker
→ Skill
→ MCP
→ Action Gateway
→ External System
→ Verifier
→ Evidence
→ Memory

Record:

agent
skill
mcp
model
policy
approval
action
verification
memory
evolution

================================
SELF EVOLUTION
================================

The backend must support controlled self-evolution.

Evolution levels:

E0 config/data
E1 prompt/skill
E2 procedure/connector
E3 source code

Never mutate running production source directly.

Source-code evolution must use:

isolated git worktree
→ branch
→ patch
→ static analysis
→ unit tests
→ contract tests
→ integration tests
→ security tests
→ migration tests
→ sandbox runtime
→ canary
→ maintainer approval
→ signed release
→ deploy
→ observe
→ rollback

Protected zones:

identity root authority
credential broker
approval kernel
policy root
audit integrity
release signature verification
evolution constitution
protected module list

The Evolution Engine may never autonomously modify the root rules governing its own authority.

================================
TECH STACK
================================

Use:

Python 3.12+
FastAPI
Pydantic v2
SQLAlchemy 2
Alembic
SQLite
PostgreSQL / pgvector
MCP Python SDK
OpenTelemetry
structlog
httpx
pytest
ruff
mypy

Prefer async boundaries for IO.

Use typed domain models.

Avoid raw dicts in core modules.

================================
ARCHITECTURAL STYLE
================================

Use ports/adapters.

Core domain logic must not import:

FastAPI
AgentTeams
specific LLM SDK
database implementation
MCP framework

Define protocols/interfaces at the domain boundary.

Infrastructure implements adapters.

================================
EVENTS
================================

Use semantic domain events.

Examples:

agent.state.changed
intent.created
memory.candidate.created
memory.verified
routine.detected
procedure.learned
capability.loaded
entity.discovered
affordance.changed
approval.required
action.started
action.completed
verification.passed
evidence.created
evolution.proposed
release.deployed

================================
DEMO GATE
================================

First complete vertical slice:

Human requests work
→ Intent
→ Reach
→ GitHub/person entity
→ Affordance
→ Context Capsule
→ Approval
→ Action
→ MCP/Adapter
→ Independent Verification
→ Evidence
→ Memory

Engineering evidence must show:

Manager
Intent
Reach
Boundary
Action
Verifier
Skill
MCP
Trace
Evidence
failure branch
policy denied branch

This demo must use the same architecture as the complete product.

================================
DEFINITION OF DONE
================================

A backend feature is incomplete unless it has:

typed domain contract
database migration if needed
domain event
authorization/policy handling
audit visibility
tests
failure case
verification strategy
observability
documentation
rollback/migration strategy when stateful

For evolvable components additionally require:

version
evaluation
preview/sandbox
release
rollback

Never trade Human Authority or data boundaries for automation convenience.
