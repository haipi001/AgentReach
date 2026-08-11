"use client";

import type { ReactNode } from "react";
import { EXPERIENCE_PLANES, resolveExperiencePlane } from "@/experience/experience-model";
import { useAgentStore } from "@/stores/agent-store";

export function ExperienceFrame({ children }: { children: ReactNode }) {
  const view = useAgentStore((state) => state.view);
  const agentState = useAgentStore((state) => state.agentState);
  const openStudio = useAgentStore((state) => state.setPersonaStudioOpen);
  const systemOpen = useAgentStore((state) => state.systemPanelOpen);
  const setSystemOpen = useAgentStore((state) => state.setSystemPanelOpen);
  const notificationsOpen = useAgentStore((state) => state.notificationCenterOpen);
  const setNotificationsOpen = useAgentStore((state) => state.setNotificationCenterOpen);
  const unread = useAgentStore((state) => state.demo?.notification_runtime.unread ?? 0);
  const setView = useAgentStore((state) => state.setView);
  const plane = resolveExperiencePlane(view, agentState);

  return <main className={`spatial-app view-${view}`} data-plane={plane}>
    <nav><a href="#" className="brand" onClick={(event) => { event.preventDefault(); setView("identity"); }}><span><em>AGENT</em><b>REACH</b></span></a><div className="experience-rail identity-route" aria-label="产品层级"><button className={view === "identity" ? "active" : ""} onClick={() => setView("identity")}>AI / 身份装载</button><b>/</b><button className={view !== "identity" ? "active" : ""} onClick={() => setView("self")}>TASKS / 执行空间</button></div><div className="nav-actions"><button className="nav-customize" onClick={() => openStudio(true)}>自定义</button><button className={`nav-inbox ${notificationsOpen ? "active" : ""}`} aria-label={notificationsOpen ? "关闭通知中心" : `打开通知中心，${unread} 条未读`} onClick={() => { setNotificationsOpen(!notificationsOpen); setSystemOpen(false); }}><span>INBOX</span>{unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}</button><button className={`nav-menu ${systemOpen ? "active" : ""}`} aria-label={systemOpen ? "关闭系统控制面" : "打开系统控制面"} aria-expanded={systemOpen} onClick={() => { setSystemOpen(!systemOpen); setNotificationsOpen(false); }}><i/><i/></button></div></nav>
    {children}
    <footer><span>HAIPI 智能体 / 活跃</span><span>{view === "identity" ? "身份装载层" : `阶段 ${EXPERIENCE_PLANES.find(item => item.id === plane)?.label}`}</span><span>边界正常</span></footer>
  </main>;
}
