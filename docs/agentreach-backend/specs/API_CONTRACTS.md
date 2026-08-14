# API Contracts

## 1. REST

### Self

```text
GET /api/v1/self
GET /api/v1/agent
GET /api/v1/capabilities
GET /api/v1/compute
```

### Memory

```text
GET /api/v1/memory
POST /api/v1/memory/candidates
POST /api/v1/memory/{id}/verify
POST /api/v1/memory/{id}/correct
DELETE /api/v1/memory/{id}
```

### Intent

```text
POST /api/v1/intents
GET /api/v1/intents
POST /api/v1/standing-intents
PATCH /api/v1/standing-intents/{id}
```

### Apps / AIP

```text
GET /api/v1/apps
GET /api/v1/apps/{id}
GET /api/v1/apps/{id}/aip
POST /api/v1/apps/{id}/learn
GET /api/v1/apps/{id}/procedures
POST /api/v1/apps/{id}/procedures/{id}/authorize
```

### Reach

```text
POST /api/v1/reach/search
GET /api/v1/entities/{id}
GET /api/v1/entities/{id}/affordances
```

### Action

```text
POST /api/v1/actions/prepare
POST /api/v1/actions/{id}/approve
POST /api/v1/actions/{id}/execute
POST /api/v1/actions/{id}/rollback
GET /api/v1/actions/{id}
```

### Evidence

```text
GET /api/v1/evidence
GET /api/v1/evidence/{id}
GET /api/v1/traces/{trace_id}
```

### Evolution

```text
GET /api/v1/evolution/proposals
POST /api/v1/evolution/proposals/{id}/preview
POST /api/v1/evolution/proposals/{id}/approve
POST /api/v1/evolution/proposals/{id}/reject
POST /api/v1/evolution/releases/{id}/rollback
```

## 2. Event Stream

WebSocket / SSE：

```text
GET /api/v1/events/stream
```

事件：

```text
agent.state.changed
intent.created
memory.candidate.created
memory.verified
routine.detected
procedure.learned
capability.loaded
entity.discovered
affordance.changed
approval.required
action.started
action.progress
verification.passed
evidence.created
evolution.proposed
release.deployed
```

## 3. Internal Contracts

所有内部 command 使用 typed Pydantic models。

禁止裸 dict 在核心层传递。
