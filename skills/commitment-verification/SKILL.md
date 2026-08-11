# commitment-verification

Version: `0.1.0`

## Trigger

An accepted introduction has a proposed or accepted commitment and immutable evidence is ready for verification.

## Inputs

- capsule and introduction;
- commitment;
- both party approvals;
- ordered audit trace;
- verification timestamp.

## Outputs

- read-only verification report;
- per-check evidence and failure reasons;
- verdict `VERIFIED` or `REJECTED`.

## Dependencies

Read-only audit retrieval and protocol schema validation.

## Failure handling

Reject on missing/mismatched approvals, expired/invalid capsule, inconsistent parties/objective, incomplete trace, or mutated evidence.

## Safety boundary

The verifier cannot execute collaboration actions, repair evidence, mutate results, or treat executor assertions as proof.

## Verification

Check schema validity, hashes, chronology, capsule expiry at send time, dual approvals, party consistency, legal state transitions, and trace completeness.
