# Memory / Habit / AIP

## 1. 五类 Memory

### Episodic

发生过什么。

### Semantic

关于用户和世界的事实。

### Relational

用户与人、公司、项目、Agent、服务之间的关系。

### Preference

用户偏好的做法。

### Procedural

用户是如何完成某类任务的。

## 2. Memory 基础字段

每条 Memory 必须有：

```text
id
type
content
source
provenance
timestamp
confidence
validity
sensitivity
status
evidence_refs
```

外部数据先进入：

```text
InboundAssertion
→ MemoryCandidate
→ Validation
→ TrustedMemory
```

不得直接：

```text
External Agent → TrustedMemory
```

## 3. Habit Engine

Pipeline：

```text
InteractionEvent
→ Semantic Normalization
→ Trace Segmentation
→ Pattern Detection
→ RoutineCandidate
→ Procedure Synthesis
→ User Review
→ Sandbox Test
→ Verification
→ Capability
```

## 4. Interaction Event

优先记录语义：

```json
{
  "app": "VSCode",
  "operation": "run_tests",
  "target": "agentreach",
  "result": "passed"
}
```

不要优先记录：

```json
{
  "x": 832,
  "y": 641,
  "click": true
}
```

## 5. Routine 状态

- observed
- learned
- verified
- authorized
- deprecated

## 6. Application Interaction Profile

AIP = Personal AI 对某个 App 的可执行长期理解。

示例：

```yaml
aip_version: 1

application:
  id: app:vscode
  name: Visual Studio Code

control_planes:
  preferred:
    - cli
    - extension
    - accessibility
  fallback:
    - vision

procedures:
  - id: run_agentreach_tests
    label: 运行 AgentReach 测试

    execute:
      adapter: shell
      command: make test

    verify:
      type: exit_code
      expected: 0

    risk: low
```

## 7. Procedure Versioning

任何 Learned Procedure 必须：

- version
- source traces
- observed_count
- test results
- user approval
- policy
- rollback
- deprecation state

AI 不得静默覆盖已有 Procedure。

只能提出新版本。
