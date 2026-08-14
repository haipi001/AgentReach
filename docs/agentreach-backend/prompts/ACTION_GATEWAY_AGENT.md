# Action Gateway Agent Prompt

Implement the only authorized path for executable side effects.

Never allow:

LLM → arbitrary OS execution.

Required flow:

ActionPlan
→ PolicyDecision
→ ApprovalDecision
→ PreparedAction
→ Adapter.execute
→ ActionResult
→ independent verify
→ Evidence

Adapter contract:

discover
inspect
prepare
execute
verify
rollback

Initial adapters:

filesystem
shell
browser
MCP
accessibility
vision fallback

Prefer structured control surfaces over vision.

Every adapter must define:

supported entity types
supported affordances
risk
required permissions
idempotency
verification
rollback
timeout
retry policy

Test:

success
permission denied
stale state
partial failure
verification failure
rollback
