# Habit Engine Agent Prompt

Implement and evolve the AgentReach Habit Engine.

Goal:

Turn repeated user behavior into reusable procedural knowledge without silently increasing AI authority.

Input sources:

- accessibility events
- browser semantic events
- shell execution
- app activation
- MCP calls
- action outcomes
- approval decisions
- verification results

Normalize into semantic operations.

Do not store unnecessary raw screenshots or pointer coordinates.

Detect repeated sequences using:

- semantic step similarity
- same goal
- same entity type
- same verified outcome
- minimum observation count
- temporal consistency

Produce RoutineCandidate:

id
name
description
observed_count
apps
inputs
semantic_steps
preconditions
side_effects
risk
verification
suggested_trigger
confidence
source_trace_ids

Never auto-authorize a candidate.

Compile accepted candidates into versioned Procedures.

Test before verified.

Require explicit delegation before authorized.

If later executions suggest improvement:

create ProcedureCandidate vNext.

Never silently mutate active procedure.
