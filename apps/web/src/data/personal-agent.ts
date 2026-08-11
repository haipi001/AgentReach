export const personalAgentData: Record<string, { title: string; lead: string; items: { label: string; value: string; note?: string }[] }> = {
  IDENTITY: { title: "HAIPI / 个人智能体", lead: "你授权的数字分身，而不是平台拥有的账号。", items: [
    { label: "状态", value: "活跃" }, { label: "模型", value: "兼容 Qwen / GPT" }, { label: "自主等级", value: "二级" }, { label: "委托人", value: "Haipi" },
  ]},
  MEMORY: { title: "记忆", lead: "本地记忆只服务于你，不进入共享信任域。", items: [
    { label: "事实", value: "348", note: "本地" }, { label: "新鲜度", value: "92%" }, { label: "私有", value: "100%" }, { label: "导出", value: "0" },
  ]},
  INTENT: { title: "当前意图", lead: "意图保持私有，只以最小声明对外表达。", items: [
    { label: "进行中", value: "4" }, { label: "主要目标", value: "寻找协作者" }, { label: "信任域", value: "706" }, { label: "可见性", value: "私有" },
  ]},
  SKILLS: { title: "技能", lead: "能力围绕你的智能体生长，权限始终独立审计。", items: [
    { label: "候选发现", value: "v0.1.0", note: "读取网络" }, { label: "上下文胶囊", value: "v0.1.0", note: "需要审批" }, { label: "协作介绍", value: "v0.1.0" }, { label: "独立验证", value: "v0.1.0", note: "只读" },
  ]},
  RELATIONS: { title: "关系", lead: "关系是有方向的私人上下文，不是全球统一分数。", items: [
    { label: "联系人", value: "127" }, { label: "信任域", value: "3" }, { label: "待办协作", value: "6" }, { label: "共享关系图", value: "从不" },
  ]},
  BOUNDARY: { title: "边界", lead: "外发内容必须经过策略、最小披露与人工批准。", items: [
    { label: "状态", value: "正常" }, { label: "自动执行", value: "零级至一级" }, { label: "必须询问", value: "二级至三级" }, { label: "他人记忆", value: "拒绝" },
  ]},
};
