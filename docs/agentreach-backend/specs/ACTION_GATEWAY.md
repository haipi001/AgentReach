# Action Gateway

## 1. 目标

隔离“智能推理”和“系统执行”。

禁止：

```text
LLM → arbitrary shell / mouse / system
```

必须：

```text
LLM / Agent
↓
ActionPlan
↓
Policy
↓
Approval
↓
Action Gateway
↓
Adapter
↓
World
↓
Verification
```

## 2. Action

```json
{
  "action_id": "act_001",
  "intent_id": "int_001",
  "entity_id": "repo:agentreach",
  "affordance_id": "repo.create_file",
  "executor": "action-worker",
  "risk": "L2",
  "status": "prepared"
}
```

## 3. Adapter Contract

```python
class ActionAdapter:
    async def discover(self, target): ...
    async def inspect(self, target): ...
    async def prepare(self, action): ...
    async def execute(self, prepared): ...
    async def verify(self, result): ...
    async def rollback(self, result): ...
```

## 4. Risk

建议：

- L0 observe
- L1 read / generate
- L2 reversible external action
- L3 high-impact / identity / publish / commitment
- L4 financial / security / destructive / legal

## 5. 高风险硬规则

以下默认不可自动升级权限：

- payment
- transfer
- secret
- password
- security settings
- software install
- destructive delete
- legal commitment
- public publishing
- high-impact message
- privilege escalation

可以：

- understand
- prepare
- draft

但不能仅凭历史习惯变成 autonomous。
