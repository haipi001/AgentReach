# Security Model v0.1

## Data classification

`PRIVATE`, `PERSONAL`, `RELATIONSHIP`, `DOMAIN`, `PUBLIC`.

Every outbound payload must pass Boundary evaluation, deterministic policy evaluation, and risk-appropriate approval.

## Minimum sufficient disclosure

A Context Capsule includes only fields necessary for its declared purpose and recipient. It must include expiry and policy proof. The UI must show both shared and removed fields before approval.

Disclosure Ratio is `outbound fields / accessible context fields`; it is diagnostic, not a goal by itself. The goal is the lowest disclosure that still completes the approved collaboration.

## Required denial case

A request for a complete private relationship graph returns `DENIED` with reason `scope_exceeds_delegation`; only audience-scoped domain and topic facts may be offered. The denial is written to the audit trace.

## Trust assumptions

- Synthetic demo data contains no real personal information.
- Shared claims are not treated as private facts and carry provenance and expiry.
- Signatures in Day 0 schemas are placeholders for a later cryptographic implementation.
- Secrets never enter fixtures, traces, source control, or Context Capsules.
