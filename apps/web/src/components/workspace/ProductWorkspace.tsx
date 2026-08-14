"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { demoApi } from "@/lib/api";
import { zh } from "@/lib/i18n";
import { useAgentStore } from "@/stores/agent-store";
import { AgentStage } from "@/components/spatial/AgentStage";
import { eventsFromSnapshot } from "@agentreach/agency-events";
import { SurfaceRuntime } from "@agentreach/surface-runtime";
import { WORKSPACE_EVIDENCE_SURFACE } from "@/surfaces/workspace-evidence";
import { WORKSPACE_APPROVAL_SURFACE } from "@/surfaces/workspace-approval";
import { webSurfaceRegistry } from "@/runtime/web-surface-registry";
import { ProtectedCommandDispatcher, type ProtectedCommandName } from "@agentreach/protected-commands";
import { focusTaskWorkspace } from "@/lib/surface-navigation";

const approvalDispatcher = new ProtectedCommandDispatcher([
  { command: "protected.approval.introduction.approve", stages: ["WAITING_USER_APPROVAL"] },
  { command: "protected.approval.peer.approve", stages: ["WAITING_PEER_APPROVAL"] },
  { command: "protected.approval.peer.reject", stages: ["WAITING_PEER_APPROVAL"] },
  { command: "protected.approval.commitment.approve", stages: ["COMMITMENT_PROPOSED"] },
]);

const PHASES = [
  { id: "self", label: "意图", stages: ["CREATED", "INTENT_PARSED"] },
  { id: "discover", label: "发现", stages: ["CANDIDATES_FOUND"] },
  { id: "consent", label: "同意", stages: ["WAITING_USER_APPROVAL", "INTRO_SENT", "WAITING_PEER_APPROVAL", "INTRO_ACCEPTED", "COMMITMENT_PROPOSED"] },
  { id: "act", label: "行动", stages: ["WAITING_ACTION_EXECUTION", "WAITING_VERIFICATION"] },
  { id: "evidence", label: "证据", stages: ["COMPLETED"] },
];

const DEFAULT_REQUEST = "最近我想继续做个人智能体，有没有合适的人？";

function stageIndex(stage: string) {
  const index = PHASES.findIndex((phase) => phase.stages.includes(stage));
  return index < 0 ? 0 : index;
}

export function ProductWorkspace() {
  const demo = useAgentStore((state) => state.demo);
  const persona = useAgentStore((state) => state.persona);
  const setDemo = useAgentStore((state) => state.setDemo);
  const navigate = useAgentStore((state) => state.navigate);
  const setAgentState = useAgentStore((state) => state.setAgentState);
  const openStudio = useAgentStore((state) => state.setPersonaStudioOpen);
  const [request, setRequest] = useState(DEFAULT_REQUEST);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [traceOpen, setTraceOpen] = useState(false);
  const activeIndex = stageIndex(demo?.stage ?? "CREATED");
  const latestTrace = useMemo(() => [...(demo?.trace ?? [])].reverse().slice(0, 4), [demo?.trace]);
  const agencyEvents = useMemo(() => demo ? eventsFromSnapshot(demo) : [], [demo]);

  useEffect(() => {
    setRequest(demo?.human_request || DEFAULT_REQUEST);
  }, [demo?.runtime.run_id]);

  async function begin() {
    if (!request.trim() || busy) return;
    setBusy(true); setError(""); setAgentState("thinking");
    try {
      setAgentState("searching");
      setDemo(await demoApi.startTask(request.trim()));
      setAgentState("idle");
    } catch (reason) {
      setAgentState("idle");
      setError(reason instanceof Error ? reason.message : "无法启动协作任务");
    } finally { setBusy(false); }
  }

  async function select(candidateId: string) {
    if (busy) return;
    if (demo?.selected_candidate?.id === candidateId && demo.stage !== "CANDIDATES_FOUND") {
      focusTaskWorkspace(navigate, "smooth", demo.runtime.run_id);
      return;
    }
    setBusy(true); setError("");
    try {
      setDemo(await demoApi.select(candidateId));
      setAgentState("waiting_approval");
      navigate({ kind: "workspace", runId: demo?.runtime.run_id });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "无法准备上下文胶囊");
    } finally { setBusy(false); }
  }

  async function reset() {
    if (busy) return;
    setBusy(true); setError("");
    try { setDemo(await demoApi.reset()); navigate({ kind: "self" }); setAgentState("idle"); }
    finally { setBusy(false); }
  }

  function openEvidenceArtifacts() {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    window.setTimeout(() => navigate({ kind: "dimension", id: "files", focus: "evidence" }), 40);
    window.setTimeout(() => window.scrollTo(0, 0), 120);
    window.setTimeout(() => { root.style.scrollBehavior = previousBehavior; }, 260);
  }

  const approvalMode = demo?.stage === "WAITING_USER_APPROVAL" ? "introduction" : demo?.stage === "WAITING_PEER_APPROVAL" ? "peer" : demo?.stage === "COMMITMENT_PROPOSED" ? "commitment" : "none";
  const approvalCopy = approvalMode === "introduction" ? {
    title: `允许向 ${demo?.selected_candidate?.display_name ?? "候选人"} 发送最小上下文？`, summary: "只发送协作主题与公开声明，不发送私人关系图、原始记忆或完整意图。", details: ["披露：协作主题 / 公开能力声明", "不披露：私人关系 / 原始记忆 / 本地推理"], level: "二级披露确认",
  } : approvalMode === "peer" ? {
    title: "Alice 是否接受这次触达？", summary: "对方拥有独立拒绝权；拒绝后不会创建承诺，也不会扩大披露。", details: ["接收方：Alice 的私人智能体", "选择：接受或拒绝，不推断沉默为同意"], level: "双向同意",
  } : approvalMode === "commitment" ? {
    title: demo?.commitment?.objective ? zh(demo.commitment.objective) : "批准现实世界行动", summary: "批准后仅执行列出的两项行动，随后由独立 Verifier 只读验证。", details: demo?.action_plan.map((action) => `${zh(action.action)} → ${action.target}`) ?? [], level: "三级强确认",
  } : { title: "", summary: "", details: [], level: "" };

  async function runProtected(command: string) {
    if (!demo || busy || !command.startsWith("protected.")) return;
    setBusy(true); setError("");
    const context = { runId: demo.runtime.run_id, stage: demo.stage };
    try {
      const ticket = approvalDispatcher.issue(command as ProtectedCommandName, context);
      const result = await approvalDispatcher.execute(ticket, context, async () => {
        const next = command === "protected.approval.introduction.approve" ? await demoApi.approveIntro()
          : command === "protected.approval.peer.approve" ? await demoApi.peerDecision(true)
          : command === "protected.approval.peer.reject" ? await demoApi.peerDecision(false)
          : await demoApi.approveCommitment();
        setDemo(next);
      });
      if (!result.ok) throw new Error(`受保护命令已拒绝：${result.reason}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "审批命令未执行"); }
    finally { setBusy(false); }
  }

  const currentStage = demo?.stage ?? "CREATED";
  const showIntent = ["CREATED", "INTENT_PARSED"].includes(currentStage);
  const showCandidates = currentStage === "CANDIDATES_FOUND";
  const showWorld = ["WAITING_ACTION_EXECUTION", "WAITING_VERIFICATION", "COMPLETED"].includes(currentStage);
  const showProgress = !showIntent && !showCandidates && approvalMode === "none" && !showWorld;

  return <section className="product-workspace" aria-label="AgentReach 操作台">
    <header className="workspace-header">
      <div><span className="eyebrow">02 / 行动工作面</span><h1>让私人意图抵达世界，<em>但不离开你的边界。</em></h1><p className="workspace-intro">从意图到证据，每一步都由同一个私人核心发起，并保留可检查的行动权边界。</p></div>
      <div className={`workspace-health runtime-${demo?.runtime.status.toLowerCase() ?? "loading"}`}><i/><span>{zh(demo?.runtime.status ?? "RUNNING")}</span><b>{zh(demo?.stage ?? "LOADING")}</b></div>
    </header>

    <div className="workspace-context" aria-label="当前运行上下文"><span>当前运行</span><b>{demo?.runtime.run_id ?? "正在建立本地会话"}</b><span>语义事件</span><b>{agencyEvents.length}</b><span>执行尝试</span><b>#{demo?.runtime.attempt ?? 1}</b></div>

    <div className="workspace-grid">
      <aside className="identity-console">
        <div className="identity-stage identity-core-stage"><AgentStage /><div className="identity-stage-label"><span>{persona.name} / 智能体核心</span><b>边界正常</b></div><small className="identity-plane-label">SELF<br/>PRIVATE</small></div>
        <div className="identity-controls"><button onClick={() => openStudio(true)}>校准核心</button><button onClick={reset} disabled={busy}>重置任务</button></div>
        <dl className="identity-stats"><div><dt>自治等级</dt><dd>二级 / 三级闸门</dd></div><div><dt>私有平面</dt><dd>仅本地</dd></div><div><dt>当前轨迹</dt><dd>{demo?.trace.length ?? 0}</dd></div><div><dt>越权阻断</dt><dd>{demo?.privacy_denials.length ?? 0}</dd></div></dl>
      </aside>

      <main className="operation-console">
        <ol className="phase-rail">{PHASES.map((phase, index) => <li key={phase.id} className={index === activeIndex ? "active" : index < activeIndex ? "done" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{phase.label}</b></li>)}</ol>

        {showIntent && <section className="intent-command stage-surface stage-intent">
          <div className="section-heading"><span>01 / 私人意图</span><small>只在本机结构化；共享平面不会收到原始请求</small></div>
          <div className="command-row"><textarea value={request} onChange={(event) => setRequest(event.target.value)} rows={2} aria-label="私人协作意图"/><button onClick={begin} disabled={busy || !request.trim()}>{busy ? "处理中" : demo?.stage === "CREATED" ? "开始发现" : "重新发现"}<b>↗</b></button></div>
          {error && <p className="workspace-error">{error}</p>}
        </section>}

        {showCandidates && <section className="candidate-console stage-surface stage-candidates">
          <div className="section-heading"><span>02 / 本地发现</span><small>共享声明 × 本地关系上下文</small></div>
          {!demo?.candidates.length ? <div className="workspace-empty"><i>∅</i><div><strong>等待私人意图</strong><p>启动任务后，Discovery Agent 会在本地筛选有效 Claim。</p></div></div> : <div className="candidate-list">{demo.candidates.map((candidate, index) => <motion.article key={candidate.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className={demo.selected_candidate?.id === candidate.id ? "selected" : ""}>
            <div className="candidate-rank"><span>{String(index + 1).padStart(2, "0")}</span><b>{candidate.score_percent}</b></div><div><h2>{candidate.display_name}</h2><p>{candidate.reasons.slice(0, 3).join(" · ")}</p></div><button onClick={() => select(candidate.id)} disabled={busy}>{demo.selected_candidate?.id === candidate.id && demo.stage !== "CANDIDATES_FOUND" ? "继续当前任务" : "审查披露"} <b>→</b></button>
          </motion.article>)}</div>}
        </section>}

        {approvalMode !== "none" && <SurfaceRuntime className="approval-runtime stage-surface stage-approval" ariaLabel="当前任务审批" schema={WORKSPACE_APPROVAL_SURFACE} registry={webSurfaceRegistry} command={({ command }) => runProtected(command)} data={{ approval: { mode: approvalMode, ...approvalCopy, busy, error } }} fallback="审批工作面暂时不可用"/>}

        {showWorld && <section className="world-console stage-surface stage-world">
          <div className="section-heading"><span>03 / 现实与证据</span><small>行动必须审批；记忆必须经过独立验证</small></div>
          <div className="world-columns"><div><h3>受控行动</h3>{demo?.action_plan.length ? demo.action_plan.map((action) => <article key={action.id}><i>{demo.action_results.some(result => result.action_id === action.id) ? "✓" : "○"}</i><div><strong>{zh(action.action)}</strong><small>{action.target}</small></div></article>) : <p className="quiet">选择候选后生成最小行动计划。</p>}</div><div><h3>验证证据</h3>{demo?.evidence.length ? demo.evidence.map((item) => <button className="world-evidence-link" key={item.type} onClick={openEvidenceArtifacts}><i>{item.verified ? "✓" : "×"}</i><span><strong>{zh(item.label)}</strong><small>{zh(item.type)} · 查看本地产物 ↗</small></span></button>) : <p className="quiet">Verifier 尚未运行。</p>}</div><div><h3>可信记忆</h3>{demo?.memory_updates.length ? demo.memory_updates.map((item) => <article key={item.memory_id}><i>✓</i><div><strong>{zh(item.kind)}</strong><small>{item.summary}</small></div></article>) : <p className="quiet">只有 VERIFIED 结果可以写回。</p>}</div></div>
        </section>}

        {showProgress && <section className="stage-progress stage-surface" role="status"><span className="progress-orbit"><i/><i/><i/></span><small>当前代理阶段</small><h2>{zh(currentStage)}</h2><p>Agent 正在本地队列中推进这一步。不会在没有新决定时堆叠额外界面。</p><button onClick={() => setTraceOpen(true)}>查看实时轨迹 ↗</button></section>}
      </main>

      <section className={`evidence-drawer ${traceOpen ? "open" : ""}`}><button className="evidence-toggle" onClick={() => setTraceOpen((open) => !open)} aria-expanded={traceOpen}><span>证据 / 实时轨迹</span><b>{demo?.trace_id ?? "尚未建立轨迹"}</b><i>{traceOpen ? "收起 ↓" : "展开 ↑"}</i></button>{traceOpen && <SurfaceRuntime className="evidence-console" ariaLabel="证据与实时轨迹" schema={WORKSPACE_EVIDENCE_SURFACE} registry={webSurfaceRegistry} data={{ verification: { verdict: demo?.verification?.verdict }, world: { changed: demo?.world_changed ?? false }, trace: { id: demo?.trace_id, latest: latestTrace }, boundary: { denials: demo?.privacy_denials.length ?? 0 } }} fallback="证据工作面暂时不可用"/>}</section>
    </div>
  </section>;
}
