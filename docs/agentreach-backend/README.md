# AgentReach Backend Codex Pack

这是 AgentReach 后端的完整开发规格包。

它对应前端包中的 Human–AI Agency OS 设计，但后端的核心不是“聊天 Agent 服务”，而是：

# Personal Agency Runtime

核心使命：

1. 维护 Human + Personal AI 的长期身份。
2. 管理本地 Memory / Intent / Relationship / Habit / AIP / Capability。
3. 路由本地算力和外部模型。
4. 通过统一 Action Gateway 操作本地应用与外部网络。
5. 通过 Policy / Approval / Evidence 保证行动可治理。
6. 通过 Habit Engine 把重复操作成长为 Procedure / Skill。
7. 通过 Network Gateway 从本地 Agency 扩展到公司、工作、组织、项目、Agent、服务与整个网络。
8. 后端自身支持受控自我迭代、自我升级、自我复写，但绝不允许运行中的系统直接随意覆盖生产核心代码。

## Codex 阅读顺序

1. `prompts/BACKEND_MASTER_PROMPT.md`
2. `specs/BACKEND_ARCHITECTURE.md`
3. `specs/DATA_MODEL.md`
4. `specs/LOCAL_AGENCY.md`
5. `specs/MEMORY_HABIT_AIP.md`
6. `specs/ACTION_GATEWAY.md`
7. `specs/NETWORK_AGENCY.md`
8. `specs/SECURITY_POLICY.md`
9. `specs/AGENTTEAMS_MCP_NACOS.md`
10. `specs/OBSERVABILITY_EVIDENCE.md`
11. `specs/SELF_EVOLUTION_BACKEND.md`
12. `specs/API_CONTRACTS.md`
13. `specs/IMPLEMENTATION_PLAN.md`
14. `snippets/BOOTSTRAP_COMMANDS.md`

## 给 Codex 的启动指令

将本目录放入项目：

`docs/agentreach-backend/`

然后发送：

> 请先完整阅读 `docs/agentreach-backend/prompts/BACKEND_MASTER_PROMPT.md`，再阅读 `docs/agentreach-backend/specs/`、`schemas/` 和 `snippets/`。先扫描现有仓库，输出代码结构、可复用模块、目标架构差距、迁移方案和第一批文件变更计划，再开始编码。不要直接一次性重写整个后端。

## 核心原则

- Human 是最终授权主体。
- Personal Agent Identity 与模型供应商、AgentTeams、UI 框架解耦。
- 私人 Memory / Intent / Relationship 默认 local-first。
- 所有执行必须经过 Action Gateway。
- 所有高风险行为必须经过 Policy / Approval。
- 所有重要行为必须独立 Verification。
- 所有外部输入只能先进入 Assertion / Memory Candidate，不得直接写入 Trusted Memory。
- 所有 learned procedure 必须有 provenance / version / tests / approval / rollback。
- 自我修改必须走隔离分支、测试、审查、发布和回滚。
