# AgentReach 预赛软件验收证据

依据《GOAI 新智基座 Agent Infra 赛道参赛手册》，初赛必交材料为作品简介与方案 PPT；跨阶段软件要求中，至少 3 个职能 Agent、AgentTeams 协同映射与可复用 Skill 为核心要求。MCP 与可观测为推荐可选项，Nacos 属于工程增强项。

## 当前实现

| 条件 | 仓库证据 | 状态 |
|---|---|---|
| 至少 3 个职能 Agent | `agentteams/agents.yaml`：6 个显式身份；运行时另有受限 Action Worker | 满足 |
| AgentTeams 设计基点 | `agentteams/implementation-map.json` 映射 Manager、6 Worker、上下文、状态、失败与 Trace | 满足 |
| 多 Agent 端到端闭环 | Intent → Discovery → Boundary →双向 Consent → Action → Verifier → Evidence → Memory | 满足 |
| Skill 必选 | `skills/` 下 6 个版本化 Skill，声明输入/输出、工具、审批与失败模式 | 满足 |
| 工具稳定接入 | Repository Sandbox 与 Agent Mailbox 通过 Connector Registry、Scoped Grant、Outbox、Receipt 接入 | 满足 |
| MCP 或等价契约 | `mcp_servers/tool-contracts.json` 完整声明协议边界、鉴权、Schema、错误、重试、幂等、审计与降级 | 满足 |
| 执行证据 | 每条任务拥有 Trace；Verifier 与执行者分离；VERIFIED 后才写入 Memory | 满足 |
| 安全、审批、回滚 | L2/L3 审批、默认拒绝、授权撤销、任务取消/重试、Outbox 安全重放 | 满足 |
| 异常分支 | 隐私关系图越权请求得到 DENIED；失败 Job/Action 可见且有界重试 | 满足 |
| Nacos 映射 | `agentteams/nacos-registry-export.json` 仅导出 Agent/Skill/Tool 元数据，排除私人数据 | 增强项满足离线映射 |
| 可运行与测试 | `scripts/run_demo.py`、`scripts/demo_cli.py`、pytest、前端 typecheck/build 与 E2E | 满足 |

## 一键验收

```bash
python3 scripts/validate_preliminary.py
python3 -m pytest -q
pnpm test:kernel
cd apps/web && pnpm lint && pnpm build
```

验证器会同时检查 Agent Identity 字段、AgentTeams 真实入口、Skill 工程字段、工具契约、Nacos 私密数据排除、提交文件以及 Golden Demo 的 `VERIFIED` 与 `DENIED` 证据。

## 边界说明

- 初赛不强制提交可执行 AgentTeams 代码包；该项在复赛成为必交材料。当前仓库已提供可检查的确定性多 Agent Runtime 与 AgentTeams 实现映射。
- MCP Server 本身不是初赛强制项；当前等价工具契约已保证未来只需增加协议适配，不需重写 Action/Connector 链。
- Nacos 不承载 Personal Memory、private relationship、private intent 或 credential，仅用于版本化注册元数据。
