# candidate-discovery

Version: `0.1.0`

## Trigger

A schema-valid active Intent needs eligible candidates.

## Inputs

- private Intent;
- audience-visible shared claims and presence;
- owner-scoped local relationship records;
- scoring timestamp.

## Outputs

- ranked candidate identifiers;
- deterministic score components;
- claim and relationship evidence identifiers;
- human-readable explanations grounded in evidence.

## Dependencies

Trust-domain claim search, local relationship search, and audit recording.

## Failure handling

Return `no_match` if hard filters remove all candidates, `stale_claims` if only expired evidence exists, and `tool_unavailable` without fabricating results.

## Safety boundary

Never read a remote person's private data, expose local relationship notes, or initiate contact. LLM reranking cannot override hard filters.

## Verification

Recompute scores from evidence, reject expired/out-of-audience claims, and verify every explanation statement has an evidence ID.
