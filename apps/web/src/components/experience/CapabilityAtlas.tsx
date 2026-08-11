"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SYSTEMS = [
  { index: "01", zone: "头部", plane: "自我", title: "身份被体现，而不是被暴露。", copy: "面容、声音与名称让智能体只对你保持可辨识。它们从不构成授权证明，也不会扩大访问范围。", signals: ["身份 / 本地", "面容 / 用户持有", "声音 / 可撤销", "面具 / 可选", "名称 / HAIPI", "导出 / 锁定"] },
  { index: "02", zone: "核心", plane: "行动权", title: "意图必须穿过边界。", copy: "核心把你的需求翻译成有范围的计划。在策略与人工批准同时满足之前，披露、联系与承诺都会停在这里。", signals: ["意图 / 私有", "边界 / 正常", "自主等级 / 二级", "策略 / 生效", "审批 / 人工", "范围 / 最小"] },
  { index: "03", zone: "双手", plane: "现实世界", title: "技能有意识地触达现实。", copy: "工具不是性格特征。每项能力都必须拥有狭窄授权、明确目标和可逆路径，才能离开自我空间执行。", signals: ["技能 / 06", "授权 / 限定", "触达 / 询问用户", "代码仓库 / 本地", "信箱 / 就绪", "撤销 / 就绪"] },
  { index: "04", zone: "关系网络", plane: "现实世界", title: "关系始终保持方向性。", copy: "人与社区只能通过最小上下文胶囊被接近。你的私人关系图永远不会变成全球统一分数。", signals: ["关系 / 127", "声明 / 最小", "同意 / 双向", "信任域 / 03", "待办协作 / 06", "关系图 / 私有"] },
  { index: "05", zone: "轨迹", plane: "证据", title: "证据先于记忆返回。", copy: "独立验证者会重新读取现实世界状态。只有经过验证的效果，才能成为个人智能体的持久经验。", signals: ["证据 / 已验证", "轨迹 / 12", "记忆 / 受保护", "回执 / 02", "拒绝 / 可见", "写回 / 已证明"] },
] as const;

export function CapabilityAtlas() {
  const reduceMotion = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const systems = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  useEffect(() => {
    const measure = () => {
      if (!systems.current) return;
      setTravel(Math.max(0, systems.current.scrollWidth - window.innerWidth * .58));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (systems.current) observer.observe(systems.current);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  return <section className="capability-atlas" aria-labelledby="atlas-title">
    <header className="atlas-intro"><span>个人智能体解剖 / 003</span><h2 id="atlas-title">一个存在。<br/><em>五套信任系统。</em></h2><p>每一部分都是有边界的能力——不是升级插槽，更不是隐藏权限。</p></header>
    <div ref={track} className="atlas-horizontal-track">
      <div className="atlas-sticky">
        <div className="atlas-title-rail"><span>系统图谱</span><b>01—05</b></div>
        <figure className="atlas-body" aria-hidden="true"><div className="atlas-photo-head"><i/><i/><i/></div><figcaption>自我 / 本地头部</figcaption></figure>
        <motion.div ref={systems} className="atlas-systems" style={reduceMotion ? undefined : { x }}>{SYSTEMS.map((system) => <motion.article key={system.index} className="atlas-system">
        <div className="system-meta"><b>{system.index}</b><span>{system.zone}</span><i>{system.plane}</i></div>
        <h3>{system.title}</h3><p>{system.copy}</p>
        <div className="system-signals">{system.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
      </motion.article>)}</motion.div>
        <motion.div className="atlas-progress" style={{ scaleX: scrollYProgress }} />
      </div>
    </div>
    <section className="atlas-end"><span>所有系统均可见 / 005</span><h3>你的智能体可以行动。<br/><em>控制权仍在你手中。</em></h3><p>每项能力都保持可检查、有范围、可撤销。</p></section>
  </section>;
}
