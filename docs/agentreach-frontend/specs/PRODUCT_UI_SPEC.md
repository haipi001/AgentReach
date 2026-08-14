# AgentReach 产品 UI 规格

## 1. 产品定位

AgentReach 是 Human–AI Agency OS 的前端界面。

前端的目标不是“展示 Agent 信息”，而是让用户感知：

- AI 持续存在；
- AI 正在理解我；
- AI 可以操作我的本地数字世界；
- AI 可以把我的作用范围延伸到外部网络；
- AI 的每次行动都能解释、审批、验证和回滚；
- AI 与界面本身会随着长期使用成长。

## 2. 两层世界

### 第一层：本地 Agency

围绕“我 + 我的 AI”：

- 记忆
- 意图
- 应用
- 技能
- 文件
- 设备
- 本地算力
- 模型
- 使用习惯
- 学到的操作程序
- 权限与边界

核心问题：

> 我和 AI 在我的本地数字世界中已经能做什么？

### 第二层：网络 Agency

从本地边界向外：

- 人
- 公司
- 工作
- 组织
- 社区
- 项目
- 其他 Agent
- 服务
- Web
- 市场
- 云资源

核心问题：

> 我和 AI 现在可以触达到谁/什么，并可以做什么？

## 3. 统一交互循环

所有重要交互都应映射到：

SELF
→ LOAD
→ REACH
→ INSPECT
→ ACT
→ VERIFY
→ REMEMBER

## 4. 桌面三层 Surface

### Presence Orb

- 小尺寸透明置顶窗口；
- AI 的持续存在；
- 显示 Agent 状态；
- 点击后进入 Halo；
- 全局快捷键可唤醒；
- 可拖拽并记忆位置。

### Halo / Spatial Surface

- 透明空间窗口；
- 展示 Self、本地世界、Reach、轻量 Action、Approval；
- 以光球为中心；
- 通过语义缩放展开，而不是传统导航跳页。

### Workspace

- 正常桌面窗口；
- 深度任务；
- Memory；
- Skill / App 管理；
- Evolution；
- Engineering / Trace。

## 5. Orb 状态

- 空闲
- 倾听
- 思考
- 学习
- 规划
- 搜索
- 触达
- 等待审批
- 执行
- 验证
- 反思
- 完成
- 阻塞

禁止用普通 loading spinner 代替 Agent 状态。

## 6. 本地应用学习

App 页面必须展示：

- 应用身份；
- 当前是否运行；
- 可控制方式：Native / CLI / MCP / Browser / Accessibility / Vision fallback；
- 已学会的操作；
- 观察中的操作模式；
- 用户在该 App 中的操作偏好；
- AI 被允许的权限；
- 当前可行动作（Affordances）。

必须存在“教 AI 一个新操作”的入口。

学习流程：

观察
→ 理解
→ 生成 Procedure
→ 用户审阅
→ 测试
→ 验证
→ 授权
→ Capability

## 7. Capability

用户看到的是“能力”，而不是 Skill/MCP/模型技术细节。

Capability 可以由以下组件组合：

- Skill
- Connector
- Agent
- Model
- Credential
- Workflow
- Verifier

Capability Detail 才展开技术来源。

## 8. Entity / Affordance

本地与外部对象统一使用 Entity：

- Application
- File
- Device
- Person
- Agent
- Organization
- Project
- Repository
- Service
- WebResource

任何 Entity 页面都以这一问题为中心：

> 我和 AI 现在能在这里做什么？

Affordance 由：

Entity
× Capability
× Credential
× Relationship
× Policy
× Intent

计算而来。

## 9. Boundary

任何内容从本地发送到外部，都需要清晰显示：

- 将发送什么；
- 不发送什么；
- 发送给谁；
- 用于什么目的；
- 使用哪个外部服务/模型；
- 保留多久；
- 是否允许转发；
- 用户是否需要批准。

## 10. Action

行动前必须显示：

- 动作；
- 目标；
- 执行者；
- 工具；
- 权限；
- 风险；
- 审批；
- 回滚；
- 验证方式。

高风险动作必须使用独立 Approval Surface。

## 11. Evidence

禁止只显示“成功”。

成功页面使用：

“世界已改变”

并显示：

- 行动；
- 目标；
- 结果；
- 验证者；
- Evidence；
- 时间；
- 回滚状态。

完成后 Evidence 视觉上返回 Orb，进入 Memory Reflection。

## 12. Memory

Memory UI 必须显示：

- 来源；
- 时间；
- 置信度；
- 有效期；
- Evidence；
- 敏感级别。

提供：

- 为什么；
- 纠正；
- 忘记。

## 13. 自我进化

前端允许：

L0 内容适配
L1 布局适配
L2 组件重组
L3 代码级进化

L0-L2 优先使用 Schema Patch。

L3 必须进入：

worktree
→ branch
→ patch
→ lint
→ typecheck
→ tests
→ visual diff
→ preview
→ human review
→ release
→ rollback

## 14. Protected UI

以下区域不可被 Evolution Agent 自动修改：

- authentication
- approval logic
- disclosure
- credentials
- policy core
- update engine
- evolution engine
- audit

## 15. 视觉原则

风格名称：

Editorial Ghost Computing

主色：

- 科技白
- 雾灰
- 瓷白
- 哑黑
- 淡薄荷绿信号
- 审批用暖金
- 阻塞少量红色

禁止：

- 赛博朋克
- 游戏 HUD
- 黑客终端风
- 通用 SaaS Dashboard
- 卡通宠物
- 机器人吉祥物

AI 应该是一种持续存在的数字实体，而不是聊天头像。
