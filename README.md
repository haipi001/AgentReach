# AgentReach

**Privacy-Preserving Personal Agent Collaboration Infrastructure**

AgentReach enables personal AI agents to discover and collaborate with people without centralizing private intentions, memories, or relationships.

```text
Private Intent × Shared Claims
             ↓
       Local Discovery
             ↓
 Minimum Context Capsule
             ↓
       Mutual Consent
             ↓
 Verified World Change
```

## Golden demo

The demo turns “我要真正开始建设 AgentReach” into two scoped world actions: create `AgentReach/docs/vision.md` through a local GitHub sandbox connector and deliver a collaboration request to Alice Agent Inbox. An independent read-only Verifier checks both effects before the Personal Agent records the experience. The trust-domain server never receives either person's private intent or relationship graph.

## Runnable demo

The repository now includes a deterministic, auditable end-to-end demo. It requires no model API or external service:

- private Intent structuring;
- local candidate discovery with hard filters and evidence-backed scoring;
- minimum Context Capsule with visible removed fields;
- L2 introduction approval and peer consent;
- L3 world-action approval with a visible two-action plan;
- a real repository file and durable mailbox envelope, independently read back as evidence;
- scoped connector grants and persistent idempotency receipts that prevent duplicate world actions;
- verified-only experience memory write-back;
- a live audit Trace and a `DENIED` privacy-attack branch.

Start the API in terminal 1:

```bash
python3 scripts/run_demo.py
```

Start the Spatial UI in terminal 2:

```bash
cd apps/web
pnpm install
pnpm dev
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000).

The product journey is deliberately spatial rather than dashboard-first:

```text
SELF SPACE
  → inspect Identity / Memory / Intent / Skills / Relations / Boundary
  → ask your Personal Agent
  → REACH SPACE
  → choose Alice / Bob / Carol
  → inspect minimum Context Capsule
  → mutual human consent
  → World Action Gate
  → Repository updated + Alice Inbox delivered
  → independent VERIFIED evidence
  → Memory updated
```

The Self Space now includes a local-first Persona Studio. Users can customize the Personal Agent's display name, human face shape, skin, eyes, hair, abstract form, finish, signal color, and aura intensity. A rigged GLB can be loaded from the device for the current session without uploading it. Appearance preferences never alter identity, policy, or permissions. See [the human avatar architecture](docs/human-avatar-architecture.md).

The SELF experience is a presentation layer for protocol state, not the product's proof boundary. Its current interactive portrait and local R3F renderer visualize identity, capability and evidence without changing Identity, Policy, Memory or Action Grants. The authoritative proof remains the deterministic protocol service, durable world effects, independent verification and replayable Trace.

The competition narrative and measurable acceptance criteria are fixed in [the Golden Scenario contract](docs/golden-scenario.md). Visual work is frozen for the preliminary submission except for accessibility, performance or demo-blocking defects.

The GitHub integration is intentionally an honest local sandbox in this zero-dependency gate: its output lives under `data/demo-world/github/agentreach/`. The privacy attack can be run from the Trace panel without derailing the Golden Loop.

For a non-interactive evidence run:

```bash
python3 scripts/demo_cli.py
```

## Repository map

```text
agentteams/       internal manager/worker identities
apps/             future web, API, and worker entrypoints
docs/             product, architecture, security, and demo contracts
fixtures/         synthetic demo data only
mcp_servers/      personal, trust-domain, mailbox, and audit boundaries
personal_agent/   local private plane
protocol/         interoperable JSON Schemas
skills/           reusable skill contracts
trust_domain/     shared plane (never private memory)
```

## Validate

```bash
python3 scripts/validate_day0.py
python3 -m pytest -q
cd apps/web && pnpm lint && pnpm build
pnpm test:e2e
```

The current deterministic baseline covers nine automated service/API tests, including the successful world-action loop, idempotent connector replay, expired-claim exclusion, peer rejection, invalid transitions and an independent privacy-denial branch.

## Safety boundary

Outbound contact, claim publication, commitments, and sensitive disclosure require policy evaluation and the appropriate human approval. External agents can never access `personal-mcp`.

## License

Apache-2.0. Demo identities and relationships are synthetic.
