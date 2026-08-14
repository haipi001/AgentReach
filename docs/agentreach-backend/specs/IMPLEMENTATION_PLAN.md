# 完整后端开发顺序

这不是多个独立阶段，而是一个完全体依赖顺序。

## Foundation

1. Python / FastAPI / Pydantic
2. Settings
3. Structured logging
4. DB / migrations
5. Event protocol
6. Identity
7. Delegation
8. Audit

## Agency Kernel

9. Intent
10. Context
11. Entity
12. Capability
13. Affordance
14. Planning

## Memory

15. Memory model
16. provenance
17. memory candidate
18. verification
19. vector/FTS derived index

## Local Agency

20. App discovery
21. AIP
22. filesystem adapter
23. shell adapter
24. browser adapter
25. accessibility adapter
26. MCP adapter
27. vision fallback interface

## Model Router

28. provider interface
29. Ollama provider
30. OpenAI-compatible provider
31. route policy
32. disclosure manifest

## Policy / Action

33. Policy engine
34. Approval
35. Action Gateway
36. Verification
37. Evidence
38. Rollback

## Agent Runtime

39. AgentTeams bridge
40. Intent Worker
41. Reach Worker
42. Boundary Worker
43. Action Worker
44. Verifier Worker
45. Skills
46. MCP servers

## Demo Gate

必须跑通：

Human
→ Intent
→ Reach
→ Context Capsule
→ Approval
→ Action Gateway
→ GitHub / Local App
→ Independent Verifier
→ Evidence
→ Memory

同时：

- 5 Worker
- Skill
- MCP
- Trace
- failure branch
- policy denied branch

## Complete Runtime

47. Habit event collector
48. semantic normalizer
49. pattern miner
50. RoutineCandidate
51. Procedure compiler
52. Procedure verifier
53. Capability growth

54. Network gateway
55. Claims
56. Presence
57. Mailbox
58. Trust domains
59. Company / Work / Organization connectors
60. External Agent adapter

61. Nacos registry
62. Skill version / review / release
63. Observability
64. Metrics
65. Standing Intents
66. Event bus
67. Cloud delegate

## Self Evolution

68. evolution event collector
69. failure clustering
70. evolution proposal
71. worktree manager
72. patch generation
73. sandbox
74. test matrix
75. canary
76. signed release
77. rollback
78. Evolution dashboard API

## Complete Definition of Done

系统必须：

- 能在本地运行
- 能使用本地模型
- 能使用外部 API
- 能操作至少多个本地应用
- 能学习 Procedure
- 能生成 Skill
- 能连接 Network Entity
- 能做真实 Action
- 能审批
- 能验证
- 能回滚
- 能沉淀 Evidence
- 能形成 Memory
- 能自我提出改进
- 能隔离测试代码更新
- 能安全发布和回滚
