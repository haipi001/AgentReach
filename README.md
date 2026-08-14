# AgentReach

**A personal AI should extend a human's agency—not absorb it.**

AgentReach is a local-first infrastructure for personal AI agents. It explores a simple but consequential idea:

> AI can understand us, remember with us, and act with us—without becoming the owner of our identity, relationships, intentions, or decisions.

Most AI products begin with a model and ask how much of a person can be uploaded around it. AgentReach begins from the opposite direction: the human already has a life, an identity, private memory, relationships, boundaries, and responsibility. AI enters that world as a capability owned by the person.

## The relationship we are building

AgentReach does not treat AI as a disposable chatbot, a digital employee controlled by a platform, or an autonomous substitute for human judgment. It treats a Personal Agent as a long-lived extension of human agency.

That relationship rests on five principles:

1. **The human is the principal.** The agent serves a person; it does not become the person or silently redefine their goals.
2. **Private context stays privately owned.** Intentions, memories, relationship graphs, and personal policies remain in the person's local trust boundary by default.
3. **Understanding is not authority.** An agent may infer, recommend, prepare, and coordinate, but sensitive disclosure and consequential action still require explicit authority.
4. **Action must leave evidence.** A tool response is not proof that the world changed. Execution and verification are separate responsibilities.
5. **Memory must be earned.** Only verified outcomes should become durable experience. Confidence, appearance, and persuasive language must never overwrite truth.

This produces a different model of human–AI interaction:

```text
Human identity and intent
          ↓ delegates bounded authority
     Personal Agent
          ↓ coordinates capabilities
   Skills and specialized agents
          ↓ act through scoped grants
        The world
          ↓ returns independent evidence
   Verified human experience
```

The agent becomes more useful over time, while the person remains legible as the source of purpose, permission, and responsibility.

## Why AgentReach exists

Today, discovering collaborators or coordinating work often requires a central platform to collect everyone's goals, histories, and social graphs. Agent systems add another problem: they frequently collapse reasoning, permission, execution, and verification into one opaque step.

AgentReach separates these concerns:

```text
Private Intent × Audience-scoped Claims
                 ↓
          Local Discovery
                 ↓
       Minimum Context Capsule
                 ↓
          Mutual Consent
                 ↓
       Scoped World Actions
                 ↓
    Independent Verification
                 ↓
       Verified-only Memory
```

A person can ask their agent to find help, coordinate with another independently owned agent, reveal only the minimum necessary context, obtain consent from both sides, perform explicitly granted actions, and verify the resulting world state before learning from it.

## What is implemented

The repository contains a deterministic, auditable end-to-end implementation that requires no model API or external account:

- local identity and owner-isolated Personal Agent state;
- private intent structuring and evidence-backed candidate discovery;
- minimum-disclosure Context Capsules with visible removed fields;
- sender approval, peer consent, and strong approval for world actions;
- durable worker queues, action outboxes, retries, and idempotency receipts;
- repository and agent-mailbox connectors with scoped grants;
- read-only verification separated from execution;
- verified-only long-term memory;
- replayable Trace, operational metrics, and explicit denial paths;
- schema-driven protected UI surfaces that fail closed.

The included identities, relationships, claims, and world data are synthetic.

## Run locally

Start the protocol service:

```bash
python3 scripts/run_demo.py
```

Start the web experience in another terminal:

```bash
cd apps/web
pnpm install
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

For a non-interactive evidence run:

```bash
python3 scripts/demo_cli.py
```

## Architecture

```text
personal_agent/   private identity, intent, memory, policy, relationships
agentteams/       manager and specialized worker identities
skills/           reusable, versioned capability contracts
protocol/         interoperable JSON Schemas
mcp_servers/      connector and trust-boundary contracts
trust_domain/     audience-scoped shared claims; never private memory
apps/api/         authoritative protocol and durable runtime
apps/web/         spatial, schema-driven human interface
packages/         domain, event, policy, registry, and UI runtime kernels
tests/            authority, privacy, lifecycle, and failure invariants
```

The interface is a projection of protocol state, not the source of truth. Identity, policy, grants, receipts, evidence, and verified memory remain authoritative beneath the presentation layer.

See [architecture](docs/architecture.md), [product specification](docs/product-spec.md), and [security model](docs/security.md).

## Validate

```bash
python3 scripts/validate_day0.py
python3 -m pytest -q
pnpm test:kernel
cd apps/web && pnpm lint && pnpm build
```

## Boundaries

- External agents cannot access another person's private plane.
- Outbound disclosure, commitments, and consequential actions require policy evaluation and appropriate human approval.
- Grants are scoped by actor, action, resource, purpose, and lifetime.
- Executors cannot certify their own success.
- Unverified results cannot enter durable experience memory.
- Appearance and interface customization never modify identity, policy, or authority.

## Open direction

AgentReach is not an attempt to build one universal AI that owns every context. It is an attempt to make independently owned agents capable of trustworthy cooperation.

The long-term direction is an open protocol and runtime in which people can carry their agent, memory, policies, and capabilities across tools and communities—forming relationships between agents without surrendering the human beings behind them to a central graph.

## License

Apache-2.0.
