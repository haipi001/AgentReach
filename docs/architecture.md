# Architecture v0.1

## Core separation

```text
Human
  └─ delegates to Personal Agent Identity
       └─ executes through AgentTeams Runtime
            ├─ Personal Manager
            ├─ Intent Worker
            ├─ Discovery Worker
            ├─ Boundary Worker
            ├─ Collaboration Worker
            └─ Verifier Worker
```

Workers are internal cognitive roles, not externally addressable personal identities. Runtime and model implementations may change without changing the personal-agent identity.

## Data planes

```text
PRIVATE / localhost                 SHARED / trust domain
SQLite                              PostgreSQL
personal memory                     membership
private intent                      presence
directional relationships           audience-scoped claims
delegations and policies            mailbox envelopes
approvals and audit                 introductions/commitments
```

Matching is local-first. The shared plane cannot query the private plane. External agents cannot address personal MCP tools.

## Golden-loop state machine

```text
CREATED → INTENT_PARSED → CANDIDATES_FOUND → CAPSULE_PREPARED
→ WAITING_USER_APPROVAL → INTRO_SENT → WAITING_PEER_APPROVAL
→ INTRO_ACCEPTED → COMMITMENT_PROPOSED → VERIFIED → COMPLETED
```

Terminal/exception states: `DENIED`, `EXPIRED`, `NO_MATCH`, `POLICY_BLOCKED`, `PEER_REJECTED`, and `FAILED`.

## Discovery scoring

Hard filters run before scoring. The deterministic baseline is:

```text
0.35 topic relevance
+ 0.25 relationship relevance
+ 0.15 domain relevance
+ 0.15 claim freshness
+ 0.10 availability
```

An LLM may rerank and explain eligible candidates but cannot invent facts or bypass hard filters.

## Execution invariant

Executor and Verifier are always separate. The Verifier reads immutable evidence and cannot mutate execution results.
