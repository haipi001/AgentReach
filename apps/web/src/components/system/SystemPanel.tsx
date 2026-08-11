"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { demoApi, memoryApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";
import type { MemorySearchResult } from "@/types/agent";

type SystemTab = "agents" | "skills" | "connectors" | "memory" | "policy";

const TAB_LABELS: { id: SystemTab; label: string }[] = [
  { id: "agents", label: "AGENTS" },
  { id: "skills", label: "SKILLS" },
  { id: "connectors", label: "CONNECTORS" },
  { id: "memory", label: "MEMORY" },
  { id: "policy", label: "POLICY" },
];

export function SystemPanel() {
  const open = useAgentStore((state) => state.systemPanelOpen);
  const setOpen = useAgentStore((state) => state.setSystemPanelOpen);
  const demo = useAgentStore((state) => state.demo);
  const setDemo = useAgentStore((state) => state.setDemo);
  const [tab, setTab] = useState<SystemTab>("agents");
  const [testing, setTesting] = useState(false);
  const [memoryQuery, setMemoryQuery] = useState("");
  const [memories, setMemories] = useState<MemorySearchResult | null>(null);
  const [memoryBusy, setMemoryBusy] = useState(false);
  const [confirmForget, setConfirmForget] = useState<string | null>(null);

  async function testBoundary() {
    if (testing) return;
    setTesting(true);
    try { setDemo(await demoApi.privacyAttack()); }
    finally { setTesting(false); }
  }

  async function searchMemory(query = memoryQuery) {
    setMemoryBusy(true);
    try { setMemories(await memoryApi.search(query)); }
    finally { setMemoryBusy(false); }
  }

  async function chooseTab(nextTab: SystemTab) {
    setTab(nextTab);
    if (nextTab === "memory" && !memories) await searchMemory("");
  }

  async function forget(memoryId: string) {
    if (confirmForget !== memoryId) { setConfirmForget(memoryId); return; }
    setMemoryBusy(true);
    try {
      setMemories(await memoryApi.forget(memoryId));
      setDemo(await demoApi.get());
      setConfirmForget(null);
    } finally { setMemoryBusy(false); }
  }

  return <AnimatePresence>{open && <>
    <motion.button className="system-scrim" aria-label="关闭系统控制面" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
    <motion.aside className="system-panel" aria-label="AgentReach 系统控制面" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
      <header><div><span>AGENTREACH / RUNTIME</span><strong>系统控制面</strong></div><button aria-label="关闭系统控制面" onClick={() => setOpen(false)}>×</button></header>
      <nav aria-label="系统控制面分类">{TAB_LABELS.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => chooseTab(item.id)}>{item.label}</button>)}</nav>

      <div className="system-panel-body">
        {tab === "agents" && <section><div className="system-panel-heading"><span>AGENT RUNTIME</span><b>{demo?.agents.length ?? 0} REGISTERED</b></div><div className="runtime-list">{demo?.agents.map((agent, index) => <article key={agent.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{agent.name}</strong><p>{agent.role}</p></div><aside><i className={agent.status === "ACTIVE" ? "active" : ""}/><b>{agent.status}</b><small>{agent.events} EVENTS</small></aside></article>)}</div></section>}

        {tab === "skills" && <section><div className="system-panel-heading"><span>SKILL REGISTRY</span><b>VERSIONED CONTRACTS</b></div><div className="skill-matrix">{demo?.skills.map((skill) => <article key={skill.id}><header><span>{skill.id}</span><b>v{skill.version}</b></header><p>{skill.description}</p><footer><span>{skill.status}</span><b>{skill.invocations} INVOCATIONS</b></footer></article>)}</div></section>}

        {tab === "connectors" && <section><div className="system-panel-heading"><span>CONNECTOR PLANE</span><b>{demo?.connector_runtime.idempotent ? "IDEMPOTENT" : "UNSAFE"}</b></div><div className="connector-summary"><div><span>RECEIPTS</span><strong>{demo?.connector_runtime.receipts ?? 0}</strong></div><div><span>ENVELOPES</span><strong>{demo?.connector_runtime.mailbox_envelopes ?? 0}</strong></div><div><span>ACTIVE GRANTS</span><strong>{demo?.connector_grants.filter((grant) => grant.status === "ACTIVE").length ?? 0}</strong></div></div><div className="connector-list">{demo?.connector_runtime.connectors.map((connector) => <article key={connector.id}><div><i/><strong>{connector.id}</strong><span>{connector.status} / {connector.mode}</span></div><p>{connector.write_scope}</p></article>)}</div><div className="grant-list"><h3>SCOPED GRANTS</h3>{demo?.connector_grants.length ? demo.connector_grants.map((grant) => <article key={grant.connector}><span>{grant.connector}</span><b>{grant.status}</b><p>{grant.scope}</p></article>) : <p>候选确认后才会生成最小连接器授权。</p>}</div></section>}

        {tab === "memory" && <section><div className="system-panel-heading"><span>LOCAL MEMORY VAULT</span><b>{demo?.memory_runtime.records ?? 0} VERIFIED RECORDS</b></div><div className="memory-properties"><span>{demo?.memory_runtime.storage ?? "LOCAL"}</span><span>{demo?.memory_runtime.verified_only ? "VERIFIED ONLY" : "UNSAFE"}</span><span>{demo?.memory_runtime.survives_task_reset ? "PERSISTENT" : "EPHEMERAL"}</span></div><form className="memory-search" onSubmit={(event) => { event.preventDefault(); searchMemory(); }}><input value={memoryQuery} onChange={(event) => setMemoryQuery(event.target.value)} placeholder="搜索经验、Trace 或类型" aria-label="搜索本地记忆"/><button disabled={memoryBusy}>{memoryBusy ? "检索中" : "检索"}</button></form>{memories?.items.length ? <div className="memory-list">{memories.items.map((memory) => <article key={memory.memory_id}><header><span>{memory.kind}</span><b>VERIFIED</b></header><strong>{memory.summary}</strong><p>{memory.trace_id} · {memory.evidence.length} EVIDENCE</p><footer><span>{memory.memory_id}</span><button onClick={() => forget(memory.memory_id)} disabled={memoryBusy}>{confirmForget === memory.memory_id ? "确认遗忘" : "遗忘"}</button></footer></article>)}</div> : <div className="memory-empty"><strong>{memoryBusy ? "正在读取本地 Memory" : "没有匹配的可信记忆"}</strong><p>只有独立 Verifier 通过的世界变化可以进入这里。</p></div>}</section>}

        {tab === "policy" && <section><div className="system-panel-heading"><span>TRUST POLICY</span><b>FAIL CLOSED</b></div><div className="policy-list">{demo?.privacy_invariants.map((rule, index) => <article key={rule}><span>{String(index + 1).padStart(2, "0")}</span><strong>{rule}</strong><b>ENFORCED</b></article>)}</div><button className="boundary-test" onClick={testBoundary} disabled={testing}><span>{testing ? "RUNNING" : "TEST BOUNDARY"}</span><strong>请求完整私人关系图</strong><b>↗</b></button>{demo?.privacy_denials.at(-1) && <div className="boundary-result"><span>DENIED</span><strong>{demo.privacy_denials.at(-1)?.reason}</strong><p>请求未改变主任务状态，也未泄露私人关系数据。</p></div>}</section>}
      </div>
      <footer><span>TRACE {demo?.trace_id ?? "NONE"}</span><b>{demo?.stage ?? "LOADING"}</b></footer>
    </motion.aside>
  </>}</AnimatePresence>;
}
