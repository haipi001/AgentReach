"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { demoApi, notificationApi } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";
import type { NotificationRecord, NotificationResult } from "@/types/agent";
import { focusTaskWorkspace } from "@/lib/surface-navigation";

export function NotificationCenter() {
  const open = useAgentStore((state) => state.notificationCenterOpen);
  const setOpen = useAgentStore((state) => state.setNotificationCenterOpen);
  const demo = useAgentStore((state) => state.demo);
  const setDemo = useAgentStore((state) => state.setDemo);
  const navigate = useAgentStore((state) => state.navigate);
  const setSystemOpen = useAgentStore((state) => state.setSystemPanelOpen);
  const [result, setResult] = useState<NotificationResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (open) notificationApi.list().then(setResult).catch(() => undefined);
  }, [open]);

  async function sync(operation: Promise<NotificationResult>, key: string) {
    setBusy(key);
    try {
      setResult(await operation);
      setDemo(await demoApi.get());
    } finally { setBusy(null); }
  }

  async function openNotification(item: NotificationRecord) {
    await sync(notificationApi.read(item.notification_id), item.notification_id);
    if (item.run_id !== demo?.runtime.run_id) return;
    setOpen(false);
    if (item.action === "system") setSystemOpen(true);
    else focusTaskWorkspace(navigate, "smooth", item.run_id);
  }

  return <AnimatePresence>{open && <>
    <motion.button className="notification-scrim" aria-label="关闭通知中心" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
    <motion.aside className="notification-center" aria-label="通知与审批收件箱" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 31 }}>
      <header><div><span>PERSONAL AGENT / INBOX</span><strong>通知与审批</strong></div><button aria-label="关闭通知中心" onClick={() => setOpen(false)}>×</button></header>
      <div className="notification-toolbar"><span>{result?.unread ?? 0} UNREAD / {result?.total ?? 0} TOTAL</span><button onClick={() => sync(notificationApi.readAll(), "all")} disabled={busy === "all" || !result?.unread}>全部已读</button></div>
      <div className="notification-feed">{result?.items.length ? result.items.map((item) => {
        const current = item.run_id === demo?.runtime.run_id;
        return <article key={item.notification_id} className={`${item.status.toLowerCase()} ${current ? "current" : "historical"}`}>
          <div className="notification-meta"><span>{item.kind}</span><b>{item.status}</b></div>
          <strong>{item.title}</strong><p>{item.body}</p>
          <small>{current ? "CURRENT RUN" : "HISTORICAL RUN"} · {item.trace_id}</small>
          <footer><button onClick={() => openNotification(item)} disabled={busy === item.notification_id}>{current ? item.action === "system" ? "打开控制面" : "查看任务" : "标记已读"}</button><button onClick={() => sync(notificationApi.archive(item.notification_id), `archive:${item.notification_id}`)} disabled={!!busy}>归档</button></footer>
        </article>;
      }) : <div className="notification-empty"><i>∅</i><strong>没有待处理通知</strong><p>审批、等待、失败与验证结果会持久保存在这里。</p></div>}</div>
      <footer><i/><span>LOCAL SQLITE / PRIVATE INBOX</span></footer>
    </motion.aside>
  </>}</AnimatePresence>;
}
