# AgentReach 20 界面实施状态

> 审计日期：2026-08-14
> 口径：必须同时检查产品语义、真实数据、交互闭环、Schema/Registry 迁移和视觉验收；有一个缺口就不标记“完成”。

## 状态摘要

| 状态 | 数量 | 含义 |
|---|---:|---|
| 完成 | 2 | 已接真实数据、交互闭环和视觉验收 |
| 部分实现 | 18 | 有真实能力，但缺少规格字段、独立 Surface 或统一联动 |
| 缺失 | 0 | 20 个规格界面均已有真实能力入口；仍不能把“部分实现”冒充为完成 |

## 逐屏证据矩阵

| # | 界面 | 状态 | 当前证据 | 主要缺口 / 下一 Gate |
|---:|---|---|---|---|
| 01 | 待机光球 / AI 存在 | 部分 | `AgentCore` 有 WebGL/CSS 回退、阶段状态和通知徽标 | 缺 Tauri 透明窗口、always-on-top、拖拽、位置持久化、全局快捷键 |
| 02 | 自我空间总览 | 部分 | Orb First 首屏默认七个核心维度；本地世界四子空间采用语义缩放，高级维度仍可单独固定 | 缺成长曲线、最近活动、Active Intent Top 3 |
| 03 | 我的 AI 面板 | 部分 | `IdentityLoadout` 展示记忆、技能、项目、边界和运行状态 | 意图/关系/学习动作数未统一为 Domain Model 指标 |
| 04 | AI 校准 | 部分 | `PersonaStudio` 支持材质、信号色、光晕强度 | 缺完整行为边界表单和 Policy 写入证据 |
| 05 | 本地世界总览 | 完成 | 统一 Local World Surface 聚合 Application、Routine、Compute、File/Device 与 Skill；展示健康度、CPU/GPU/内存/存储，并完成四子空间进入、返回和移动端视觉验收 | 后续增强不影响当前规格闭环 |
| 06 | 应用空间 | 部分 | 真实扫描 macOS 应用目录；11 个 Application Entity 显示安装/未安装与零授权状态 | 尚缺经审批的 App Permission Runtime 和已学习状态 |
| 07 | 应用详情 | 部分 | 展示真实安装路径、Bundle ID、版本、权限包络和 Procedure 计数 | 权限管理与“教 AI 新操作”必须等 Permission/Routine Runtime 后启用 |
| 08 | 习惯 / 程序学习 | 部分 | Routine Authority 从持久 Run、Verifier 和 Memory 派生真实观察数、验证数、置信度、六步语义程序和持久学习策略 | 尚缺多应用 Routine 观察器和低风险自动执行核准流 |
| 09 | 技能中心 | 部分 | Skill Registry 已接 SQLite 且可启停 | 缺搜索、分类、版本/来源/依赖、使用量与成功率 Surface |
| 10 | 能力空间 | 部分 | 首屏有 Skills 维度，Domain Model 有 Capability | 缺真实能力聚合器、指标与成长证据 |
| 11 | 计算空间 | 部分 | 已接本机 CPU、统一内存、磁盘、Apple GPU；实时探测 Ollama/vLLM 与云端配置并解释 Local/Cloud 路由 | 需模型配置、路由策略编辑、性能历史与任务级用量 |
| 12 | 记忆空间 | 部分 | Verified Memory Vault 支持搜索、证据溯源、两步忘记 | 缺类型空间化布局、有效期/置信度/健康度与纠正流 |
| 13 | 文件与设备 | 部分 | 已建立 deny-by-default File/Device Authority；展示授权范围内最近文件、读写策略、敏感目录、真实设备和 Evidence artifacts，并从 Workspace 双向深链 | 需真实目录授权编辑、Phone/iPad/NAS 配对和文件级 Affordance 审批 |
| 14 | 触达空间 | 部分 | Candidate Discovery 与意图相关 Entity 已工作 | 旧 `ReachScene` 尚未完全迁移到统一 Workspace Surface |
| 15 | 实体详情 + 可行动作 | 部分 | Candidate 卡有 WHY/分数/选择 | 缺统一 Entity Panel、Credential、禁用 Affordance 和审批级别 |
| 16 | 上下文胶囊 / 授权 | 部分 | `workspace.approval` 有最小披露/保持私密和 Protected Command | 缺 Purpose、有效期、允许/禁止动作的完整 Capsule Schema 呈现 |
| 17 | 行动预览 | 部分 | Commitment 审批展示两项 Action Plan 和 Verifier | 缺影响、预计时间、回滚、涉及应用/对象的结构化视图 |
| 18 | 执行中 | 部分 | Worker Queue、Outbox、暂停/取消/重试已在 SystemPanel | 需迁移为当前 Stage Surface，展示 Action Chain、Worker、Tool 和实时日志 |
| 19 | 证据空间 | 完成 | `workspace.evidence` + Verifier + World Changed + Trace + Memory 真实闭环 | 后续仅做视觉/查询增强，不改受保护逻辑 |
| 20 | 工作台 / 工程调试 | 部分 | Spatial Mission Surface + SystemPanel + TracePanel 已运行 | 工程标签尚未统一到 Agent/Skill/MCP/LLM/Trace/Policy/Evidence 视图 |

## 联动审计

### 已连通

- Orb 状态 ← Authority `DemoState.stage/runtime.status`；
- 意图 → 本地发现 → 候选 Entity → 披露审批 → 双向同意 → 强确认 → Action → Verifier → Evidence → Memory；
- 首页、核心维度、Notification、Run History、System Panel → 统一 `SurfaceDestination`；
- 手动滚动 ↔ Self / Workspace Surface 状态双向同步；
- Approval 命令 → allowlist + Run + stage + nonce → backend executor；
- Evidence Surface ← Verifier / World / Trace / Boundary。

### 仍然分叉

- `ReachScene / CapsuleFlow / ConnectedState` 是旧 ViewMode 路径，功能正向 Workspace stage Surface 迁移；
- 当前主路径已统一为 `SurfaceDestination`；但旧 `ReachScene / CapsuleFlow / ConnectedState` 仍使用 `ViewMode`，需删除双路由；
- Agency Event Stream 已能从 snapshot 派生，但不是所有页面的唯一输入；
- App 与 Routine 已有 Authority Runtime；Compute/File/Device 尚无 Authority Runtime，所以不允许用静态假页补数量。

## 科学布局结论

当前 Spatial Mission Surface 的信息层级比旧三栏正确，但尚不是最终版：

1. 已满足“一次一个当前决定”，审批阶段 DOM 中只有 Approval Surface；
2. Orb 与当前 Surface 的主次成立；任务标题已从 `6.35vw/.82` 收紧到 `4.65vw/.9`，中文换行不再相互碰撞；
3. Evidence 默认收起，不再与当前决定竞争注意力；
4. 390×844 已确认无页面横向溢出，Orb 增加 CSS fallback；sticky rail 仍保留容器内横向滚动；
5. 只有当 20 屏都通过真实数据、转场、可访问性和视觉验收时，才能声称“完整且科学”。
