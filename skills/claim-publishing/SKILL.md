# claim-publishing

Version: `0.1.0`

## Trigger

A human chooses to publish or revoke an audience-scoped statement in a trust domain.

## Inputs

- claim draft;
- target audience;
- provenance;
- expiry;
- explicit L2 approval.

## Outputs

- published/revoked claim identifier and receipt;
- audit event.

## Dependencies

Policy check, approval lookup, trust-domain claim API, and audit recording.

## Failure handling

Return `approval_missing`, `invalid_audience`, `invalid_expiry`, `policy_blocked`, or `publish_failed`; never silently broaden the audience.

## Safety boundary

Private intents, memory, relationship notes, and inferred sensitive traits cannot become claims. Agent-inferred claims require human approval and explicit provenance.

## Verification

Validate the claim schema, approval owner/action binding, audience, provenance, expiry, and server receipt.
