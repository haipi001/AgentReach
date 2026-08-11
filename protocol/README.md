# AgentReach Protocol v0.1

The protocol defines six JSON objects:

- `Intent`: private, locally owned collaboration intent;
- `Claim`: signed, audience-scoped, expiring external statement;
- `Context Capsule`: purpose-bound minimum disclosure for one recipient;
- `Introduction`: consent handshake between two personal agents;
- `Commitment`: mutually approved collaboration objective.
- `Avatar Profile`: local-first appearance, renderer, model provenance, and biometric privacy preferences.

Schemas use JSON Schema Draft 2020-12 and reject unspecified fields to make boundary drift visible.
