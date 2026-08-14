"use client";

import type { ApplicationAuthoritySnapshot, ComputeAuthoritySnapshot, FileDeviceAuthoritySnapshot, RoutineLearningSnapshot } from "@/types/agent";

type LocalSection = "applications" | "routines" | "compute" | "files";
type Props = {
  applications: ApplicationAuthoritySnapshot | null;
  routines: RoutineLearningSnapshot | null;
  compute: ComputeAuthoritySnapshot | null;
  files: FileDeviceAuthoritySnapshot | null;
  skillCount: number;
  loading: boolean;
  error: string;
  onOpen: (section: LocalSection) => void;
};

export function LocalWorldSpace({ applications, routines, compute, files, skillCount, loading, error, onOpen }: Props) {
  if (loading) return <div className="local-world-empty"><i/><b>正在建立本地世界</b><span>聚合应用、程序、计算和文件设备 Authority…</span></div>;
  if (error) return <div className="local-world-empty error"><b>本地世界暂不可用</b><span>{error}</span></div>;
  const nodes: { id: LocalSection; index: string; label: string; value: string | number; unit: string; state: string; detail: string }[] = [
    { id: "applications", index: "A", label: "应用实体", value: applications?.installed ?? 0, unit: ` / ${applications?.total ?? 0}`, state: "零权限发现", detail: "安装状态、版本、控制面与授权包络" },
    { id: "routines", index: "B", label: "程序学习", value: routines?.routines.length ?? 0, unit: " 条程序", state: routines?.routines[0]?.state === "VERIFIED" ? "已验证" : "观察中", detail: "真实 Run、Verifier 与 Memory 派生" },
    { id: "compute", index: "C", label: "计算路由", value: compute?.resources.memory_percent.toFixed(0) ?? "—", unit: "% 内存", state: compute?.router.route === "LOCAL" ? "本地模型" : compute?.router.route === "CLOUD" ? "云端模型" : "等待模型", detail: compute?.hardware.chip ?? "硬件探测中" },
    { id: "files", index: "D", label: "文件与设备", value: files?.recent_files.length ?? 0, unit: " 个最近文件", state: `${files?.summary.online_devices ?? 0} 个设备`, detail: "默认拒绝 · 有界索引 · Evidence 双向链接" },
  ];
  const health = !compute ? "读取中" : compute.resources.disk_percent > 92 || compute.resources.memory_percent > 92 ? "需关注" : "正常";
  return <div className="local-world-space">
    <section className="local-world-hero"><div><span>LOCAL WORLD / 本机实体图</span><h3>AI 能看见什么，<br/><em>不等于它能控制什么。</em></h3><p>四个 Authority 共同计算当前 Affordance；发现、读取、写入与自动化始终分开。</p></div><aside><i/><b>本地优先</b><small>DENY BY DEFAULT</small></aside></section>
    <section className="local-world-telemetry" aria-label="本地世界实时摘要"><div><span>本地健康度</span><b>{health}</b></div><div><span>技能</span><b>{skillCount}</b></div><div><span>CPU</span><b>{compute?.resources.cpu_percent.toFixed(0) ?? "—"}<small>%</small></b></div><div><span>GPU</span><b>{compute?.hardware.gpu_cores || "—"}<small> 核</small></b></div><div><span>统一内存</span><b>{compute?.resources.memory_percent.toFixed(0) ?? "—"}<small>%</small></b></div><div><span>存储</span><b>{compute?.resources.disk_percent.toFixed(0) ?? "—"}<small>%</small></b></div></section>
    <section className="local-world-map" aria-label="本地世界四个子空间"><div className="local-world-core"><span>SELF</span><b>HAIPI</b><small>LOCAL CONTEXT</small></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{nodes.map((node, index) => { const angle=(-135+index*90)*Math.PI/180; return <line key={node.id} x1="50" y1="50" x2={50+Math.cos(angle)*34} y2={50+Math.sin(angle)*34}/>; })}</svg>{nodes.map((node) => <button key={node.id} className={`local-world-node node-${node.id}`} onClick={() => onOpen(node.id)}><small>{node.index}</small><span>{node.label}</span><strong>{node.value}<em>{node.unit}</em></strong><p>{node.detail}</p><footer><i/><b>{node.state}</b><em>进入 ↗</em></footer></button>)}</section>
    <footer className="local-world-foot"><span><i/> 四个 Authority 在线</span><p>所有写入仍必须经过 Scope、Approval、Outbox 和 Verifier。</p><b>ENTITY × CAPABILITY × POLICY</b></footer>
  </div>;
}
