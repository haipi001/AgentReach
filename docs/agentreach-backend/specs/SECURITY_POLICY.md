# Security / Policy / Human Authority

## 1. 核心安全原则

Human Authority > Model Intelligence。

## 2. 三层安全

### Authorization

用户/Agent 有没有这个关系权限。

### Policy

当前上下文下，这个行为是否允许。

### Approval

即使允许，是否需要本人确认。

## 3. Delegation

```yaml
principal: human:haipi

delegate: agent:personal

scope:
  - filesystem.read
  - vscode.execute.lowrisk

requires_approval:
  - github.push
  - external.contact

never:
  - credential.export
  - payment.execute
```

## 4. Disclosure Manifest

所有远程模型和外部系统调用产生：

```text
recipient
purpose
fields_sent
fields_withheld
provider
retention
expiry
```

## 5. Memory Boundary

外部内容：

```text
Assertion
```

不是：

```text
Fact
```

必须经过 provenance + verification。

## 6. Secrets

API key / credential：

- 不进入 LLM context
- 不进入日志
- 不进入 Memory
- 不进入 Skill 文本
- 只通过 Credential Broker / Gateway 使用

## 7. Self Evolution Security

以下为 protected backend zones：

```text
identity authority
credential broker
approval engine
policy kernel
audit
release manager
evolution policy
update verification
```

Evolution Agent 不能自主修改。

## 8. Kill Switch

必须提供：

- pause all actions
- revoke delegation
- offline local-only mode
- disable network gateway
- stop standing intents
