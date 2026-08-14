"use client";

import { useState } from "react";
import { updateRoutinePolicy } from "@/lib/api";
import type { LearnedRoutine, RoutineLearningSnapshot, RoutinePolicy } from "@/types/agent";

const STATE = { OBSERVING: "观察中", LEARNED: "已学习", VERIFIED: "已验证" } as const;
const POLICY: { id: RoutinePolicy; label: string; note: string }[] = [
  { id: "IGNORE", label: "忽略", note: "停止继续学习" },
  { id: "LEARN", label: "继续学习", note: "仅积累证据" },
  { id: "ASK_WHEN_READY", label: "准备后询问", note: "达到阈值后由你决定" },
  { id: "AUTO_EXECUTE", label: "自动执行", note: "只限已验证低风险" },
];

export function RoutineLearningSpace({ snapshot, loading, error, onSnapshot }: { snapshot: RoutineLearningSnapshot | null; loading: boolean; error: string; onSnapshot: (snapshot: RoutineLearningSnapshot) => void }) {
  const [busy, setBusy] = useState<RoutinePolicy | null>(null);
  const [actionError, setActionError] = useState("");
  const routine = snapshot?.routines[0];

  async function setPolicy(policy: RoutinePolicy) {
    if (!routine || busy || policy === "AUTO_EXECUTE") return;
    setBusy(policy); setActionError("");
    try { onSnapshot(await updateRoutinePolicy(routine.routine_id, policy)); }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "策略更新失败"); }
    finally { setBusy(null); }
  }

  if (loading) return <div className="routine-empty"><i/><strong>正在汇总持久运行证据…</strong></div>;
  if (error || !routine) return <div className="routine-empty error"><strong>暂无可学习程序</strong><p>{error || "完成一次任务后，运行轨迹会在这里形成候选程序。"}</p></div>;

  return <div className="routine-space">
    <header className="routine-hero"><div><span>PROCEDURE LEARNING / EVIDENCE DERIVED</span><h3>{routine.name}</h3><p>{routine.application_name} · 来自持久 Run、Verifier 与 Memory，不包含合成观察数。</p></div><b className={routine.state.toLowerCase()}>{STATE[routine.state]}</b></header>
    <section className="routine-metrics"><article><span>观察次数</span><strong>{routine.observations}</strong><small>DURABLE RUNS</small></article><article><span>验证执行</span><strong>{routine.verified_runs}</strong><small>VERIFIER PASSED</small></article><article><span>置信度</span><strong>{Math.round(routine.confidence * 100)}%</strong><small>EVIDENCE WEIGHTED</small></article><article><span>风险</span><strong>{routine.risk === "MEDIUM" ? "中" : routine.risk}</strong><small>APPROVAL REQUIRED</small></article></section>
    <div className="routine-body"><section className="routine-steps"><span>SEMANTIC PROCEDURE</span>{routine.semantic_steps.map((step) => <article key={step.index}><b>{String(step.index).padStart(2, "0")}</b><div><strong>{step.label}</strong><small>{step.boundary}</small></div><i/></article>)}</section><aside className="routine-guidance"><span>AI SUGGESTION</span><p>{routine.suggestion}</p><div className="routine-confidence"><i style={{ width: `${Math.round(routine.confidence * 100)}%` }}/></div><small>只有经过独立验证的低风险程序才可以开启自动执行。</small></aside></div>
    <footer className="routine-policy"><span>LEARNING POLICY</span><div>{POLICY.map((item) => <button key={item.id} className={routine.policy === item.id ? "active" : ""} disabled={!!busy || item.id === "AUTO_EXECUTE" && !routine.auto_execute_allowed} onClick={() => setPolicy(item.id)}><b>{busy === item.id ? "更新中" : item.label}</b><small>{item.note}</small></button>)}</div>{actionError && <p>{actionError}</p>}</footer>
  </div>;
}
