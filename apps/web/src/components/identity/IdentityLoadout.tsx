"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentStage } from "@/components/spatial/AgentStage";
import { demoApi, memoryApi } from "@/lib/api";
import { zh } from "@/lib/i18n";
import { useAgentStore } from "@/stores/agent-store";
import type { MemoryRecord } from "@/types/agent";

type LoadoutSection = "relationship" | "parameters" | "skills" | "memory" | "projects" | "boundary";

const SECTION_META: Record<LoadoutSection, { index: string; label: string; title: string; description: string }> = {
  relationship: { index: "01", label: "关系", title: "你与 HAIPI", description: "它不是公开人格，而是你的私人行动代理。身份、记忆与边界都由你控制。" },
  parameters: { index: "02", label: "参数", title: "智能体参数", description: "核心场强、自治等级、运行状态与当前上下文共同决定它如何响应和行动。" },
  skills: { index: "03", label: "技能", title: "已装载技能", description: "每个技能都绑定明确执行智能体；调用会进入持久队列并留下轨迹。" },
  memory: { index: "04", label: "记忆", title: "可信记忆", description: "只有独立验证通过的经验才能进入本地记忆库，并且可以随时遗忘。" },
  projects: { index: "05", label: "项目", title: "任务与项目", description: "每个项目拥有独立运行快照；可暂停、恢复、切换或只读查看。" },
  boundary: { index: "06", label: "边界", title: "边界与连接", description: "现实行动必须通过范围授权、强审批、连接器健康检查和独立验证。" },
};

export function IdentityLoadout() {
  const demo = useAgentStore((state) => state.demo);
  const persona = useAgentStore((state) => state.persona);
  const setDemo = useAgentStore((state) => state.setDemo);
  const openStudio = useAgentStore((state) => state.setPersonaStudioOpen);
  const [active, setActive] = useState<LoadoutSection>("relationship");
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [busyRun, setBusyRun] = useState<string | null>(null);
  const [busyControl, setBusyControl] = useState<string | null>(null);
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null);
  const [confirmForget, setConfirmForget] = useState<string | null>(null);
  const [controlError, setControlError] = useState("");

  useEffect(() => { memoryApi.search("").then((result) => setMemories(result.items)).catch(() => setMemories([])); }, []);
  const current = SECTION_META[active];
  const activeAgents = demo?.agents.filter((agent) => agent.status === "ACTIVE").length ?? 0;
  const healthyConnectors = demo?.connector_runtime.connectors.filter((connector) => connector.enabled && connector.status === "HEALTHY").length ?? 0;
  const projects = useMemo(() => demo?.runtime.history.slice(0, 8) ?? [], [demo?.runtime.history]);

  function scrollToWorkspace() {
    const target = document.getElementById("task-workspace");
    if (!target) return;
    const top = target.offsetTop;
    window.scrollTo({ top, behavior: "smooth" });
    window.setTimeout(() => { if (window.scrollY < top * .8) window.scrollTo({ top, behavior: "auto" }); }, 700);
  }

  async function openProject(runId: string) {
    if (!demo || busyRun) return;
    setBusyRun(runId);
    try {
      const next = runId === demo.runtime.run_id ? demo : await demoApi.switchRun(runId);
      setDemo(next);
      window.setTimeout(scrollToWorkspace, 40);
    } finally { setBusyRun(null); }
  }

  async function toggleSkill(skillId: string, enabled: boolean) {
    if (busyControl) return;
    setBusyControl(skillId); setControlError("");
    try { setDemo(await demoApi.toggleSkill(skillId, enabled)); }
    catch (reason) { setControlError(reason instanceof Error ? reason.message : "无法更新 Skill Loadout"); }
    finally { setBusyControl(null); }
  }

  async function forgetMemory(memoryId: string) {
    if (confirmForget !== memoryId) { setConfirmForget(memoryId); return; }
    setBusyControl(memoryId); setControlError("");
    try {
      const result = await memoryApi.forget(memoryId);
      setMemories(result.items); setDemo(await demoApi.get()); setConfirmForget(null); setExpandedMemory(null);
    } catch (reason) { setControlError(reason instanceof Error ? reason.message : "无法遗忘 Memory"); }
    finally { setBusyControl(null); }
  }

  async function controlConnector(connectorId: string, enabled: boolean) {
    if (busyControl) return;
    setBusyControl(connectorId); setControlError("");
    try {
      if (enabled) await demoApi.toggleConnector(connectorId, true);
      const next = enabled ? await demoApi.checkConnector(connectorId) : await demoApi.toggleConnector(connectorId, false);
      setDemo(next);
    } catch (reason) { setControlError(reason instanceof Error ? reason.message : "无法更新 Connector"); }
    finally { setBusyControl(null); }
  }

  const detail = {
    relationship: <div className="loadout-relationship"><div className="relation-line"><span>你</span><i/><span>{persona.name}</span></div><dl><div><dt>所有者</dt><dd>HAIPI / 本地身份</dd></div><div><dt>关系</dt><dd>私人代理 / 非公开档案</dd></div><div><dt>自治</dt><dd>二级默认 · 三级强确认</dd></div><div><dt>信任</dt><dd>证据先于记忆</dd></div></dl><blockquote>“我的上下文留在身边。只有我决定时，它才向外抵达。”</blockquote></div>,
    parameters: <div className="loadout-specs"><dl><div><dt>核心形态</dt><dd>动态光场</dd></div><div><dt>表面质感</dt><dd>{{ matte: "柔雾", chrome: "虹彩镜面", porcelain: "乳白玻璃" }[persona.finish]}</dd></div><div><dt>核心场强</dt><dd>{Math.round(persona.aura * 100)}%</dd></div><div><dt>运行状态</dt><dd>{zh(demo?.runtime.status ?? "OFFLINE")}</dd></div><div><dt>当前阶段</dt><dd>{zh(demo?.stage ?? "LOADING")}</dd></div><div><dt>活跃执行体</dt><dd>{activeAgents}</dd></div></dl><button onClick={() => openStudio(true)}>校准智能体核心 ↗</button></div>,
    skills: <div className="loadout-items skill-loadout-list">{demo?.skills.map((skill, index) => <article key={skill.id} className={skill.enabled ? "" : "disabled"}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{zh(skill.id)}</strong><p>{skill.description}</p></div><aside><b>{zh(skill.status)}</b><small>{skill.invocations} 次调用 · v{skill.version}</small><button disabled={!!busyControl} onClick={() => toggleSkill(skill.id, !skill.enabled)}>{busyControl === skill.id ? "同步中" : skill.enabled ? "停用" : "装载"}</button></aside></article>)}</div>,
    memory: <div className="loadout-items memory-loadout-list">{memories.length ? memories.map((memory, index) => <article key={memory.memory_id} className={expandedMemory === memory.memory_id ? "expanded" : ""}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{memory.summary}</strong><p>{memory.kind} · TRACE {memory.trace_id}</p>{expandedMemory === memory.memory_id && <div className="memory-proof">{memory.evidence.map((proof) => <span key={`${proof.type}-${proof.label}`}><b>{proof.verified ? "✓" : "×"}</b>{zh(proof.label)} · {zh(proof.type)}</span>)}</div>}</div><aside><b>{memory.verified ? "VERIFIED" : "UNVERIFIED"}</b><small>可信度 {Math.round(memory.score * 100)}%</small><button onClick={() => { setExpandedMemory(expandedMemory === memory.memory_id ? null : memory.memory_id); setConfirmForget(null); }}>{expandedMemory === memory.memory_id ? "收起" : "证据"}</button>{expandedMemory === memory.memory_id && <button className="danger-control" disabled={!!busyControl} onClick={() => forgetMemory(memory.memory_id)}>{busyControl === memory.memory_id ? "遗忘中" : confirmForget === memory.memory_id ? "确认遗忘" : "遗忘"}</button>}</aside></article>) : <div className="loadout-empty"><b>0 VERIFIED MEMORY</b><p>完成一次经过 Verifier 的现实行动后，可信经验会出现在这里。</p></div>}</div>,
    projects: <div className="loadout-items">{projects.map((run, index) => <article key={run.run_id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{run.human_request || "未命名任务"}</strong><p>{zh(run.stage)} · 第 {run.attempt} 次执行</p></div><aside><b>{zh(run.status)}</b><button disabled={!!busyRun || !run.recoverable && run.run_id !== demo?.runtime.run_id} onClick={() => openProject(run.run_id)}>{busyRun === run.run_id ? "读取中" : run.run_id === demo?.runtime.run_id ? "进入" : run.recoverable ? "装载" : "旧记录"}</button></aside></article>)}</div>,
    boundary: <div className="loadout-boundary"><div className="boundary-meter"><strong>{healthyConnectors}/{demo?.connector_runtime.connectors.length ?? 0}</strong><span>连接器就绪</span></div><ul>{demo?.privacy_invariants.map((rule, index) => <li key={rule}><span>0{index + 1}</span>{rule}</li>)}</ul><div className="connector-strips">{demo?.connector_runtime.connectors.map((connector) => <div key={connector.id}><i className={connector.status.toLowerCase()}/><strong>{connector.id}</strong><span>{connector.enabled ? connector.status : "DISABLED"}</span><button disabled={!!busyControl} onClick={() => controlConnector(connector.id, !connector.enabled)}>{busyControl === connector.id ? "检查中" : connector.enabled ? "停用" : "检查并启用"}</button></div>)}</div></div>,
  }[active];

  return <section className="identity-loadout" aria-label="AI 身份装载界面">
    <header className="loadout-heading"><span>私人智能体 / 核心装载</span><h1>我与我的 <em>AI。</em></h1><p>不是一个聊天窗口。它是我持续装载、校准并授权行动的私人智能体。</p></header>
    <aside className="loadout-score"><span>关系等级</span><strong>07</strong><i><b style={{ width: "78%" }}/></i><small>私人信任 / 已验证</small></aside>
    <div className="loadout-core"><AgentStage/><div className="core-tag"><span>{persona.name} / 私人智能体核心</span><b>{zh(demo?.runtime.status ?? "ACTIVE")}</b></div><div className="scan-line"/></div>
    <nav className="loadout-slots" aria-label="AI 装载分类">{(Object.keys(SECTION_META) as LoadoutSection[]).map((id) => { const item = SECTION_META[id]; const count = id === "skills" ? demo?.skills.length : id === "memory" ? demo?.memory_runtime.records : id === "projects" ? demo?.runtime.history.length : undefined; return <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}><span>{item.index}</span><i/><div><strong>{item.label}</strong><small>{item.title}</small></div>{count !== undefined && <b>{count}</b>}</button>; })}</nav>
    <section className="loadout-detail" aria-live="polite"><header><div><span>{current.index} / {current.label}</span><h2>{current.title}</h2></div><b>{active.toUpperCase()}</b></header><p className="detail-lead">{current.description}</p>{controlError && <p className="loadout-control-error">{controlError}</p>}{detail}</section>
    <div className="loadout-actions"><button onClick={scrollToWorkspace}><span>下滑查看任务空间</span><b>滚动 / 02 ↓</b></button><button onClick={() => openStudio(true)}><span>校准核心</span><b>设置</b></button></div>
  </section>;
}
