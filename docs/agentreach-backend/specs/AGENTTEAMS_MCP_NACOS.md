# AgentTeams / MCP / Nacos 集成

## 1. AgentTeams 的位置

AgentTeams 是复杂任务 Runtime，不是 Agency Kernel 本身。

```text
Agency Kernel
↓ complex task
AgentTeams Manager
├─ Intent Worker
├─ Reach Worker
├─ Boundary Worker
├─ Action Worker
└─ Verifier Worker
```

外部用户仍然只看到一个 Personal Agent。

## 2. Worker 职责

### Intent

- 结构化意图
- 约束
- 隐私级别

### Reach

- Entity discovery
- Capability resolution
- Affordance candidate

### Boundary

- Policy
- Context Capsule
- disclosure

### Action

- 调 Skill
- 调 MCP
- 调 Action Gateway

### Verifier

- 独立验证
- Evidence

## 3. Skill

Skill 目录建议：

```text
skills/
  intent-structuring/
  memory-retrieval/
  relationship-reasoning/
  entity-discovery/
  capability-resolution/
  affordance-resolution/
  context-capsule/
  policy-check/
  safe-action/
  result-verification/
  experience-reflection/
```

## 4. MCP Servers

```text
personal-mcp
reach-mcp
action-mcp
mailbox-mcp
audit-mcp
```

### personal-mcp

- memory_search
- intent_create
- relationship_search
- capability_list

### reach-mcp

- entity_search
- claim_search
- presence_get
- affordance_list

### action-mcp

- action_prepare
- action_execute
- action_status
- action_rollback

### mailbox-mcp

- envelope_send
- inbox_list
- introduction_respond

### audit-mcp

- trace_append
- evidence_write
- audit_query

## 5. Nacos

Nacos 用于：

- Skill Registry
- AgentSpec
- MCP Registry
- Prompt
- Version
- Review
- Release
- Rollback

不能用 Nacos 存：

- Personal Memory
- private relationships
- private intent
