# context-capsule

Version: `0.1.0`

## Trigger

The principal selects a candidate and an introduction draft is required.

## Inputs

- private Intent;
- target agent;
- accessible personal context;
- disclosure policy;
- declared purpose and expiry.

## Outputs

- schema-valid capsule draft;
- included and removed fields;
- risk level and approval requirement;
- `DENIED` decision when policy blocks disclosure.

## Dependencies

Local relationship read, deterministic policy check, approval creation, and audit recording.

## Failure handling

Return `insufficient_context`, `policy_conflict`, `invalid_recipient`, or `scope_exceeds_delegation`. A failure produces no outbound payload.

## Safety boundary

Never export personal memory or a relationship graph, weaken policy, or mark its own draft approved. L2/L3 actions require an approval reference generated after human consent.

## Verification

Validate schema, recipient, purpose, expiry, allowed fields, policy proof, and removed-field inventory.
