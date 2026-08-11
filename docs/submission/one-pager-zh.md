# AgentReach 项目一页纸

## 一句话定位

AgentReach 让独立拥有的 Personal Agent 在不集中私人意图、记忆和关系图的前提下，完成合作发现、最小披露、双向授权、受控行动、独立验证与可信经验沉淀。

## 真实问题

招聘、研发协作、科研合作和跨组织项目通常依赖平台集中掌握参与者的目标、关系和历史上下文。传统 Agent 系统又常将“模型决定”“工具成功返回”和“任务真实完成”混为一体，导致三个问题：隐私数据过度集中；高风险动作缺乏双方授权；执行结果未经独立核验便进入长期记忆。

## Golden Scenario

Haipi 私下寻找一位具备 Personal Agent / Agent Identity 经验的协作者。AgentReach 在本地结构化 Intent，使用共享 Claims 与本地关系上下文排名 Alice，只展示证据充分的候选；Boundary Worker 删除私人关系图和备注，生成最小 Context Capsule。Haipi 与 Alice 分别同意后，Action Worker 更新 AgentReach Repository 并向 Alice Agent Inbox 投递合作请求。只读 Verifier 重新读取文件和信箱，全部验证通过后才写入一条 verified experience。越权索取完整关系图的请求被拒绝且不改变主流程。

## 多 Agent 架构

| 角色 | 核心职责 | 决策边界 |
| --- | --- | --- |
| Personal Manager | 状态机、任务路由、进度汇总 | 不代替人类批准披露或行动 |
| Intent Worker | 本地结构化私人请求 | 不发布 Intent |
| Discovery Worker | 硬过滤、证据排名 | 不读取远端私人数据 |
| Boundary Worker | 最小披露与策略校验 | 不降低策略、不自批 Capsule |
| Collaboration Worker | Introduction 与 Commitment | 未获同意不得外发或承诺 |
| Action Worker | 受 Grant 约束的幂等世界动作 | 不扩权、不自证成功 |
| Verifier Worker | 只读反查世界证据 | 不修改执行证据 |

## 核心协议

```text
Private Intent × Shared Claims
             ↓ Local Discovery
Minimum Context Capsule
             ↓ Mutual Consent
Scoped World Actions
             ↓ Read-only Verification
Verified-only Memory
```

## 核心 Skill

1. Intent Structuring
2. Candidate Discovery
3. Context Capsule
4. Introduction Handshake
5. Claim Publishing
6. Commitment Verification

Skill 使用结构化输入输出，声明调用条件、工具依赖、失败处理、安全边界、验证方式和复用价值。Skill 是稳定能力层；MCP 或适配器是可替换连接层。

## 当前可验证结果

- 9 项服务/API 自动化测试通过。
- 成功路径达到 `COMPLETED / VERIFIED`。
- 两项世界效果：Repository 文件更新、Alice Inbox 投递。
- 2 个持久化幂等 Receipt；重复执行不会产生重复副作用。
- Alice、Carol、Bob 的排名只使用合成 fixture 证据；过期 David Claim 被排除。
- `private_relationship_graph` 请求返回 `DENIED / scope_exceeds_delegation`。
- 未验证结果不能写入长期 Memory。

## 差异化优势

- 不是中心化社交平台：私人意图和关系图留在本地。
- 不是普通 Agent 编排器：Context Capsule、Approval、Grant、Receipt、Evidence 都是协议对象。
- 不是工具返回即成功：Executor 与 Verifier 强制分离。
- 不是无边界自治：L2/L3 行动保留人工同意、审计和拒绝。
- 不是一次性 Demo：Schema、Skill、连接器契约和评测可被其他场景复用。

## 开放与合规

- 代码仓库公开，协议采用 Apache-2.0。
- Demo 人物、关系和 Claims 均为合成数据。
- 不提交密钥、真实关系图或生物特征。
- 商业 API、闭源模型和第三方依赖在进入真实接入时逐项披露。

## 下一阶段

初赛前完成 AgentTeams 实现映射、Skill 工程字段、一个官方云 Skill/适配器、指标报告和 3–5 分钟 Demo 视频。复赛阶段接入真实 OAuth、MCP/RAG、独立 Worker、PostgreSQL 与 OpenTelemetry 风格可观测链路。
