# Local Agency

## 1. 目标

让 Personal AI 成为用户本地数字世界的可治理操作层。

Local Agency 包括：

- 本地应用
- 浏览器
- 文件
- 设备
- 本地模型
- 本地 GPU
- Shell
- Native API
- Accessibility
- MCP
- Learned Procedures

## 2. 应用控制优先级

永远优先结构化控制面：

```text
1 Native API / SDK
2 CLI / Shell
3 MCP Connector
4 DOM / Browser Automation
5 OS Accessibility
6 Vision GUI fallback
```

不得让视觉点击成为默认执行路径。

## 3. Local Action Gateway

统一接口：

```python
discover()
inspect()
prepare()
execute()
verify()
rollback()
```

Adapter 类型：

- filesystem
- shell
- native
- mcp
- browser
- accessibility
- vision

## 4. App Entity

每个应用统一为 Application Entity：

```yaml
id: app:vscode
bundle_id: com.microsoft.VSCode
name: Visual Studio Code
version: ...
running: true

control_surfaces:
  - cli
  - accessibility
  - extension
  - vision
```

## 5. Local Permission

至少：

- observe
- read
- prepare
- act
- represent

示例：

```yaml
vscode:
  read: allow
  type: allow
  run_command: allow
  commit: ask
  push: ask
  destructive_delete: deny
```

## 6. App Learning

Local Agency 必须支持：

- 收集语义操作事件
- 找出重复模式
- 生成 RoutineCandidate
- 让用户确认
- 生成 Procedure
- 测试
- 验证
- 注册为 Capability

不得因“重复发生”自动获得更高权限。
