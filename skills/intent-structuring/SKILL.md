# intent-structuring

Version: `0.1.0`

## Trigger

A principal asks the Personal Agent to find a collaborator inside one or more trust domains.

## Inputs

- human request;
- principal identifier;
- allowed trust-domain scopes;
- optional private constraints.

## Outputs

- schema-valid private `Intent`;
- explicit assumptions and missing fields;
- no external side effect.

## Dependencies

Personal intent storage and audit event recording.

## Failure handling

Return `insufficient_context` when topic or scope cannot be established; return `unsupported_intent` for requests outside `find_collaborator`.

## Safety boundary

Never publish an intent, infer sensitive traits, or contact another agent. The intent remains `visibility=private`.

## Verification

Validate the protocol schema, private visibility, allowed scope, and trace entry.
