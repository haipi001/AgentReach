"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useState } from "react";

const PARAMETERS = [
  { id: "identity", label: "身份", value: "本地 / 自有", detail: "名称、形象与声音始终绑定到你的本地身份档案。" },
  { id: "memory", label: "记忆", value: "受保护 / 128", detail: "只有经过独立验证的经验才能进入持久记忆。" },
  { id: "intent", label: "意图", value: "私有 / 活跃", detail: "原始意图保持私有，只共享完成目的所需的最小声明。" },
  { id: "boundary", label: "边界", value: "正常 / 二级", detail: "策略与人工批准共同约束每一次对外行动。" },
  { id: "skills", label: "技能", value: "06 / 限定", detail: "每个工具都有狭窄目标、明确授权与可逆路径。" },
  { id: "relations", label: "关系", value: "127 / 私有", detail: "关系保持方向性，永远不会变成公开评分。" },
  { id: "reach", label: "触达", value: "就绪 / 双向", detail: "联系始于最小胶囊，并且需要双方同意。" },
] as const;

export function ParameterConstellation({ progress }: { progress: MotionValue<number> }) {
  const [active, setActive] = useState<(typeof PARAMETERS)[number]>(PARAMETERS[0]);
  const opacity = useTransform(progress, [0, .08, .28, .72, .9], [.42, .58, 1, 1, 0]);
  const scale = useTransform(progress, [0, .25, .72], [.94, 1, 1.035]);
  const detailX = useTransform(progress, [0, .2], [28, 0]);

  return <motion.div className="parameter-constellation" style={{ opacity, scale }}>
    <div className="parameter-orbit" aria-label="个人智能体参数">
      {PARAMETERS.map((parameter) => <button
        key={parameter.id}
        className={`parameter-node node-${parameter.id}${active.id === parameter.id ? " active" : ""}`}
        onMouseEnter={() => setActive(parameter)}
        onFocus={() => setActive(parameter)}
        onClick={() => setActive(parameter)}
      ><i/><span>{parameter.label}</span><b>{parameter.value}</b></button>)}
    </div>
    <motion.aside className="parameter-detail" style={{ x: detailX }} key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <span>参数 / {String(PARAMETERS.indexOf(active) + 1).padStart(2, "0")}</span>
      <strong>{active.label}</strong>
      <p>{active.detail}</p>
      <small>悬停节点查看详情</small>
    </motion.aside>
  </motion.div>;
}
