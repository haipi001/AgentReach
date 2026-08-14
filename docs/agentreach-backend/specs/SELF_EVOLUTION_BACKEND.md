# 后端自我迭代 / 自我复写

## 1. 目标

AgentReach 后端可以：

- 分析自己的失败
- 提议改进
- 生成 Patch
- 更新 Skill
- 优化 Procedure
- 优化 Router
- 优化 Connector
- 增加 Adapter
- 增加 API
- 增加测试

但不能：

- 在运行中的生产目录直接覆盖核心代码
- 修改自身最高权限安全规则
- 静默扩权
- 绕过测试和审批

## 2. Evolution Levels

### E0 Data / Config

可自动：

- ranking weights
- cache
- non-security config

### E1 Prompt / Skill

可提议 + 自动测试：

- skill refinement
- prompt version
- examples

### E2 Procedure / Connector

需要 preview / sandbox：

- AIP procedure
- connector workflow
- adapter config

### E3 Source Code

必须完整 code evolution pipeline。

## 3. Code Evolution Pipeline

```text
Failure / Opportunity
↓
EvolutionProposal
↓
Create isolated git worktree
↓
Create branch
↓
Generate patch
↓
Static analysis
↓
Unit tests
↓
Contract tests
↓
Integration tests
↓
Security tests
↓
Migration test
↓
Sandbox runtime
↓
Canary
↓
Human / Maintainer approval
↓
Signed release
↓
Deploy
↓
Observe
↓
Rollback
```

## 4. Evolution Proposal

必须包含：

- observation
- evidence
- root cause hypothesis
- target module
- proposed change
- security impact
- data migration
- tests
- expected metric change
- rollback
- protected zone touched

## 5. Protected Zones

禁止 Evolution Agent 自主修改：

- identity root authority
- credential broker
- approval kernel
- policy root rules
- audit integrity
- release signature verification
- evolution constitution
- protected module list

## 6. Skill Evolution

Skill 可以产生：

```text
v1.0
↓ evidence
v1.1 candidate
↓ eval
approved
↓
v1.1 active
```

不能静默覆盖。

## 7. Procedure Evolution

新的成功执行可以建议：

- shorter path
- more stable adapter
- better verifier
- safer rollback

但只能生成：

ProcedureCandidate vNext

## 8. Backend Constitution

不可修改原则：

- Human is final authority.
- Private first.
- External inputs are assertions.
- Action must be accountable.
- High risk requires approval.
- Evidence before trusted memory.
- Evolution must be reversible.
- Evolution may not rewrite its own root authority.
