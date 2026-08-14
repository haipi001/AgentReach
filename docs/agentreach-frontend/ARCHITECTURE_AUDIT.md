# AgentReach 前端架构审计与实施起点

> 审计日期：2026-08-13
> 审计范围：当前仓库、`docs/agentreach-frontend/` 规格包与 20 屏视觉参考
> 本文只确定架构和实施顺序，不在本阶段批量实现页面。

## 1. 结论

当前项目不是需要推倒重写的静态原型。它已经拥有可运行的个人智能体 Golden Loop、持久化任务状态、审批、隐私拒绝、外部行动、独立验证、记忆写回、通知、身份隔离，以及一个可交互的 WebGL Orb。

正确路线是保留后端可信执行边界和现有比赛 Demo，把前端从“页面直接绑定 Zustand 与 API”逐步提升为共享 Kernel：

```text
现有协议与后端事实源
        ↓
Agency Event Stream
        ↓
Universal Domain Model
        ↓
UI Schema + Component Registry
        ↓
Surface Runtime
        ↓
Orb → Halo → Workspace
        ↓
20 个产品 Surface
```

不建议立即把 Next.js 替换成 Vite，也不建议先创建 20 条路由。先在现有 Web Demo 中完成 Kernel 与迁移验证；共享包稳定后，再增加 Tauri 桌面壳和三个原生窗口。

## 2. 当前代码结构分析

### 2.1 运行层

- `apps/api/`：FastAPI + SQLite 的确定性 Agent Runtime，是当前产品事实源。
- `apps/web/`：Next.js 15 App Router、React 19、Motion、Zustand 的单页空间界面。
- `protocol/`：Intent、Claim、Capsule、Introduction、Commitment、Avatar Profile 等 JSON Schema。
- `skills/`：意图、发现、上下文胶囊、握手、发布、验证等技能合同。
- `tests/`：覆盖身份隔离、Golden Loop、持久化任务、Outbox、Worker、审批通知、隐私拒绝和验证边界的后端/API 测试。

### 2.2 当前前端组合方式

`apps/web/src/app/page.tsx` 直接组合主体验与所有覆盖层：

```text
ExperienceFrame
├── IdentityLoadout
├── ProductWorkspace
├── SystemPanel
├── NotificationCenter
├── PersonaStudio
├── ReachScene
├── CapsuleFlow
├── ConnectedState
└── TracePanel
```

业务组件直接读取 `useAgentStore` 并调用 `demoApi`。这使 Demo 可运行，但视图、状态转换、数据读取和命令执行耦合，无法安全地由 Schema 重组。

### 2.3 当前视觉与状态实现

- `AgentCore.tsx` 是自研 WebGL shader Orb，支持指针响应、材质、颜色、场强和 reduced-motion；无需依赖外部 Unicorn 水印或人物素材。
- `AgentStage.tsx` 已把部分运行阶段映射为 Orb 状态，是 Orb Runtime 的雏形。
- `IdentityLoadout.tsx` 已出现“核心 + 关系/参数/技能/记忆/项目/边界小球”的自我宇宙原型。
- `ProductWorkspace.tsx` 已把意图、发现、同意、行动、证据串成可操作任务流。
- `CapsuleFlow.tsx`、`ConnectedState.tsx` 与 `TracePanel.tsx` 已覆盖 BOUNDARY → ACT → VERIFY 的关键展示。

## 3. 可复用组件与迁移角色

| 当前实现 | 可复用价值 | 目标角色 |
|---|---|---|
| `AgentCore` | 高 | `packages/agent-orb` 的渲染器核心 |
| `AgentStage` | 高 | Agency Event → Orb State 适配器 |
| `IdentityLoadout` | 中高 | Halo / SELF Surface 原型，拆出通用节点与关系 |
| `ProductWorkspace` | 高 | Workspace Runtime 的 Golden Loop 首个 Surface |
| `ReachScene` | 中高 | Entity Graph / REACH Surface |
| `CapsuleFlow` | 高 | Protected Approval / Disclosure Surface |
| `ConnectedState` | 高 | Evidence / World Changed Surface |
| `TracePanel` | 高 | Evidence Timeline / Engineering Trace |
| `NotificationCenter` | 高 | Approval Inbox / Result Inbox |
| `SystemPanel` | 中 | 工程与恢复能力数据源，需拆为多个 Surface |
| `PersonaStudio` | 中高 | Orb Calibration Surface；名称应脱离人物概念 |
| `ExperienceFrame` | 中 | App Shell；需要让位于 Surface Host |
| `agent-store` | 中 | 保留会话/偏好 slice；业务状态改由事件与查询驱动 |
| `lib/api.ts` | 高 | Transport Adapter；外层增加 Query/Command 接口 |
| `types/agent.ts` | 高 | 迁移为共享 domain/protocol types 的输入 |

## 4. 与目标架构的主要差距

1. **没有桌面三窗口运行时**：目前只有浏览器页面，没有 Tauri 的 `orb-window`、`halo-window`、`workspace-window`。
2. **没有 Agency Event Stream**：后端已有 Trace 和阶段事实，但前端没有统一语义事件总线、重放和订阅边界。
3. **没有通用领域模型**：现有 `DemoState` 很完整，但 Entity、Capability、Affordance、Action、Approval、Evidence 仍未成为稳定前端合同。
4. **没有 UI Schema Runtime**：包内 Schema 只是起点，尚不能表达数据绑定、动作、权限、回退、可访问性和版本迁移。
5. **没有 Component Registry**：组件没有 manifest、风险级别、允许 Surface、输入 Schema 和受保护标记。
6. **没有 Surface Runtime**：界面由 `page.tsx` 和条件渲染决定，不能通过合法 Schema 组合。
7. **状态机不足**：Golden Loop 在后端严格，前端仍以字符串阶段和局部条件分支为主；复杂审批/行动流尚无 XState 或等价显式状态机。
8. **远程状态治理不足**：没有 TanStack Query；请求缓存、失效、重试和命令结果同步由组件手写。
9. **保护模块没有代码级隔离**：审批、Disclosure、Credential、Security、Evolution 等边界尚未通过 registry policy 和独立包禁止自演化。
10. **自我进化流水线未实现**：没有 Schema patch 审计、Evolution Proposal、worktree runner、隔离预览、视觉回归与回滚清单。
11. **测试金字塔缺口**：后端测试较强；前端只有脚本式 E2E/截图检查，缺少 Vitest、RTL、Schema contract、a11y 与稳定视觉回归。
12. **设计语言尚未统一**：现有首页 Orb 可复用，但历史暗色/荧光与多套布局并存；需收敛到科技白主体验，深色仅用于工程 Surface。

## 5. 目标目录结构

```text
apps/
├── api/                         # 保留：可信事实源与执行边界
├── web/                         # 保留：比赛 Demo 与 Kernel 首个宿主
└── desktop/                     # 第二阶段新增：Tauri 2 三窗口宿主
    ├── src-tauri/
    └── src/windows/
        ├── orb/
        ├── halo/
        └── workspace/

packages/
├── design-system/               # tokens、基础组件、动效与可访问性
├── agency-events/               # 语义事件、适配器、重放与订阅
├── domain-model/                # Entity / Capability / Affordance 等
├── ui-schema/                   # Schema、解析、验证、迁移、patch
├── component-registry/          # manifest、allowlist、保护策略
├── surface-runtime/             # Schema → React Surface
├── agent-orb/                   # WebGL Orb、状态映射、性能回退
├── halo-runtime/                # 空间节点、边、聚焦、层级展开
├── workspace-runtime/           # 任务、审批、执行、证据工作面
├── protected-surfaces/          # Approval/Disclosure/Credential/Security
└── test-contracts/              # schema/a11y/visual/evolution gates

surfaces/
├── self/
├── local/
├── reach/
├── action/
├── evidence/
└── engineering/

evolution/
├── policies/
├── proposals/
├── previews/
└── releases/
```

`apps/web` 暂时继续作为宿主，避免在 Kernel 未稳定时同时承担框架迁移风险。共享包不引用 Next.js API，以便之后被 Tauri/Vite 直接复用。

## 6. 连续实施顺序

### Gate 0 — 宪法与合同

- 固化体验原则、保护模块、领域术语和事件命名。
- 扩展 UI Schema/Manifest，使其能表达数据、事件、权限、回退和版本。
- 为每个合同先写验证测试。

### Gate 1 — Design System + Agency Events

- 建立科技白 token 与基础无障碍组件。
- 把后端 `stage`、`trace`、`notifications`、`runtime` 转成语义事件。
- 保持 API 和现有页面行为不变，先提供旁路适配器与事件日志。

### Gate 2 — Registry + Surface Runtime

- 注册第一批通用组件。
- 实现 Schema 验证、组件解析、保护策略、未知组件回退和错误 Surface。
- 用 01 待机 Orb 和 17 行动预览作为最小垂直切片。

### Gate 3 — Orb → Halo → Workspace

- 把 `AgentCore` 提取为独立 Orb Runtime。
- 把 `IdentityLoadout` 重组为 Halo 的 SELF Surface。
- 把 `ProductWorkspace` 迁移为 Workspace Surface，保留现有 Golden Loop。

### Gate 4 — 比赛 Demo Gate

- 完成 01、03、14、16、17、18、19、20 的真实数据闭环。
- 建立 Approval、Evidence、Trace 的保护边界和端到端验收。
- 其余界面先使用同一 Kernel 生成，不创建孤立页面。

### Gate 5 — Tauri Desktop

- 增加三窗口、置顶、透明、拖拽、点击穿透、窗口间事件同步和系统托盘。
- 浏览器版继续作为降级与评审入口。

### Gate 6 — L0–L3 Evolution

- 先启用 L0/L1 Schema 适配，再启用经审计的 L2 组件重组。
- L3 必须经过 proposal → worktree → checks → preview → human approval → release → rollback。

## 7. 第一批修改与创建文件

第一批只完成 Gate 0–1，不动 20 屏布局：

### 创建

```text
packages/domain-model/src/index.ts
packages/agency-events/src/events.ts
packages/agency-events/src/from-demo-state.ts
packages/ui-schema/src/ui-surface.schema.json
packages/ui-schema/src/types.ts
packages/ui-schema/src/validate.ts
packages/component-registry/src/manifest.schema.json
packages/component-registry/src/registry.ts
packages/design-system/src/tokens.css
packages/test-contracts/src/schema-contracts.test.ts
```

### 修改

```text
apps/web/package.json                         # workspace 依赖与测试工具
apps/web/src/types/agent.ts                  # 逐步引用共享领域类型
apps/web/src/stores/agent-store.ts           # 分离偏好/UI session 与业务事实
apps/web/src/lib/api.ts                      # 增加 query/command adapter 边界
apps/web/src/app/page.tsx                    # 后续接入 Surface Host，当前不重写
```

## 8. 第一垂直切片的验收标准

第一批代码完成时，应满足：

1. 当前 Golden Loop、Orb 与全部 API 行为不回归。
2. `DemoState` 能确定性转换为语义 Agency Events。
3. 无效 UI Schema、未知组件、越权 Surface 和受保护组件修改全部 fail closed。
4. Orb 可从事件派生 `idle / thinking / searching / waiting-approval / connected / error`，不依赖页面手工设置。
5. 至少一个 Schema Surface 在现有 Next.js 中真实渲染，并有非空间 DOM 回退。
6. lint、typecheck、unit、现有后端测试和 E2E 均通过。

## 9. 本阶段明确不做

- 不复制 20 张静态页面。
- 不删除现有 Next.js Web Demo。
- 不在 Kernel 稳定前引入 Tauri 多窗口复杂度。
- 不让 Schema 直接调用任意函数或任意 API。
- 不允许 Evolution Engine 修改 Approval、Disclosure、Credential、Security、Update、Audit 自身。
- 不把深色赛博朋克 HUD 当作主设计系统。
