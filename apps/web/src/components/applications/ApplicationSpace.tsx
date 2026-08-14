"use client";

import { useEffect, useState } from "react";
import type { ApplicationAuthoritySnapshot, LocalApplication } from "@/types/agent";

const STATUS_LABEL = { UNAUTHORIZED: "未授权", NOT_INSTALLED: "未安装" } as const;

export function ApplicationSpace({ snapshot, loading, error }: { snapshot: ApplicationAuthoritySnapshot | null; loading: boolean; error: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const applications = snapshot?.applications ?? [];
  const selected = applications.find((item) => item.id === selectedId) ?? applications.find((item) => item.installed) ?? applications[0];
  useEffect(() => { if (!selectedId && applications.length) setSelectedId((applications.find((item) => item.installed) ?? applications[0]).id); }, [applications, selectedId]);

  if (loading) return <div className="application-empty"><i/><strong>正在读取本机应用…</strong><p>只读取安装路径、Bundle ID 与版本，不会自动申请控制权。</p></div>;
  if (error) return <div className="application-empty error"><strong>应用权威源不可用</strong><p>{error}</p></div>;
  if (!snapshot || !selected) return <div className="application-empty"><strong>没有可用的应用记录</strong></div>;

  return <div className="application-space">
    <div className="application-summary"><span>LOCAL APPLICATION AUTHORITY</span><strong>{snapshot.installed}<small> / {snapshot.total}</small></strong><p>{snapshot.host.system} / {snapshot.host.machine} · 只读发现</p></div>
    <div className="application-grid" role="list">{applications.map((application) => <button key={application.id} role="listitem" className={`${application.installed ? "installed" : "missing"} ${selected.id === application.id ? "active" : ""}`} onClick={() => setSelectedId(application.id)}>
      <ApplicationGlyph application={application}/><span>{application.name}</span><small>{STATUS_LABEL[application.status]}</small><i/>
    </button>)}</div>
    <ApplicationDetail application={selected}/>
  </div>;
}

function ApplicationGlyph({ application }: { application: LocalApplication }) {
  const glyph = application.name.replace(" / Files", "").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <b aria-hidden="true">{glyph}</b>;
}

function ApplicationDetail({ application }: { application: LocalApplication }) {
  return <article className="application-detail">
    <header><div><span>APPLICATION ENTITY</span><h3>{application.name}</h3></div><b className={application.installed ? "installed" : "missing"}>{application.installed ? "已发现" : "未安装"}</b></header>
    <dl><div><dt>BUNDLE ID</dt><dd>{application.bundle_id ?? "不可用"}</dd></div><div><dt>版本</dt><dd>{application.version ?? "不可用"}</dd></div><div className="wide"><dt>安装路径</dt><dd>{application.path ?? "本机未发现"}</dd></div><div><dt>已学能力</dt><dd>{application.learned_procedures}</dd></div><div><dt>观察中程序</dt><dd>{application.observed_routines}</dd></div></dl>
    <section><span>PERMISSION ENVELOPE</span><div>{Object.entries(application.permissions).map(([name, enabled]) => <p key={name}><i className={enabled ? "on" : ""}/><b>{{ observe: "观察", read: "读取", write: "写入", automate: "自动化" }[name as keyof LocalApplication["permissions"]]}</b><small>{enabled ? "已授权" : "未授权"}</small></p>)}</div></section>
    <footer><button disabled>管理权限 <b>待接入</b></button><button disabled>教 AI 新操作 <b>需 Routine Runtime</b></button></footer>
  </article>;
}
