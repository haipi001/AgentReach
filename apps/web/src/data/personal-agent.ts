export const personalAgentData: Record<string, { title: string; lead: string; items: { label: string; value: string; note?: string }[] }> = {
  IDENTITY: { title: "HAIPI / PERSONAL AGENT", lead: "你授权的数字分身，而不是平台拥有的账号。", items: [
    { label: "State", value: "ACTIVE" }, { label: "Model", value: "Qwen / GPT ready" }, { label: "Autonomy", value: "L2" }, { label: "Principal", value: "Haipi" },
  ]},
  MEMORY: { title: "MEMORY", lead: "本地记忆只服务于你，不进入共享 Trust Domain。", items: [
    { label: "Facts", value: "348", note: "local" }, { label: "Freshness", value: "92%" }, { label: "Private", value: "100%" }, { label: "Exports", value: "0" },
  ]},
  INTENT: { title: "ACTIVE INTENT", lead: "意图保持私有，只以最小 Claim 对外表达。", items: [
    { label: "Active", value: "4" }, { label: "Primary", value: "Find collaborators" }, { label: "Domain", value: "706" }, { label: "Visibility", value: "PRIVATE" },
  ]},
  SKILLS: { title: "SKILLS", lead: "能力围绕你的 Agent 生长，权限始终独立审计。", items: [
    { label: "Discovery", value: "v0.1.0", note: "network read" }, { label: "Context Capsule", value: "v0.1.0", note: "approval" }, { label: "Introduction", value: "v0.1.0" }, { label: "Verification", value: "v0.1.0", note: "read only" },
  ]},
  RELATIONS: { title: "RELATIONS", lead: "关系是有方向的私人上下文，不是全球统一分数。", items: [
    { label: "People", value: "127" }, { label: "Trust Domains", value: "3" }, { label: "Open loops", value: "6" }, { label: "Shared graph", value: "NEVER" },
  ]},
  BOUNDARY: { title: "BOUNDARY", lead: "外发内容必须经过策略、最小披露与人工批准。", items: [
    { label: "Status", value: "NORMAL" }, { label: "Auto", value: "L0-L1" }, { label: "Must ask", value: "L2-L3" }, { label: "Peer memory", value: "DENIED" },
  ]},
};
