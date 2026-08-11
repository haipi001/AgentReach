"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { demoApi } from "@/lib/api";
import { zh } from "@/lib/i18n";
import { useAgentStore } from "@/stores/agent-store";
import { AgentStage } from "@/components/spatial/AgentStage";

const PHASES = [
  { id: "self", label: "SELF", stages: ["CREATED", "INTENT_PARSED"] },
  { id: "discover", label: "DISCOVER", stages: ["CANDIDATES_FOUND"] },
  { id: "consent", label: "CONSENT", stages: ["WAITING_USER_APPROVAL", "INTRO_SENT", "WAITING_PEER_APPROVAL", "INTRO_ACCEPTED", "COMMITMENT_PROPOSED"] },
  { id: "act", label: "ACT", stages: ["VERIFIED"] },
  { id: "evidence", label: "EVIDENCE", stages: ["COMPLETED"] },
];

function stageIndex(stage: string) {
  const index = PHASES.findIndex((phase) => phase.stages.includes(stage));
  return index < 0 ? 0 : index;
}

export function ProductWorkspace() {
  const demo = useAgentStore((state) => state.demo);
  const persona = useAgentStore((state) => state.persona);
  const setDemo = useAgentStore((state) => state.setDemo);
  const setView = useAgentStore((state) => state.setView);
  const setAgentState = useAgentStore((state) => state.setAgentState);
  const openStudio = useAgentStore((state) => state.setPersonaStudioOpen);
  const [request, setRequest] = useState("最近我想继续做 Personal Agent，有没有合适的人？");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeIndex = stageIndex(demo?.stage ?? "CREATED");
  const latestTrace = useMemo(() => [...(demo?.trace ?? [])].reverse().slice(0, 4), [demo?.trace]);

  async function begin() {
    if (!request.trim() || busy) return;
    setBusy(true); setError(""); setAgentState("thinking");
    try {
      await demoApi.reset();
      await demoApi.intent(request.trim());
      setAgentState("searching");
      setDemo(await demoApi.discover());
      setAgentState("idle");
    } catch (reason) {
      setAgentState("idle");
      setError(reason instanceof Error ? reason.message : "无法启动协作任务");
    } finally { setBusy(false); }
  }

  async function select(candidateId: string) {
    if (busy) return;
    if (demo?.selected_candidate?.id === candidateId && demo.stage !== "CANDIDATES_FOUND") {
      if (demo.stage === "COMPLETED" || demo.stage === "PEER_REJECTED") setView("connected");
      else setView("capsule");
      return;
    }
    setBusy(true); setError("");
    try {
      setDemo(await demoApi.select(candidateId));
      setAgentState("waiting_approval");
      setView("capsule");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "无法准备上下文胶囊");
    } finally { setBusy(false); }
  }

  async function reset() {
    if (busy) return;
    setBusy(true); setError("");
    try { setDemo(await demoApi.reset()); setView("self"); setAgentState("idle"); }
    finally { setBusy(false); }
  }

  return <section className="product-workspace" aria-label="AgentReach 操作台">
    <header className="workspace-header">
      <div><span className="eyebrow">PERSONAL AGENT CONTROL SURFACE</span><h1>让私人意图抵达世界，<em>但不离开你的边界。</em></h1></div>
      <div className={`workspace-health runtime-${demo?.runtime.status.toLowerCase() ?? "loading"}`}><i/><span>{demo?.runtime.status ?? "LOCAL RUNTIME"}</span><b>{demo?.stage ?? "LOADING"}</b></div>
    </header>

    <div className="workspace-grid">
      <aside className="identity-console">
        <div className="identity-stage"><AgentStage /><div className="identity-stage-label"><span>{persona.name} / PERSONAL AGENT</span><b>BOUNDARY NORMAL</b></div></div>
        <div className="identity-controls"><button onClick={() => openStudio(true)}>编辑形象</button><button onClick={reset} disabled={busy}>重置任务</button></div>
        <dl className="identity-stats"><div><dt>自治等级</dt><dd>L2 / L3 GATE</dd></div><div><dt>私有平面</dt><dd>LOCAL ONLY</dd></div><div><dt>当前轨迹</dt><dd>{demo?.trace.length ?? 0}</dd></div><div><dt>越权阻断</dt><dd>{demo?.privacy_denials.length ?? 0}</dd></div></dl>
      </aside>

      <main className="operation-console">
        <ol className="phase-rail">{PHASES.map((phase, index) => <li key={phase.id} className={index === activeIndex ? "active" : index < activeIndex ? "done" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{phase.label}</b></li>)}</ol>

        <section className="intent-command">
          <div className="section-heading"><span>01 / PRIVATE INTENT</span><small>只在本机结构化；共享平面不会收到原始请求</small></div>
          <div className="command-row"><textarea value={request} onChange={(event) => setRequest(event.target.value)} rows={2} aria-label="私人协作意图"/><button onClick={begin} disabled={busy || !request.trim()}>{busy ? "处理中" : demo?.stage === "CREATED" ? "开始发现" : "重新发现"}<b>↗</b></button></div>
          {error && <p className="workspace-error">{error}</p>}
        </section>

        <section className="candidate-console">
          <div className="section-heading"><span>02 / LOCAL DISCOVERY</span><small>共享 Claims × 本地关系上下文</small></div>
          {!demo?.candidates.length ? <div className="workspace-empty"><i>∅</i><div><strong>等待私人意图</strong><p>启动任务后，Discovery Agent 会在本地筛选有效 Claim。</p></div></div> : <div className="candidate-list">{demo.candidates.map((candidate, index) => <motion.article key={candidate.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className={demo.selected_candidate?.id === candidate.id ? "selected" : ""}>
            <div className="candidate-rank"><span>{String(index + 1).padStart(2, "0")}</span><b>{candidate.score_percent}</b></div><div><h2>{candidate.display_name}</h2><p>{candidate.reasons.slice(0, 3).join(" · ")}</p></div><button onClick={() => select(candidate.id)} disabled={busy}>{demo.selected_candidate?.id === candidate.id && demo.stage !== "CANDIDATES_FOUND" ? "继续当前任务" : "审查披露"} <b>→</b></button>
          </motion.article>)}</div>}
        </section>

        <section className="world-console">
          <div className="section-heading"><span>03 / WORLD & EVIDENCE</span><small>行动必须审批；记忆必须经过独立验证</small></div>
          <div className="world-columns"><div><h3>受控行动</h3>{demo?.action_plan.length ? demo.action_plan.map((action) => <article key={action.id}><i>{demo.action_results.some(result => result.action_id === action.id) ? "✓" : "○"}</i><div><strong>{zh(action.action)}</strong><small>{action.target}</small></div></article>) : <p className="quiet">选择候选后生成最小行动计划。</p>}</div><div><h3>验证证据</h3>{demo?.evidence.length ? demo.evidence.map((item) => <article key={item.type}><i>{item.verified ? "✓" : "×"}</i><div><strong>{zh(item.label)}</strong><small>{zh(item.type)}</small></div></article>) : <p className="quiet">Verifier 尚未运行。</p>}</div><div><h3>可信记忆</h3>{demo?.memory_updates.length ? demo.memory_updates.map((item) => <article key={item.memory_id}><i>✓</i><div><strong>{zh(item.kind)}</strong><small>{item.summary}</small></div></article>) : <p className="quiet">只有 VERIFIED 结果可以写回。</p>}</div></div>
        </section>
      </main>

      <aside className="evidence-console">
        <div className="evidence-verdict"><span>INDEPENDENT VERIFIER</span><strong>{demo?.verification ? zh(demo.verification.verdict) : "NOT RUN"}</strong><small>{demo?.world_changed ? "WORLD CHANGED / PROVED" : "NO VERIFIED WORLD CHANGE"}</small></div>
        <div className="trace-stream"><div className="section-heading"><span>LIVE TRACE</span><small>{demo?.trace_id ?? "NO TRACE"}</small></div>{latestTrace.map((event) => <article key={event.sequence}><span>#{String(event.sequence).padStart(2, "0")}</span><div><strong>{zh(event.agent_label)}</strong><p>{event.summary}</p></div><b>{zh(event.decision)}</b></article>)}</div>
        <div className="boundary-summary"><span>BOUNDARY</span><strong>PRIVATE BY DEFAULT</strong><p>Intent、Memory 与 Relationship Graph 不进入共享服务器。</p></div>
      </aside>
    </div>
  </section>;
}
