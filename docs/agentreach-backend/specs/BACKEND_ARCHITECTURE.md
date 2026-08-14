# AgentReach 后端总架构

## 1. 后端定位

AgentReach 后端 = Personal Agency Runtime。

不是：

- Chatbot backend
- 单纯 Agent orchestrator
- MCP 聚合器
- 中央 Community Brain

而是：

```text
HUMAN
  │
  ▼
PERSONAL AGENT IDENTITY
  │
  ▼
AGENCY KERNEL
  │
  ├── Identity
  ├── Memory
  ├── Intent
  ├── Habit
  ├── AIP
  ├── Capability
  ├── Model Router
  ├── Entity
  ├── Affordance
  ├── Policy
  ├── Action
  ├── Verification
  ├── Evidence
  └── Evolution
  │
  ├────────────── Local Agency
  │
  └────────────── Network Agency
```

## 2. 两层世界

### Local Agency

本地可信域：

- Personal Memory
- Intent
- Relationships
- Apps
- Files
- Devices
- AIP
- Habits
- Learned Procedures
- Skills
- Credentials
- Compute
- Policies
- Approvals

### Network Agency

外部可达域：

- People
- Companies
- Work
- Organizations
- Communities
- Projects
- Repositories
- Services
- Agents
- Web
- Cloud
- Markets
- Devices

跨越 Local → Network 必须经过 Boundary。

## 3. Agency Kernel Loop

所有任务统一走：

```text
INTENT
↓
CONTEXT
↓
ENTITY
↓
AFFORDANCE
↓
PLAN
↓
POLICY
↓
APPROVAL
↓
EXECUTE
↓
VERIFY
↓
EVIDENCE
↓
REFLECT
↓
MEMORY / SKILL
```

## 4. 一级模块

```text
backend/src/agentreach/

  identity/

  agency/
    kernel/
    planner/
    context/
    orchestration/

  memory/
    episodic/
    semantic/
    preference/
    relational/
    procedural/
    provenance/

  habits/
    collector/
    normalizer/
    segmenter/
    pattern_miner/
    synthesizer/
    evaluator/

  aip/
    registry/
    compiler/
    runtime/
    adapters/

  capabilities/
    registry/
    resolver/
    loader/

  entities/
    registry/
    graph/
    search/

  affordances/
    resolver/
    ranking/

  models/
    router/
    providers/
    policy/

  actions/
    gateway/
    planner/
    adapters/
    rollback/

  policy/
    engine/
    delegation/
    disclosure/
    approval/
    risk/

  verification/
    engine/
    validators/
    evidence/

  network/
    gateway/
    claims/
    presence/
    mailbox/
    trust_domains/
    connectors/

  agentteams/
    bridge/
    workers/
    task_mapping/

  observability/
    traces/
    metrics/
    audit/
    events/

  evolution/
    proposals/
    patches/
    sandbox/
    validation/
    release/
    rollback/

  api/
  db/
  events/
```

## 5. 关键边界

### Personal Agent Identity != LLM

LLM 是可替换 Compute Provider。

### Agency Kernel != AgentTeams

AgentTeams 是复杂任务的多 Agent Runtime。

### Skill != MCP

Skill = 可复用能力。
MCP = 工具连接协议。

### Memory != Vector DB

Canonical Memory 必须有结构、有 provenance。
Vector 只是派生索引。

### Action != LLM Output

Action 必须经过 Action Gateway 并返回可验证结果。

### Evolution != Runtime Mutation

自我进化必须经过版本、测试、发布、回滚。
