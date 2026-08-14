# 前端自我迭代 / 自我复写设计

## 1. 目标

AgentReach UI 可以随着用户和 Personal AI 的长期关系改变，但必须：

- 可解释；
- 可测试；
- 可预览；
- 可版本化；
- 可回滚；
- 不破坏 Human Authority。

## 2. Evolution Levels

### L0 内容适配

可自动：

- 排序；
- 推荐内容；
- 当前 Intent 提升；
- 不常用内容弱化。

### L1 布局适配

可自动或轻审批：

- 面板位置；
- Orbit 权重；
- 默认展开；
- 信息密度。

### L2 组件重组

AI 用 Component Registry 组合新的 Surface。

示例：

Developer Surface：

- Orb
- Active Intent
- VS Code
- GitHub
- Current Branch
- Tests
- Pending Approval

必须支持 Preview / Try / Adopt / Rollback。

### L3 Code Evolution

必须：

1. 创建独立 Git worktree；
2. 创建 evolution branch；
3. 生成 patch；
4. lint；
5. typecheck；
6. unit test；
7. Playwright；
8. visual diff；
9. build；
10. isolated preview；
11. human review；
12. merge/reject；
13. release；
14. rollback。

禁止直接修改 active production checkout。

## 3. UX Memory

只记录语义事件，不记录无意义指针轨迹。

例如：

```json
{
  "surface": "orb",
  "action": "open",
  "destination": "active-intent",
  "context": "coding",
  "result": "success"
}
```

## 4. Evolution Proposal

每个提案必须包含：

- Observation
- Evidence
- Problem
- Proposed Change
- Expected Benefit
- Affected Surface
- Risk
- Protected Components Touched
- Test Plan
- Rollback Plan

## 5. UI Constitution

Evolution Agent 永远不得修改：

- Human is center
- AI is extension
- Private first
- Boundary visible
- High-risk requires consent
- Evidence before memory
- Every adaptation explainable
- Every evolution reversible

## 6. Protected Modules

- authentication
- approval
- disclosure
- credential
- policy core
- update engine
- evolution engine
- audit

AI 不能修改“决定它能否修改自己的规则”的代码。
