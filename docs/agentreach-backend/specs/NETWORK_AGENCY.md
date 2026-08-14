# Network Agency

## 1. 目标

让同一个 Personal Agent 从本地可信世界向外连接整个网络。

不是 Community Brain。

## 2. Personal Reach Graph

网络是“相对于用户”的可达世界。

不存在：

- global trust score
- global private relationship graph
- central private intent database

## 3. Entity 类型

- Person
- Agent
- Organization
- Company
- Community
- Project
- Repository
- Service
- WebResource
- CloudResource
- Market
- Device
- KnowledgeSource

## 4. Affordance

统一计算：

```text
Affordance
=
Entity
× Capability
× Credential
× Relationship
× Policy
× Intent
```

示例：

```text
GitHub Repo + repo:write + coding
→ Open PR

Person + existing relationship + communication
→ Request Conversation

Company + employee credential
→ Access Internal Resource
```

## 5. Private Intent × Shared Claims

External discovery：

```text
Private Intent
× Shared Claims
× Personal Context
→ Reach Candidates
```

Private Intent 默认不上传。

## 6. Context Capsule

跨 Local Boundary 的上下文必须生成 Capsule：

```text
purpose
recipient
scope
shared claims
data manifest
expiry
forwarding policy
approval
```

## 7. Network Gateway

统一连接：

- company
- community
- GitHub
- Slack
- Jira
- Notion
- Web
- external Agent
- cloud service

长期可加入 A2A adapter。

## 8. External Agent

外部 Agent 只能：

- 请求
- 声明
- 提议
- 返回结果

不能：

- 修改 Personal Memory
- 修改 Personal Policy
- 扩权
- 直接执行本地高风险动作
