# 20 个核心界面规格

视觉参考：`../reference/agentreach_ui_20_screens_reference.png`

## 01 待机光球 / AI 存在

必须实现：

- 桌面悬浮 Orb；
- 透明背景；
- always-on-top；
- 拖拽；
- 位置持久化；
- 点击展开；
- 全局快捷键唤醒；
- Orb 状态动画；
- 轻量通知卫星点。

## 02 自我空间总览

展示：

- 我的 AI；
- 成长曲线；
- 记忆；
- 关系；
- 意图；
- 最近活动；
- 活跃意图 Top 3。

这不是 Dashboard 首页，而是 Self 的“观察面”。

## 03 我的 AI 面板

展示：

- Personal Agent 身份；
- 记忆数量；
- 意图数量；
- 关系数量；
- 能力数量；
- 学习动作数；
- 当前状态；
- 自主等级；
- 边界状态。

## 04 AI 校准界面

分两部分：

### 外观

- Orb / Ghost / Minimal；
- 材质；
- 信号颜色；
- 光晕；
- 动作强度。

### 行为边界

- 外部风格；
- 是否允许持续观察；
- 默认披露策略；
- 外部联系；
- 主动提醒；
- 低风险自动执行；
- 高风险审批。

## 05 本地世界总览

展示：

- 应用；
- 技能；
- 计算；
- 设备；
- 文件；
- 习惯；
- 本地健康度；
- CPU/GPU/内存/存储。

## 06 应用空间

展示可管理 App 网格或空间节点：

- Chrome
- VS Code
- Excel
- Notion
- 飞书
- Slack
- Mail
- Calendar
- Figma
- Finder / Files
- Terminal

每个 App 显示状态：

- 已连接
- 正在学习
- 能力有限
- 未授权

## 07 应用详情

必须显示：

- App Identity；
- 安装路径 / bundle id；
- 版本；
- 控制平面；
- 已学能力；
- 权限；
- 观察中的 Routine；
- 用户操作风格；
- 当前可行动作；
- 管理权限按钮；
- 教 AI 新操作按钮。

## 08 习惯学习 / 程序学习

展示：

- 正在学习的操作；
- 观察次数；
- 语义步骤；
- 置信度；
- 风险；
- 建议优化；
- “忽略 / 学习 / 准备后询问 / 自动执行”。

Routine 状态：

- 观察中
- 已学习
- 已验证
- 已授权

## 09 技能中心

展示：

- 搜索；
- 分类；
- 已安装 Skill；
- 版本；
- 来源；
- 风险；
- 依赖；
- 使用次数；
- 成功率。

## 10 能力空间

使用 Capability，而非技术组件。

示例：

- 项目管理
- 数据库查询
- 文档处理
- 代码构建
- 云端部署
- 自动化
- 学习
- 沟通

能力成长雷达可以保留，但必须由真实指标驱动。

## 11 计算空间

展示：

- 本地 CPU；
- GPU；
- 内存；
- 本地模型；
- Ollama；
- vLLM；
- 外部模型供应商；
- 当前 Model Router 策略；
- Local / Cloud route；
- 每个 provider 健康状态。

## 12 记忆空间

显示：

- 长期记忆；
- 短期记忆；
- 情景记忆；
- 事实记忆；
- 关系记忆；
- 偏好；
- Procedure Memory；
- Memory health；
- 来源与 Evidence。

## 13 文件与设备空间

文件：

- 最近文件；
- AI 可读范围；
- AI 可写范围；
- 敏感目录；
- Evidence artifacts。

设备：

- Mac；
- Phone；
- iPad；
- 外部显示器；
- 鼠标；
- 本地 GPU 节点；
- NAS 等。

## 14 触达空间

显示第二层网络：

- 公司；
- 人；
- 组织；
- 社区；
- 项目；
- GitHub；
- Slack；
- Jira；
- 外部 Agent；
- Web 服务。

不得显示“全世界图谱”。

只展示与当前 Intent 有关的 Entity。

## 15 实体详情 + 可行动作

统一 Entity Panel：

- 类型；
- 为什么可触达；
- 当前关系；
- Credential；
- 已知事实；
- 当前可行动作；
- 需要审批；
- 不可用动作；
- WHY。

## 16 上下文胶囊 / 授权界面

展示：

- 将共享什么；
- 保持私有什么；
- 接收者；
- Purpose；
- 有效期；
- 允许什么；
- 不允许什么；
- 批准 / 取消。

## 17 行动预览

展示：

- Action Plan；
- 影响；
- 涉及应用；
- 涉及对象；
- 风险；
- 预计时间；
- 回滚；
- 验证器；
- 批准并执行。

## 18 执行中

展示：

- 执行进度；
- Action Chain；
- 实时状态；
- 执行日志；
- Worker；
- MCP / Tool；
- 可暂停；
- 可停止。

不要只显示百分比。

## 19 证据空间 / 世界已改变

展示：

- 世界已改变；
- 数据来源；
- 分析过程；
- 生成文件；
- Agent 活动；
- Trace；
- Evidence；
- 查看完整证据链。

## 20 工作台 + 工程调试 / 演示模式

左侧：

- 我的 AI；
- 当前工作；
- Active Intent；
- 状态。

中间：

- 当前任务；
- Action；
- Approval；
- Workspace。

右侧：

- Evidence；
- Trace；
- AgentTeams 状态。

工程模式标签：

- Agent
- Skill
- MCP
- LLM
- Trace
- Policy
- Evidence

比赛 Demo 可显示：

- Manager
- Intent
- Reach
- Boundary
- Action
- Verifier
