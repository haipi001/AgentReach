# introduction-handshake

Version: `0.1.0`

## Trigger

A valid Context Capsule has explicit sender approval, or a peer introduction awaits a human decision.

## Inputs

- approved Context Capsule;
- sender approval;
- optional peer response and peer approval.

## Outputs

- introduction state transition;
- mailbox receipt;
- optional commitment proposal only after acceptance.

## Dependencies

Mailbox send/receive, approval lookup, protocol validation, and audit recording.

## Failure handling

Return `approval_missing`, `capsule_expired`, `capsule_invalid`, `peer_rejected`, `delivery_failed`, or `replay_detected`.

## Safety boundary

Never send an unapproved capsule, add context after approval, or create an accepted commitment on behalf of either human.

## Verification

Bind approval to the exact capsule hash and recipient, check expiry and replay ID, verify mailbox receipt, and record every transition.
