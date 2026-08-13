"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  const [taskSection, setTaskSection] = useState(false);
  useEffect(() => {
    const update = () => setTaskSection(window.scrollY > window.innerHeight * .72);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const showHome = () => { setView("identity"); window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20); };
  const showTasks = () => { setView("identity"); window.setTimeout(() => { const target = document.getElementById("task-workspace"); if (!target) return; const top = target.offsetTop; window.scrollTo({ top, behavior: "smooth" }); window.setTimeout(() => { if (window.scrollY < top * .8) window.scrollTo({ top, behavior: "auto" }); }, 700); }, 20); };

  return <main className={`spatial-app view-${view} ${taskSection ? "section-task" : "section-identity"}`} data-plane={plane}>
    <nav><a href="#" className="brand" onClick={(event) => { event.preventDefault(); showHome(); }}><span><em>AGENT</em><b>REACH</b></span></a><div className="experience-rail identity-route" aria-label="首页章节"><button className={!taskSection ? "active" : ""} onClick={showHome}>01 / 智能体核心</button><b>/</b><button className={taskSection ? "active" : ""} onClick={showTasks}>02 / 任务空间</button></div><div className="nav-actions"><button className="nav-customize" onClick={() => openStudio(true)}>核心校准</button><button className={`nav-inbox ${notificationsOpen ? "active" : ""}`} aria-label={notificationsOpen ? "关闭通知中心" : `打开通知中心，${unread} 条未读`} onClick={() => { setNotificationsOpen(!notificationsOpen); setSystemOpen(false); }}><span>通知</span>{unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}</button><button className={`nav-menu ${systemOpen ? "active" : ""}`} aria-label={systemOpen ? "关闭系统控制面" : "打开系统控制面"} aria-expanded={systemOpen} onClick={() => { setSystemOpen(!systemOpen); setNotificationsOpen(false); }}><i/><i/></button></div></nav>
    {children}
    <footer><span>HAIPI 智能体 / 活跃</span><span>{view === "identity" ? "身份装载层" : `阶段 ${EXPERIENCE_PLANES.find(item => item.id === plane)?.label}`}</span><span>边界正常</span></footer>
  </main>;
}
