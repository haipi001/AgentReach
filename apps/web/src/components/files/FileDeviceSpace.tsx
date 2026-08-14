"use client";

import { useEffect, useState } from "react";
import type { FileDeviceAuthoritySnapshot } from "@/types/agent";

type Props = { snapshot: FileDeviceAuthoritySnapshot | null; loading: boolean; error: string; initialTab?: "files" | "devices" | "evidence" };

const kindLabel = { MAC: "本机", DISPLAY: "显示器", PHONE: "手机", TABLET: "平板", STORAGE: "存储", USB: "USB" } as const;

export function FileDeviceSpace({ snapshot, loading, error, initialTab = "files" }: Props) {
  const [tab, setTab] = useState<"files" | "devices" | "evidence">(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);
  if (loading) return <div className="file-device-empty"><i/><b>正在建立本地对象边界</b><span>只扫描已明确授权的范围，不遍历敏感目录。</span></div>;
  if (error || !snapshot) return <div className="file-device-empty error"><b>文件与设备空间暂不可用</b><span>{error || "没有收到本机数据"}</span></div>;
  return <div className="file-device-space">
    <section className="fd-overview"><div><span>本地对象图 / 默认拒绝</span><strong>{snapshot.summary.readable_scopes}<small> 可读范围</small></strong><p>写入只允许进入受控运行世界，并必须经过 Action Outbox 与审批。</p></div><dl><div><dt>可写范围</dt><dd>{snapshot.summary.writable_scopes}</dd></div><div><dt>敏感范围</dt><dd>{snapshot.summary.sensitive_scopes}</dd></div><div><dt>在线设备</dt><dd>{snapshot.summary.online_devices}</dd></div></dl></section>
    <nav className="fd-tabs" aria-label="文件与设备分类"><button className={tab === "files" ? "active" : ""} onClick={() => setTab("files")}>文件与范围 <b>{snapshot.recent_files.length}</b></button><button className={tab === "devices" ? "active" : ""} onClick={() => setTab("devices")}>设备 <b>{snapshot.devices.length}</b></button><button className={tab === "evidence" ? "active" : ""} onClick={() => setTab("evidence")}>证据产物 <b>{snapshot.evidence_artifacts.length}</b></button></nav>
    {tab === "files" && <div className="fd-files"><section className="fd-scope-map"><header><span>访问边界</span><small>Policy ≠ OS 权限</small></header>{snapshot.scopes.map((scope) => <article key={scope.id} className={`${scope.sensitive ? "sensitive" : ""} ${scope.write ? "writable" : ""}`}><i/><div><b>{scope.name}</b><small>{scope.reason}</small></div><span>{scope.read ? "可读" : "禁止"} / {scope.write ? "可写" : "只读"}</span></article>)}</section><section className="fd-recent"><header><span>授权范围内的最近文件</span><small>最多显示 16 项</small></header>{snapshot.recent_files.length ? snapshot.recent_files.map((file) => <article key={file.id}><i>{file.mime.startsWith("image/") ? "IMG" : file.name.split(".").pop()?.slice(0, 4).toUpperCase() || "FILE"}</i><div><b>{file.name}</b><small>{file.scope_name} / {file.relative_path}</small></div><span>{file.size_label}</span><time>{new Date(file.modified_at).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}</time></article>) : <div className="fd-zero">授权范围内暂时没有文件</div>}</section></div>}
    {tab === "devices" && <section className="fd-devices"><header><span>已连接设备实体</span><small>发现不等于授权</small></header><div>{snapshot.devices.map((device) => <article key={device.id}><span>{kindLabel[device.kind]}</span><i className={device.status.toLowerCase()}/><h3>{device.name}</h3><p>{device.detail}</p><footer><b>{device.connection}</b><strong>{device.authority === "READ_ONLY" ? "只读" : "未授权"}</strong></footer></article>)}</div></section>}
    {tab === "evidence" && <section className="fd-artifacts"><header><span>当前任务 Evidence artifacts</span><small>Verifier 写入 / AI 只读</small></header>{snapshot.evidence_artifacts.length ? snapshot.evidence_artifacts.map((artifact) => <article key={artifact.id}><i>{artifact.verified ? "✓" : "×"}</i><div><b>{artifact.label}</b><small>{artifact.type}{artifact.path ? ` / ${artifact.path}` : " / 无本地路径"}</small></div><span className={artifact.verified && artifact.exists ? "verified" : "pending"}>{artifact.verified ? artifact.exists || !artifact.path ? "已验证" : "路径缺失" : "待验证"}</span></article>) : <div className="fd-zero"><b>还没有证据产物</b><span>完成一次经 Verifier 验证的现实行动后，产物会在这里建立双向链接。</span></div>}</section>}
    <footer className="fd-foot"><span><i/> 本地只读发现</span><p>隐藏目录、个人文档和下载目录不会被自动遍历。</p><time>{new Date(snapshot.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</time></footer>
  </div>;
}
