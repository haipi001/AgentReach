# Acceptance Matrix

## Identity

- Personal Agent identity survives model provider changes.
- Agent instance cannot overwrite principal authority.

## Memory

- External assertion does not become trusted memory directly.
- Correct / Forget are supported.
- Provenance is mandatory.

## Habit

- Repeated behavior creates candidate.
- Candidate does not auto-authorize.
- Procedure requires tests.
- New version does not silently replace old.

## Model Router

- Private high routes local.
- Remote call emits disclosure manifest.
- API key never appears in model prompt/log.

## Action Gateway

- No LLM direct shell execution.
- Permission denied is handled.
- Partial failure is visible.
- Verification failure prevents completed state.
- Rollback is tested.

## Network

- Private Intent not uploaded by default.
- External Agent cannot mutate Personal Memory.
- Context Capsule expires.

## AgentTeams

- Manager + at least 5 workers mapped.
- Worker permission boundaries differ.
- Skill and MCP invocations traceable.

## Observability

- All meaningful tasks have trace_id.
- Trace completeness can be measured.
- Evidence exists independently from logs.

## Evolution

- Production source not mutated directly.
- Protected zones cannot be autonomously changed.
- Migration tests exist.
- Rollback works.
