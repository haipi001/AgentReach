# Observability / Trace / Evidence

## 1. 每次任务都有 trace_id

链路：

```text
Human
→ Agency Kernel
→ AgentTeams
→ Worker
→ Skill
→ MCP
→ Action Gateway
→ External System
→ Verifier
→ Evidence
→ Memory
```

## 2. Span 类型

- agent
- skill
- mcp
- model
- policy
- approval
- action
- verification
- memory
- evolution

## 3. AuditEvent

字段：

```text
event_id
trace_id
principal_id
agent_id
actor
operation
target
decision
risk
policy
approval
tool
latency
result
evidence_ref
timestamp
```

## 4. Evidence

Evidence 不能等同日志。

Evidence 必须回答：

- 世界发生了什么变化？
- 谁验证的？
- 用什么方式验证？
- 是否可重复验证？
- 是否可回滚？

## 5. 指标

- end-to-end success
- action success
- verifier accuracy
- unauthorized disclosure
- policy violation
- rollback success
- tool success
- trace completeness
- latency
- token usage
- local/cloud routing ratio
- learned procedure success
- human intervention rate
