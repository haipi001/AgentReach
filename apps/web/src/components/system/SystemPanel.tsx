"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { demoApi, identityApi, memoryApi, readOperationalMetrics } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";
import type { MemorySearchResult, OperationalMetrics } from "@/types/agent";

type SystemTab = "owner" | "observe" | "runs" | "agents" | "skills" | "connectors" | "memory" | "policy";

const TAB_LABELS: { id: SystemTab; label: string }[] = [
  { id: "owner", label: "OWNER" },
  { id: "observe", label: "OBSERVE" },
  { id: "runs", label: "RUNS" },
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
  const setView = useAgentStore((state) => state.setView);
  const setPersona = useAgentStore((state) => state.setPersona);
  const [tab, setTab] = useState<SystemTab>("runs");
  const [testing, setTesting] = useState(false);
  const [memoryQuery, setMemoryQuery] = useState("");
  const [memories, setMemories] = useState<MemorySearchResult | null>(null);
  const [memoryBusy, setMemoryBusy] = useState(false);
  const [confirmForget, setConfirmForget] = useState<string | null>(null);
  const [runtimeBusy, setRuntimeBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [connectorBusy, setConnectorBusy] = useState<string | null>(null);
  const [confirmConnector, setConfirmConnector] = useState<string | null>(null);
  const [jobBusy, setJobBusy] = useState<string | null>(null);
  const [outboxBusy, setOutboxBusy] = useState<string | null>(null);
  const [identityBusy, setIdentityBusy] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [identityError, setIdentityError] = useState("");
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [metricsBusy, setMetricsBusy] = useState(false);

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
    if (nextTab === "observe" && !metrics) await refreshMetrics();
  }

  async function refreshMetrics() {
    if (metricsBusy) return;
    setMetricsBusy(true);
    try { setMetrics(await readOperationalMetrics()); }
    finally { setMetricsBusy(false); }
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

  async function controlRun(action: "pause" | "resume" | "cancel" | "retry") {
    if (runtimeBusy) return;
    if (action === "cancel" && !confirmCancel) { setConfirmCancel(true); return; }
    setRuntimeBusy(true);
    try {
      const next = action === "pause" ? await demoApi.pauseRun()
        : action === "resume" ? await demoApi.resumeRun()
        : action === "cancel" ? await demoApi.cancelRun()
        : await demoApi.retryRun();
      setDemo(next);
      setConfirmCancel(false);
    } finally { setRuntimeBusy(false); }
  }

  async function switchRun(runId: string) {
    if (runtimeBusy) return;
    setRuntimeBusy(true);
    try {
      const next = await demoApi.switchRun(runId);
      setDemo(next);
      if (["WAITING_USER_APPROVAL", "WAITING_PEER_APPROVAL", "COMMITMENT_PROPOSED", "WAITING_ACTION_EXECUTION", "WAITING_VERIFICATION"].includes(next.stage)) setView("capsule");
      else if (["COMPLETED", "PEER_REJECTED", "FAILED"].includes(next.stage)) setView("connected");
      else setView("self");
    } finally { setRuntimeBusy(false); }
  }

  async function checkConnector(connectorId: string) {
    if (connectorBusy) return;
    setConnectorBusy(connectorId);
    try { setDemo(await demoApi.checkConnector(connectorId)); }
    finally { setConnectorBusy(null); }
  }

  async function toggleConnector(connectorId: string, enabled: boolean) {
    if (connectorBusy) return;
    if (!enabled && confirmConnector !== `toggle:${connectorId}`) { setConfirmConnector(`toggle:${connectorId}`); return; }
    setConnectorBusy(connectorId);
    try { setDemo(await demoApi.toggleConnector(connectorId, enabled)); setConfirmConnector(null); }
    finally { setConnectorBusy(null); }
  }

  async function revokeGrant(connectorId: string) {
    if (connectorBusy) return;
    if (confirmConnector !== `grant:${connectorId}`) { setConfirmConnector(`grant:${connectorId}`); return; }
    setConnectorBusy(connectorId);
    try { setDemo(await demoApi.revokeConnectorGrant(connectorId)); setConfirmConnector(null); }
    finally { setConnectorBusy(null); }
  }

  async function processNextJob() {
    if (jobBusy) return;
    setJobBusy("next");
    try { setDemo(await demoApi.processNextJob()); }
    finally { setJobBusy(null); }
  }

  async function retryJob(jobId: string) {
    if (jobBusy) return;
    setJobBusy(jobId);
    try { setDemo(await demoApi.retryJob(jobId)); }
    finally { setJobBusy(null); }
  }

  async function retryOutbox(outboxId: string) {
    if (outboxBusy) return;
    setOutboxBusy(outboxId);
    try { setDemo(await demoApi.retryOutbox(outboxId)); }
    finally { setOutboxBusy(null); }
  }

  async function switchIdentity(profileId: string) {
    if (identityBusy || profileId === demo?.identity_runtime?.active_profile_id) return;
    setIdentityBusy(true); setIdentityError("");
    try {
      const next = await identityApi.switch(profileId);
      setDemo(next);
      const profile = next.identity_runtime?.profiles.find((item) => item.active);
      if (profile) setPersona({ name: profile.agent_name });
      setView("identity");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) { setIdentityError(error instanceof Error ? error.message : "身份切换失败"); }
    finally { setIdentityBusy(false); }
  }

  async function createIdentity() {
    if (identityBusy) return;
    setIdentityBusy(true); setIdentityError("");
    try {
      const runtime = await identityApi.create(ownerName, agentName);
      const next = await demoApi.get();
      setDemo(next);
      const profile = runtime.profiles.find((item) => item.active);
      if (profile) setPersona({ name: profile.agent_name });
      setOwnerName(""); setAgentName("");
    } catch (error) { setIdentityError(error instanceof Error ? error.message : "身份创建失败"); }
    finally { setIdentityBusy(false); }
  }

  return <AnimatePresence>{open && <>
    <motion.button className="system-scrim" aria-label="关闭系统控制面" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
    <motion.aside className="system-panel" aria-label="AgentReach 系统控制面" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
      <header><div><span>AGENTREACH / RUNTIME</span><strong>系统控制面</strong></div><button aria-label="关闭系统控制面" onClick={() => setOpen(false)}>×</button></header>
      <nav aria-label="系统控制面分类">{TAB_LABELS.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => chooseTab(item.id)}>{item.label}</button>)}</nav>

      <div className="system-panel-body">
        {tab === "owner" && <section><div className="system-panel-heading"><span>LOCAL OWNER SESSION</span><b>{demo?.identity_runtime?.local_only ? "LOCAL ONLY" : "UNAVAILABLE"}</b></div><div className="owner-session"><span>ACTIVE SESSION</span><strong>{demo?.identity_runtime?.session_id ?? "LEGACY SESSION"}</strong><p>每个本地身份拥有独立的任务、Memory、Skill、Connector 和 Inbox 数据库。</p></div><div className="owner-profiles">{demo?.identity_runtime?.profiles.map((profile) => <article key={profile.profile_id} className={profile.active ? "active" : ""}><i/><div><strong>{profile.display_name}</strong><p>{profile.agent_name} / PERSONAL AGENT</p></div><small>{profile.active ? "CURRENT" : profile.profile_id}</small>{!profile.active && <button onClick={() => switchIdentity(profile.profile_id)} disabled={identityBusy}>切换</button>}</article>)}</div>{(demo?.identity_runtime?.profiles.length ?? 0) < 5 && <form className="owner-create" onSubmit={(event) => { event.preventDefault(); createIdentity(); }}><span>CREATE ISOLATED IDENTITY</span><input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="所有者名称" maxLength={40}/><input value={agentName} onChange={(event) => setAgentName(event.target.value)} placeholder="AI 名称" maxLength={40}/><button disabled={identityBusy || !ownerName.trim() || !agentName.trim()}>{identityBusy ? "创建中" : "创建本地身份"}</button></form>}{identityError && <p className="owner-error">{identityError}</p>}</section>}

        {tab === "observe" && <section className="observe-panel"><div className="system-panel-heading"><span>OPERATIONAL HEALTH</span><b className={metrics?.health.toLowerCase()}>{metricsBusy ? "REFRESHING" : metrics?.health ?? "LOADING"}</b></div>{metrics && <><div className={`health-hero ${metrics.health.toLowerCase()}`}><div><span>ACTIVE OWNER HEALTH</span><strong>{metrics.health}</strong><p>{metrics.runs.total} RUNS · {metrics.workers.total} JOBS · {metrics.actions.total} ACTIONS</p></div><button onClick={refreshMetrics} disabled={metricsBusy}>刷新状态</button></div><div className="metric-grid"><article><span>RUN SUCCESS</span><strong>{metrics.runs.success_rate}%</strong><p>{metrics.runs.completed} completed · {metrics.runs.failed} failed · {metrics.runs.cancelled} cancelled</p></article><article><span>QUEUE DEPTH</span><strong>{metrics.workers.pending + metrics.workers.running}</strong><p>{metrics.workers.failed} failed jobs</p></article><article><span>ACTION RECEIPTS</span><strong>{metrics.actions.receipts}</strong><p>{metrics.actions.succeeded} outbox succeeded · {metrics.actions.failed} unresolved</p></article><article><span>CONNECTORS</span><strong>{metrics.connectors.healthy}/{metrics.connectors.enabled}</strong><p>{metrics.connectors.degraded} degraded</p></article><article><span>MEMORY</span><strong>{metrics.memory_records}</strong><p>verified records</p></article><article><span>RECOVERIES</span><strong>{metrics.recovery_events}</strong><p>{metrics.unread_notifications} unread signals</p></article></div><div className="incident-list"><h3>RECENT UNRESOLVED INCIDENTS <b>{metrics.incidents.length}</b></h3>{metrics.incidents.length ? metrics.incidents.map((incident) => <article key={`${incident.source}:${incident.item_id}`}><span>{incident.source}</span><div><strong>{incident.operation}</strong><p>{incident.error || "unknown failure"}</p></div><small>{incident.item_id}</small></article>) : <div className="incident-empty"><i>✓</i><strong>没有未解决的运行故障</strong><p>Worker Queue 与 Action Outbox 当前均无 FAILED 项。</p></div>}</div></>}</section>}

        {tab === "runs" && <section><div className="system-panel-heading"><span>MULTI-TASK RUNTIME</span><b>{demo?.runtime.status ?? "LOADING"}</b></div>{demo?.runtime && <><div className="run-hero"><div><span>CURRENT WORKSPACE</span><strong>{demo.human_request || "尚未输入任务"}</strong><p>{demo.stage} · ATTEMPT {demo.runtime.attempt} · {demo.runtime.run_id}</p></div><i className={demo.runtime.status.toLowerCase()}>{demo.runtime.status}</i></div><div className="run-controls"><button onClick={() => controlRun("pause")} disabled={runtimeBusy || !demo.runtime.controls.can_pause}>暂停</button><button onClick={() => controlRun("resume")} disabled={runtimeBusy || !demo.runtime.controls.can_resume}>恢复</button><button onClick={() => controlRun("cancel")} disabled={runtimeBusy || !demo.runtime.controls.can_cancel}>{confirmCancel ? "确认取消" : "取消"}</button><button onClick={() => controlRun("retry")} disabled={runtimeBusy || !demo.runtime.controls.can_retry}>重试</button></div><div className="run-history"><h3>任务工作区 <b>{demo.runtime.history.length}</b></h3>{demo.runtime.history.map((run) => { const terminal = ["COMPLETED", "CANCELLED", "FAILED", "SUPERSEDED"].includes(run.status); return <article key={run.run_id} className={run.run_id === demo.runtime.run_id ? "current" : ""}><span>{run.status}</span><div><strong>{run.human_request || "未命名任务"}</strong><p>{run.stage} · ATTEMPT {run.attempt}</p></div><small>{run.run_id}</small>{run.run_id !== demo.runtime.run_id && <button onClick={() => switchRun(run.run_id)} disabled={runtimeBusy || !run.recoverable}>{terminal ? "查看" : "切换"}</button>}</article>; })}</div></>}</section>}

        {tab === "agents" && <section><div className="system-panel-heading"><span>WORKER RUNTIME</span><b>{demo?.worker_queue.durable ? "DURABLE QUEUE" : "EPHEMERAL"}</b></div><div className="queue-summary"><div><span>PENDING</span><strong>{demo?.worker_queue.pending ?? 0}</strong></div><div><span>RUNNING</span><strong>{demo?.worker_queue.running ?? 0}</strong></div><div><span>FAILED</span><strong>{demo?.worker_queue.failed ?? 0}</strong></div><div><span>SUCCEEDED</span><strong>{demo?.worker_queue.succeeded ?? 0}</strong></div></div><div className="worker-jobs"><header><span>JOB QUEUE / {demo?.worker_queue.claim_mode ?? "OFFLINE"}</span><button onClick={processNextJob} disabled={!!jobBusy || !demo?.worker_queue.pending}>{jobBusy === "next" ? "领取中" : "执行下一项"}</button></header>{demo?.worker_queue.jobs.length ? demo.worker_queue.jobs.map((job) => <article key={job.job_id}><i className={job.status.toLowerCase()}/><div><strong>{job.skill}</strong><p>{job.agent_id} · {job.job_id}</p>{job.error && <small>{job.error}</small>}</div><aside><b>{job.status}</b><span>{job.attempt}/{job.max_attempts}</span>{job.status === "FAILED" && job.attempt < job.max_attempts && <button onClick={() => retryJob(job.job_id)} disabled={!!jobBusy}>{jobBusy === job.job_id ? "入队中" : "重试"}</button>}</aside></article>) : <p className="queue-empty">启动私人意图后，Manager 会把工作分派到持久队列。</p>}</div><div className="agent-registry-title"><span>AGENT REGISTRY</span><b>{demo?.agents.length ?? 0} REGISTERED</b></div><div className="runtime-list">{demo?.agents.map((agent, index) => <article key={agent.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{agent.name}</strong><p>{agent.role}</p></div><aside><i className={agent.status === "ACTIVE" ? "active" : ""}/><b>{agent.status}</b><small>{agent.events} EVENTS</small></aside></article>)}</div></section>}

        {tab === "skills" && <section><div className="system-panel-heading"><span>SKILL REGISTRY</span><b>VERSIONED CONTRACTS</b></div><div className="skill-matrix">{demo?.skills.map((skill) => <article key={skill.id}><header><span>{skill.id}</span><b>v{skill.version}</b></header><p>{skill.description}</p><footer><span>{skill.status}</span><b>{skill.invocations} INVOCATIONS</b></footer></article>)}</div></section>}

        {tab === "connectors" && <section><div className="system-panel-heading"><span>CONNECTOR PLANE</span><b>{demo?.connector_runtime.idempotent ? "IDEMPOTENT" : "UNSAFE"}</b></div><div className="connector-summary"><div><span>RECEIPTS</span><strong>{demo?.connector_runtime.receipts ?? 0}</strong></div><div><span>ENVELOPES</span><strong>{demo?.connector_runtime.mailbox_envelopes ?? 0}</strong></div><div><span>ACTIVE GRANTS</span><strong>{demo?.connector_grants.filter((grant) => grant.status === "ACTIVE").length ?? 0}</strong></div></div><div className="connector-list">{demo?.connector_runtime.connectors.map((connector) => <article key={connector.id} className={!connector.enabled ? "disabled" : ""}><div><i className={connector.status.toLowerCase()}/><strong>{connector.id}</strong><span>{connector.status} / {connector.mode}</span></div><p>{connector.write_scope}</p>{connector.details.remote && <small>{connector.details.remote} · HEAD {connector.details.head}</small>}<footer><button onClick={() => checkConnector(connector.id)} disabled={!!connectorBusy}>{connectorBusy === connector.id ? "检查中" : "健康检查"}</button><button onClick={() => toggleConnector(connector.id, !connector.enabled)} disabled={!!connectorBusy}>{connector.enabled ? confirmConnector === `toggle:${connector.id}` ? "确认停用" : "停用" : "启用"}</button></footer></article>)}</div><div className="grant-list"><h3>SCOPED GRANTS</h3>{demo?.connector_grants.length ? demo.connector_grants.map((grant) => <article key={grant.connector}><span>{grant.connector}</span><b>{grant.status}</b><p>{grant.scope}</p>{["ACTIVE", "PENDING_APPROVAL"].includes(grant.status) && <button onClick={() => revokeGrant(grant.connector)} disabled={!!connectorBusy}>{confirmConnector === `grant:${grant.connector}` ? "确认撤销" : "撤销授权"}</button>}</article>) : <p>候选确认后才会生成最小连接器授权。</p>}</div></section>}

        {tab === "connectors" && !!demo?.connector_runtime.outbox.length && <section className="outbox-list"><h3>ACTION OUTBOX <b>RECOVERABLE</b></h3>{demo.connector_runtime.outbox.map((item) => <article key={item.outbox_id} className={item.status.toLowerCase()}><i/><div><strong>{item.action_id}</strong><p>{item.connector_id} · ATTEMPT {item.attempt}/{item.max_attempts}</p>{item.error && <small>{item.error}</small>}</div><b>{item.status}</b>{item.status === "FAILED" && item.attempt < item.max_attempts && <button onClick={() => retryOutbox(item.outbox_id)} disabled={!!outboxBusy}>{outboxBusy === item.outbox_id ? "重放中" : "安全重放"}</button>}</article>)}</section>}

        {tab === "memory" && <section><div className="system-panel-heading"><span>LOCAL MEMORY VAULT</span><b>{demo?.memory_runtime.records ?? 0} VERIFIED RECORDS</b></div><div className="memory-properties"><span>{demo?.memory_runtime.storage ?? "LOCAL"}</span><span>{demo?.memory_runtime.verified_only ? "VERIFIED ONLY" : "UNSAFE"}</span><span>{demo?.memory_runtime.survives_task_reset ? "PERSISTENT" : "EPHEMERAL"}</span></div><form className="memory-search" onSubmit={(event) => { event.preventDefault(); searchMemory(); }}><input value={memoryQuery} onChange={(event) => setMemoryQuery(event.target.value)} placeholder="搜索经验、Trace 或类型" aria-label="搜索本地记忆"/><button disabled={memoryBusy}>{memoryBusy ? "检索中" : "检索"}</button></form>{memories?.items.length ? <div className="memory-list">{memories.items.map((memory) => <article key={memory.memory_id}><header><span>{memory.kind}</span><b>VERIFIED</b></header><strong>{memory.summary}</strong><p>{memory.trace_id} · {memory.evidence.length} EVIDENCE</p><footer><span>{memory.memory_id}</span><button onClick={() => forget(memory.memory_id)} disabled={memoryBusy}>{confirmForget === memory.memory_id ? "确认遗忘" : "遗忘"}</button></footer></article>)}</div> : <div className="memory-empty"><strong>{memoryBusy ? "正在读取本地 Memory" : "没有匹配的可信记忆"}</strong><p>只有独立 Verifier 通过的世界变化可以进入这里。</p></div>}</section>}

        {tab === "policy" && <section><div className="system-panel-heading"><span>TRUST POLICY</span><b>FAIL CLOSED</b></div><div className="policy-list">{demo?.privacy_invariants.map((rule, index) => <article key={rule}><span>{String(index + 1).padStart(2, "0")}</span><strong>{rule}</strong><b>ENFORCED</b></article>)}</div><button className="boundary-test" onClick={testBoundary} disabled={testing}><span>{testing ? "RUNNING" : "TEST BOUNDARY"}</span><strong>请求完整私人关系图</strong><b>↗</b></button>{demo?.privacy_denials.at(-1) && <div className="boundary-result"><span>DENIED</span><strong>{demo.privacy_denials.at(-1)?.reason}</strong><p>请求未改变主任务状态，也未泄露私人关系数据。</p></div>}</section>}
      </div>
      <footer><span>TRACE {demo?.trace_id ?? "NONE"}</span><b>{demo?.stage ?? "LOADING"}</b></footer>
    </motion.aside>
  </>}</AnimatePresence>;
}
