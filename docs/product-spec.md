# AgentReach Product Specification v0.1

## 1. What AgentReach is

AgentReach is privacy-preserving collaboration infrastructure for independently owned personal agents. It separates private intent from shared claims and enables a personal agent to discover a relevant person, disclose only purpose-bound context, obtain mutual consent, record a commitment, and independently verify the result.

The current product slice is not a social feed, project-management suite, DAO, identity wallet, or global agent network.

## 2. Golden demo

1. Haipi privately asks their agent to find a collaborator working on personal-agent identity inside the `706` trust domain.
2. The Intent Worker structures the request without publishing it.
3. The Discovery Worker filters shared claims and locally ranks Alice, Bob, and Carol using topic relevance, relationship context, domain relevance, freshness, and availability.
4. Haipi chooses Alice.
5. The Boundary Worker produces a minimum-sufficient Context Capsule and lists excluded private fields.
6. Haipi explicitly approves the outbound introduction.
7. Alice's agent receives it and Alice accepts.
8. The parties approve a commitment to hold a discussion.
9. The Verifier independently checks both approvals, capsule validity and expiry, commitment consistency, and trace completeness.

Success means the task reaches `VERIFIED` with no unauthorized disclosure and a complete audit trace.

## 3. Data that is always private

The shared server must never store:

- private intents;
- personal memory or chat history;
- private relationship graphs, scores, or notes;
- undisclosed project plans, budgets, credentials, or contact details;
- personal policies and delegation internals.

Only membership, presence, audience-scoped claims, mailbox envelopes, introductions, and shared commitments may enter the shared plane.

## 4. When the Personal Agent must ask the human

| Risk | Examples | Rule |
|---|---|---|
| L0 | Read own data, search claims, produce recommendations | May run automatically |
| L1 | Draft a capsule, update a private intent | May run automatically; remains local |
| L2 | Contact a member, publish or revoke a claim | Explicit confirmation required |
| L3 | Share sensitive context, make a commitment, change permissions | Strong confirmation required |

No worker may weaken policy or approve its own external action.

## 5. What counts as successful collaboration

A collaboration is successful only when:

- both principals approved the relevant external actions;
- the Context Capsule is schema-valid, purpose-bound, unexpired, and policy-valid;
- the commitment matches the accepted introduction and both approvals;
- the independent Verifier returns `VERIFIED`;
- the trace contains every state transition, agent, skill, tool decision, and approval;
- unauthorized disclosure count is zero.

## Non-goals for v0.1

DID/VC, blockchain, wallets, tokens, global reputation, global social graphs, mobile/native apps, federation, A2A task execution, Neo4j, Kafka, Temporal, and complex CRDTs.
