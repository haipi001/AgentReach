# AgentReach 初赛作品简介

## 提交版（500 字以内）

AgentReach 是面向跨个人、跨组织复杂协作的隐私保护型多 Agent 基础设施。现实中的合作发现通常要求平台集中收集个人意图、关系和历史记录，既带来隐私风险，也缺少行动审批和结果验证。AgentReach 将私人 Intent、Memory、Relationship Graph 与共享 Claims 分离：Personal Agent 在本地完成意图结构化和候选排序，仅生成目的、接收方和有效期受限的最小 Context Capsule；双方人工同意后，AgentTeams 内部职能 Agent 才能执行受范围约束的外部动作，并由独立只读 Verifier 反查世界状态。只有 VERIFIED 结果可以写回长期 Memory。当前开源 Demo 已实现 6 个 Agent Identity、6 个可复用 Skill 契约、双向审批、Repository 与 Agent Inbox 两项真实动作、幂等 Action Receipt、完整 Trace 和越权关系图请求 DENIED 分支。项目以 JSON Schema、Skill、连接器契约和可回放评测沉淀通用能力，可迁移到招聘、研发协作、科研合作和跨组织项目治理。

## 字段拆解

- 项目名称：AgentReach
- 问题与场景：跨个人、跨组织协作依赖集中收集私人意图与关系，行动过程缺乏最小披露、双向授权和独立验证。
- 核心方案：本地 Intent/Discovery、最小 Context Capsule、双方同意、受限世界动作、独立 Verifier、verified-only Memory。
- 创新优势：私人数据不进入共享域；执行与验证分离；只有已验证世界变化能够成为 Agent 经验。
- 开放价值：Agent Identity、JSON Schema、Skill 契约、连接器契约、合成数据、测试与评测方法均可复用。
- 当前进展：确定性端到端 Demo、9 项自动化测试、Web UI、成功与隐私拒绝分支、公开 GitHub 仓库。
