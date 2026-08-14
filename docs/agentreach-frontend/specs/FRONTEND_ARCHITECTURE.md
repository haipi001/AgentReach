# 前端技术架构

## 1. Monorepo

```text
apps/
  desktop/
    src/
      orb/
      halo/
      workspace/
    src-tauri/

  web/

packages/
  design-system/
  agent-orb/
  spatial-runtime/
  surface-runtime/
  ui-schema/
  component-registry/
  agency-events/
  agency-state/
  evolution-engine/
  preview-sandbox/
  protocol/
  accessibility/
  telemetry/
  test-kit/

protected/
  approval/
  disclosure/
  credentials/
  security/
  update-engine/
  evolution-engine/
```

## 2. Desktop Windows

### orb-window

- 120–160px；
- transparent；
- decorations false；
- always-on-top；
- persistent；
- 可拖动；
- 支持位置持久化。

### halo-window

- 透明；
- 约 900×650；
- 默认隐藏；
- 从 Orb 动画展开；
- Self / Local / Reach / Action / Approval。

### workspace-window

- 标准桌面窗口；
- 深度工作；
- Memory；
- Skill 管理；
- Evolution；
- Engineering。

## 3. React Architecture

```text
App
 ├─ AgencyEventProvider
 ├─ SurfaceRuntime
 │   ├─ OrbSurface
 │   ├─ HaloSurface
 │   └─ WorkspaceSurface
 ├─ EvolutionProvider
 └─ DebugProvider
```

## 4. State

### Zustand

用于：

- UI preferences
- current surface
- personal layout
- temporary selections

### XState

用于：

- Orb state machine
- Action lifecycle
- Approval lifecycle
- Evolution release lifecycle

### TanStack Query

用于：

- 后端数据；
- Entity；
- Memory；
- Skill；
- Action；
- Evidence。

## 5. Agency Event Stream

统一事件：

- agent.state.changed
- intent.created
- intent.updated
- memory.updated
- capability.loaded
- capability.unloaded
- entity.discovered
- entity.updated
- affordance.changed
- approval.required
- approval.resolved
- action.started
- action.progress
- action.completed
- verification.started
- verification.passed
- verification.failed
- evidence.created
- skill.learned
- interface.proposal.created
- interface.updated

UI 不应由大量组件各自轮询后端驱动。

## 6. Schema-driven UI

建立：

- UISurfaceSchema
- UIComponentManifest
- UIDataBinding
- UILayoutRule
- UIVisibilityRule
- UIActionBinding

L0-L2 个性化主要修改 Schema，不修改源码。

## 7. Component Registry

基础组件：

- AgentOrb
- Orbit
- EntityNode
- EntityPanel
- CapabilityNode
- CapabilityPanel
- IntentNode
- MemoryNode
- AffordanceList
- ActionPreview
- ActionProgress
- ContextCapsule
- ApprovalSurface
- EvidencePanel
- Timeline
- TracePanel
- Gate
- Signal
- Workspace

严禁创建业务专属组件：

- AliceCard
- GithubCard
- CompanyACard

统一使用 Entity。

## 8. WebGL / DOM 分工

### WebGL

- Orb
- spatial node
- orbit
- signal line
- background particle
- camera animation

### DOM Overlay

- 文字
- 表单
- 详情
- 权限
- Evidence
- Approval
- 工程指标

关键文字禁止只存在于 WebGL。

## 9. 测试

- Vitest
- React Testing Library
- Playwright
- Screenshot visual regression
- accessibility tests
- state-machine tests
- schema validation tests
