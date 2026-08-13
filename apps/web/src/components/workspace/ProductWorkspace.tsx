"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { demoApi } from "@/lib/api";
import { zh } from "@/lib/i18n";
import { useAgentStore } from "@/stores/agent-store";
import { AgentStage } from "@/components/spatial/AgentStage";

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
  const setView = useAgentStore((state) => state.setView);
  const setAgentState = useAgentStore((state) => state.setAgentState);
  const openStudio = useAgentStore((state) => state.setPersonaStudioOpen);
  const [request, setRequest] = useState(DEFAULT_REQUEST);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeIndex = stageIndex(demo?.stage ?? "CREATED");
  const latestTrace = useMemo(() => [...(demo?.trace ?? [])].reverse().slice(0, 4), [demo?.trace]);

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
      <div><span className="eyebrow">私人智能体控制面</span><h1>让私人意图抵达世界，<em>但不离开你的边界。</em></h1></div>
      <div className={`workspace-health runtime-${demo?.runtime.status.toLowerCase() ?? "loading"}`}><i/><span>{zh(demo?.runtime.status ?? "RUNNING")}</span><b>{zh(demo?.stage ?? "LOADING")}</b></div>
    </header>

    <div className="workspace-grid">
      <aside className="identity-console">
        <div className="identity-stage identity-core-stage"><AgentStage /><div className="identity-stage-label"><span>{persona.name} / 智能体核心</span><b>边界正常</b></div></div>
        <div className="identity-controls"><button onClick={() => openStudio(true)}>校准核心</button><button onClick={reset} disabled={busy}>重置任务</button></div>
        <dl className="identity-stats"><div><dt>自治等级</dt><dd>二级 / 三级闸门</dd></div><div><dt>私有平面</dt><dd>仅本地</dd></div><div><dt>当前轨迹</dt><dd>{demo?.trace.length ?? 0}</dd></div><div><dt>越权阻断</dt><dd>{demo?.privacy_denials.length ?? 0}</dd></div></dl>
      </aside>

      <main className="operation-console">
        <ol className="phase-rail">{PHASES.map((phase, index) => <li key={phase.id} className={index === activeIndex ? "active" : index < activeIndex ? "done" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{phase.label}</b></li>)}</ol>

        <section className="intent-command">
          <div className="section-heading"><span>01 / 私人意图</span><small>只在本机结构化；共享平面不会收到原始请求</small></div>
          <div className="command-row"><textarea value={request} onChange={(event) => setRequest(event.target.value)} rows={2} aria-label="私人协作意图"/><button onClick={begin} disabled={busy || !request.trim()}>{busy ? "处理中" : demo?.stage === "CREATED" ? "开始发现" : "重新发现"}<b>↗</b></button></div>
          {error && <p className="workspace-error">{error}</p>}
        </section>

        <section className="candidate-console">
          <div className="section-heading"><span>02 / 本地发现</span><small>共享声明 × 本地关系上下文</small></div>
          {!demo?.candidates.length ? <div className="workspace-empty"><i>∅</i><div><strong>等待私人意图</strong><p>启动任务后，Discovery Agent 会在本地筛选有效 Claim。</p></div></div> : <div className="candidate-list">{demo.candidates.map((candidate, index) => <motion.article key={candidate.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className={demo.selected_candidate?.id === candidate.id ? "selected" : ""}>
            <div className="candidate-rank"><span>{String(index + 1).padStart(2, "0")}</span><b>{candidate.score_percent}</b></div><div><h2>{candidate.display_name}</h2><p>{candidate.reasons.slice(0, 3).join(" · ")}</p></div><button onClick={() => select(candidate.id)} disabled={busy}>{demo.selected_candidate?.id === candidate.id && demo.stage !== "CANDIDATES_FOUND" ? "继续当前任务" : "审查披露"} <b>→</b></button>
          </motion.article>)}</div>}
        </section>

        <section className="world-console">
          <div className="section-heading"><span>03 / 现实与证据</span><small>行动必须审批；记忆必须经过独立验证</small></div>
          <div className="world-columns"><div><h3>受控行动</h3>{demo?.action_plan.length ? demo.action_plan.map((action) => <article key={action.id}><i>{demo.action_results.some(result => result.action_id === action.id) ? "✓" : "○"}</i><div><strong>{zh(action.action)}</strong><small>{action.target}</small></div></article>) : <p className="quiet">选择候选后生成最小行动计划。</p>}</div><div><h3>验证证据</h3>{demo?.evidence.length ? demo.evidence.map((item) => <article key={item.type}><i>{item.verified ? "✓" : "×"}</i><div><strong>{zh(item.label)}</strong><small>{zh(item.type)}</small></div></article>) : <p className="quiet">Verifier 尚未运行。</p>}</div><div><h3>可信记忆</h3>{demo?.memory_updates.length ? demo.memory_updates.map((item) => <article key={item.memory_id}><i>✓</i><div><strong>{zh(item.kind)}</strong><small>{item.summary}</small></div></article>) : <p className="quiet">只有 VERIFIED 结果可以写回。</p>}</div></div>
        </section>
      </main>

      <aside className="evidence-console">
        <div className="evidence-verdict"><span>独立验证器</span><strong>{demo?.verification ? zh(demo.verification.verdict) : "尚未运行"}</strong><small>{demo?.world_changed ? "现实已改变 / 证据成立" : "暂无已验证的现实变化"}</small></div>
        <div className="trace-stream"><div className="section-heading"><span>实时轨迹</span><small>{demo?.trace_id ?? "暂无轨迹"}</small></div>{latestTrace.map((event) => <article key={event.sequence}><span>#{String(event.sequence).padStart(2, "0")}</span><div><strong>{zh(event.agent_label)}</strong><p>{event.summary}</p></div><b>{zh(event.decision)}</b></article>)}</div>
        <div className="boundary-summary"><span>边界</span><strong>默认私密</strong><p>意图、记忆与关系图不进入共享服务器。</p></div>
      </aside>
    </div>
  </section>;
}
