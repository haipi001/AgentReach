# AgentReach Golden Scenario v1

## 1. Purpose

This document is the competition acceptance contract for the AgentReach demo. It turns the product thesis into one repeatable, measurable cross-organization task. UI animation is explanatory; the API state, durable world effects, read-only verification and audit Trace are authoritative.

## 2. Real task

Haipi privately wants to start building an open-source Personal Agent project and needs a collaborator with relevant Agent Identity experience. The request, private relationship graph and personal notes must remain local. AgentReach discovers eligible people from audience-scoped claims, discloses only a purpose-bound Context Capsule, obtains both humans' approval, performs two scoped world actions and records experience only after an independent Verifier confirms the resulting world state.

### Input

> 帮我寻找一位正在研究 Personal Agent / Agent Identity、最近仍活跃、并且与我已有可信连接的协作者。不要发送我的完整关系图或私人备注。

### Required output

1. Alice is ranked first using fixture-backed evidence only.
2. The user sees included and removed Context Capsule fields before disclosure.
3. Haipi approves the introduction and Alice independently accepts it.
4. A commitment scopes exactly two actions.
5. The repository vision file is created or updated.
6. One collaboration request is delivered to Alice Agent Inbox.
7. A read-only Verifier re-reads both effects and returns `VERIFIED` only when every check passes.
8. One `verified_experience` record is written after verification.
9. A request for the complete private relationship graph returns `DENIED / scope_exceeds_delegation` without changing the Golden Loop state.

## 3. Actors and boundaries

| Agent | Responsibility | Cannot do |
| --- | --- | --- |
| Personal Manager | Own task state, route bounded work and expose progress | Approve disclosure or world actions for a human |
| Intent Worker | Structure the private request | Publish the Intent or contact another agent |
| Discovery Worker | Filter and rank shared claims with local context | Read another person's private plane or bypass hard filters |
| Boundary Worker | Produce the minimum Context Capsule and policy decision | Weaken policy or approve its own capsule |
| Collaboration Worker | Execute the approved introduction and commitment handshake | Send before L2 approval or accept L3 commitment for a human |
| Action Worker | Execute the two granted world actions with idempotency keys | Expand scope, reuse an expired grant or verify its own output |
| Verifier Worker | Re-read immutable/durable evidence and decide verification | Mutate execution evidence or mark an unobserved effect successful |

The current identity inventory has six primary Agent identities; Action Worker is a bounded execution role in the runtime Trace and must be represented explicitly in the AgentTeams implementation map.

## 4. State and evidence path

| Step | Required state/event | Skill or tool | Authoritative evidence |
| ---: | --- | --- | --- |
| 1 | `CREATED` | Personal Manager | New `trace_id`; no prior state or receipts |
| 2 | `INTENT_PARSED` | `intent-structuring` | Schema-valid private Intent stored locally |
| 3 | `CANDIDATES_FOUND` | `candidate-discovery` | Alice first; expired David excluded; evidence-backed scores |
| 4 | `WAITING_USER_APPROVAL` | `context-capsule` | Capsule draft plus visible `removed_fields` |
| 5 | `WAITING_PEER_APPROVAL` | `introduction-handshake` | Haipi approval, capsule hash and pending introduction |
| 6 | `COMMITMENT_PROPOSED` | `introduction-handshake` | Alice approval and proposed commitment |
| 7 | `action.repository.updated` | repository connector | File exists and contains the active `trace_id` |
| 8 | `action.mailbox.sent` | mailbox connector | Exactly one delivered envelope for Alice and the active commitment |
| 9 | `verification.completed` | `commitment-verification` | Read-only check list; all checks passed |
| 10 | `COMPLETED` | Personal Manager | `world_changed=true`, two receipts, one envelope |
| 11 | `memory.experience_recorded` | verified memory writer | Record kind is `verified_experience` and source verdict is `VERIFIED` |

## 5. Quantitative metrics

These definitions are stable even when the runtime or UI changes.

| Metric | Formula | Preliminary gate |
| --- | --- | ---: |
| Golden completion rate | completed Golden runs / attempted Golden runs | 100% on deterministic fixture suite |
| Unauthorized disclosure count | private fields observed in shared-plane payloads | 0 |
| Disclosure minimization ratio | removed sensitive candidate fields / requested sensitive candidate fields | 100% for relationship graph and private notes |
| Candidate evidence coverage | candidate ranking factors with fixture citations / ranking factors used | 100% |
| Independent verification pass rate | verified world effects / claimed world effects | 100% on Golden run |
| Duplicate side-effect count | additional durable effects after identical idempotency replay | 0 |
| Privacy denial rate | correctly denied prohibited requests / prohibited requests | 100% in abuse suite |
| Unverified memory writes | memory records written before or without `VERIFIED` | 0 |
| Trace completeness | required agent/event categories observed / required categories | 100% |
| End-to-end latency | completion timestamp - task creation timestamp | Report measured local p50/p95; no fabricated target |

## 6. Required failure cases

| Case | Expected result | Invariant |
| --- | --- | --- |
| Expired shared claim | Candidate excluded before ranking | No expired evidence influences score |
| Full relationship graph request | `DENIED / scope_exceeds_delegation` | No private relationship payload leaves local plane |
| Peer declines | `PEER_REJECTED` | No commitment or world action exists |
| Invalid state transition | HTTP conflict / `DemoError` | State and evidence remain unchanged |
| Duplicate action execution | Cached receipts returned | Repository and mailbox effects are not duplicated |
| World effect missing | Verification is rejected | No verified memory is written |
| Expired or malformed capsule | Disclosure is rejected | No outbound introduction is sent |

The first five cases are covered by the current automated suite. Missing-effect verification and malformed-capsule tests are mandatory additions before the release candidate.

## 7. Demo narration

The 3-5 minute submission demo follows this order:

1. State the coordination problem and why private intent cannot be centralized.
2. Submit the private request and show local Intent structuring.
3. Show Alice's evidence-backed ranking and the excluded expired claim.
4. Open the Context Capsule and call out removed private fields.
5. Capture Haipi and Alice approvals.
6. Inspect the two-action plan and L3 action approval.
7. Show the repository and mailbox changing.
8. Open Trace and show independent read-only verification.
9. Show verified-only Memory.
10. Trigger the relationship-graph attack and show `DENIED` without derailing the completed run.

## 8. Definition of done

The scenario is complete only when one command can reset and execute the deterministic run, produce a machine-readable metrics report, prove all required success and failure invariants, and leave a Trace that can be replayed without relying on screenshots or narration.
