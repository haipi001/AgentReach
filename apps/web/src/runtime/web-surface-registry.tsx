import { ComponentRegistry, CORE_MANIFESTS } from "@agentreach/component-registry";
import type { RuntimeComponent, RuntimeComponentProps } from "@agentreach/surface-runtime";
import { zh } from "@/lib/i18n";

function TelemetryList(props: RuntimeComponentProps) {
  const stage = typeof props.stage === "string" ? zh(props.stage) : "载入中";
  const memories = typeof props.memories === "number" ? props.memories : 0;
  const healthy = typeof props.healthyConnectors === "number" ? props.healthyConnectors : 0;
  const total = typeof props.connectorTotal === "number" ? props.connectorTotal : 0;
  const growth = Array.isArray(props.growth) ? props.growth.filter((value): value is number => typeof value === "number").slice(-8) : [];
  const activity = Array.isArray(props.activity) ? props.activity.filter((item): item is { summary?: string; label?: string } => typeof item === "object" && item !== null).slice(0, 3) : [];
  const max = Math.max(...growth, 1); const min = Math.min(...growth, 0); const range = Math.max(max - min, 1);
  const points = growth.map((value, index) => `${growth.length === 1 ? 50 : index * 100 / (growth.length - 1)},${38 - ((value - min) / range) * 32}`).join(" ");
  return <aside className="universe-telemetry" aria-label="智能体实时状态">
    <div><span>当前阶段</span><b>{stage}</b></div>
    <div><span>可信记忆</span><b>{memories}</b></div>
    <div><span>连接就绪</span><b>{healthy}/{total}</b></div>
    <section className="self-growth"><header><span>成长轨迹</span><b>{growth.at(-1) ?? 0}</b></header><svg viewBox="0 0 100 42" preserveAspectRatio="none" aria-label="由真实运行完成情况推导的成长曲线"><line x1="0" y1="38" x2="100" y2="38"/><polyline points={points}/>{growth.map((value, index) => <circle key={`${index}-${value}`} cx={growth.length === 1 ? 50 : index * 100 / (growth.length - 1)} cy={38 - ((value - min) / range) * 32} r="1.8"/>)}</svg><small>基于持久 Run 与验证完成度</small></section>
    <section className="self-recent"><header><span>最近活动</span><b>{activity.length}</b></header>{activity.length ? activity.map((item, index) => <p key={`${index}-${item.summary}`}><i>{String(index + 1).padStart(2, "0")}</i><span>{item.summary ?? "等待活动摘要"}</span><b>{zh(item.label ?? "TRACE")}</b></p>) : <p className="empty"><span>尚无可审计活动</span></p>}</section>
  </aside>;
}

type TraceRow = { sequence?: number; agent_label?: string; summary?: string; decision?: string };
function EvidencePanel(props: RuntimeComponentProps) {
  const verdict = typeof props.verdict === "string" ? zh(props.verdict) : "尚未运行";
  const worldChanged = props.worldChanged === true;
  const traceId = typeof props.traceId === "string" ? props.traceId : "暂无轨迹";
  const trace = Array.isArray(props.trace) ? props.trace.filter((item): item is TraceRow => typeof item === "object" && item !== null).slice(0, 4) : [];
  const denials = typeof props.denialCount === "number" ? props.denialCount : 0;
  return <>
    <div className="evidence-verdict"><span>{typeof props.title === "string" ? props.title : "独立验证器"}</span><strong>{verdict}</strong><small>{worldChanged ? "现实已改变 / 证据成立" : "暂无已验证的现实变化"}</small></div>
    <div className="trace-stream"><div className="section-heading"><span>实时轨迹</span><small>{traceId}</small></div>{trace.length ? trace.map((event, index) => <article key={`${event.sequence ?? index}-${event.agent_label ?? "agent"}`}><span>#{String(event.sequence ?? index + 1).padStart(2, "0")}</span><div><strong>{zh(event.agent_label ?? "未知智能体")}</strong><p>{event.summary ?? "等待事件摘要"}</p></div><b>{zh(event.decision ?? "PENDING")}</b></article>) : <div className="trace-empty"><i>○</i><strong>等待第一条可审计事件</strong><p>意图启动后，语义事件会在这里按时间出现。</p></div>}</div>
    <div className="boundary-summary"><span>边界 / {denials} 次阻断</span><strong>{typeof props.boundaryTitle === "string" ? props.boundaryTitle : "默认私密"}</strong><p>意图、记忆与关系图不进入共享服务器。</p></div>
  </>;
}

function ApprovalPanel(props: RuntimeComponentProps) {
  const actions = props.actions as Readonly<Record<string, (() => void) | undefined>> | undefined;
  const details = Array.isArray(props.details) ? props.details.filter((item): item is string => typeof item === "string") : [];
  const busy = props.busy === true;
  return <section className="schema-approval" aria-label="受保护审批">
    <header><span>审批闸门 / {typeof props.level === "string" ? props.level : "三级强确认"}</span><i>PROTECTED</i></header>
    <h2>{typeof props.title === "string" ? props.title : "等待你的确认"}</h2>
    <p>{typeof props.summary === "string" ? props.summary : "请检查将要披露或执行的内容。"}</p>
    {details.length > 0 && <ul>{details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
    {typeof props.error === "string" && props.error && <strong className="approval-error">{props.error}</strong>}
    <footer>{actions?.reject && <button type="button" className="approval-reject" disabled={busy} onClick={actions.reject}>{typeof props.rejectLabel === "string" ? props.rejectLabel : "拒绝"}</button>}<button type="button" className="approval-confirm" disabled={busy || !actions?.approve} onClick={actions?.approve}>{busy ? "正在建立可信命令" : typeof props.approveLabel === "string" ? props.approveLabel : "批准"}<b>↗</b></button></footer>
  </section>;
}

export const webSurfaceRegistry = new ComponentRegistry<RuntimeComponent>();
for (const manifest of CORE_MANIFESTS) {
  if (manifest.id === "telemetry-list") webSurfaceRegistry.register(manifest, TelemetryList);
  if (manifest.id === "evidence-panel") webSurfaceRegistry.register(manifest, EvidencePanel);
  if (manifest.id === "approval-surface") webSurfaceRegistry.register(manifest, ApprovalPanel);
}
