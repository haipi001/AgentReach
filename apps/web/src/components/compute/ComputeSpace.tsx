"use client";

import type { ComputeAuthoritySnapshot } from "@/types/agent";

type Props = { snapshot: ComputeAuthoritySnapshot | null; loading: boolean; error: string };

const statusLabel = { HEALTHY: "可用", UNAVAILABLE: "不可用", CONFIGURED: "已配置", NOT_CONFIGURED: "未配置" } as const;

function Meter({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <div className="compute-meter"><header><span>{label}</span><b>{value.toFixed(1)}%</b></header><i><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }}/></i><small>{detail}</small></div>;
}

export function ComputeSpace({ snapshot, loading, error }: Props) {
  if (loading) return <div className="compute-empty"><i/><b>正在探测本机计算资源</b><span>读取 CPU、统一内存、磁盘与模型服务健康状态…</span></div>;
  if (error || !snapshot) return <div className="compute-empty error"><b>计算空间暂不可用</b><span>{error || "没有收到本机数据"}</span></div>;
  const { hardware, resources, providers, router } = snapshot;
  return <div className="compute-space">
    <section className="compute-route">
      <div><span>模型路由 / {router.policy === "LOCAL_FIRST" ? "本地优先" : router.policy}</span><strong>{router.route === "LOCAL" ? "本地运行" : router.route === "CLOUD" ? "云端运行" : "等待模型"}</strong><p>{router.reason}</p></div>
      <aside className={router.route.toLowerCase()}><i/><b>{router.provider ?? "无可用提供方"}</b><small>当前选择</small></aside>
    </section>
    <div className="compute-grid">
      <section className="compute-hardware"><header><span>01 / 本机硬件</span><small>只读发现</small></header><h3>{hardware.chip}</h3><p>{hardware.model} · {hardware.architecture}</p><dl><div><dt>CPU</dt><dd>{hardware.cpu_physical_cores} 核 / {hardware.cpu_logical_cores} 线程</dd></div><div><dt>GPU</dt><dd>{hardware.gpu}{hardware.gpu_cores ? ` · ${hardware.gpu_cores} 核` : ""}</dd></div><div><dt>HOST</dt><dd>{hardware.host}</dd></div></dl></section>
      <section className="compute-resources"><header><span>02 / 实时资源</span><small>刚刚更新</small></header><Meter label="处理器" value={resources.cpu_percent} detail={`${hardware.cpu_logical_cores} 个逻辑核心`}/><Meter label="统一内存" value={resources.memory_percent} detail={`${resources.memory_used_gb} / ${resources.memory_total_gb} GB`}/><Meter label="本地磁盘" value={resources.disk_percent} detail={`${resources.disk_used_gb} / ${resources.disk_total_gb} GB`}/></section>
    </div>
    <section className="compute-providers"><header><span>03 / 模型提供方</span><small>凭据只判断是否存在，不读取内容</small></header><div>{providers.map((provider) => <article key={provider.id} className={provider.status.toLowerCase()}><i/><span><b>{provider.name}</b><small>{provider.kind === "LOCAL" ? "本地端点" : "云端配置"}</small></span><strong>{statusLabel[provider.status]}</strong><em>{provider.models.length ? `${provider.models.length} 个模型` : "—"}</em></article>)}</div></section>
    <footer className="compute-foot"><span><i/> 实时读取</span><p>该界面不授予算力控制权，也不会显示或传输任何 API 密钥。</p><time>{new Date(snapshot.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time></footer>
  </div>;
}
