import type { DemoState, MemorySearchResult, NotificationResult } from "@/types/agent";

const API = process.env.NEXT_PUBLIC_AGENTREACH_API ?? "http://127.0.0.1:8765";

async function readSnapshot(): Promise<DemoState> {
  const response = await fetch(`${API}/api/demo`, { cache: "no-store" });
  if (!response.ok) throw new Error("无法读取 Personal Agent 的权威状态");
  return response.json();
}

async function request(path: string, body?: unknown): Promise<DemoState> {
  const isRead = path === "/api/demo";
  if (isRead) return readSnapshot();
  try {
    const response = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail ?? "协议请求失败");
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      return readSnapshot();
    }
    throw error;
  }
}

export const demoApi = {
  get: () => request("/api/demo"),
  reset: () => request("/api/demo/reset"),
  intent: (text: string) => request("/api/demo/intent", { request: text }),
  startTask: (text: string) => request("/api/runtime/start", { request: text }),
  discover: () => request("/api/demo/discover"),
  select: (candidateId: string) => request("/api/demo/select", { candidate_id: candidateId }),
  approveIntro: () => request("/api/demo/approve-introduction"),
  peerDecision: (accepted: boolean) => request("/api/demo/peer-decision", { accepted }),
  approveCommitment: () => request("/api/demo/approve-commitment"),
  privacyAttack: () => request("/api/demo/privacy-attack"),
  pauseRun: () => request("/api/runtime/pause"),
  resumeRun: () => request("/api/runtime/resume"),
  cancelRun: () => request("/api/runtime/cancel"),
  retryRun: () => request("/api/runtime/retry"),
  processNextJob: () => request("/api/runtime/jobs/process-next"),
  retryJob: (jobId: string) => request("/api/runtime/jobs/retry", { job_id: jobId }),
  checkConnector: (connectorId: string) => request("/api/connectors/check", { connector_id: connectorId }),
  toggleConnector: (connectorId: string, enabled: boolean) => request("/api/connectors/toggle", { connector_id: connectorId, enabled }),
  revokeConnectorGrant: (connectorId: string) => request("/api/connectors/revoke-grant", { connector_id: connectorId }),
};

async function memoryRequest(path: string, body: unknown): Promise<MemorySearchResult> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? "Memory 请求失败");
  return data;
}

export const memoryApi = {
  search: (query = "") => memoryRequest("/api/memory/search", { query }),
  forget: (memoryId: string) => memoryRequest("/api/memory/forget", { memory_id: memoryId }),
};

async function notificationRequest(path: string, body?: unknown): Promise<NotificationResult> {
  const response = await fetch(`${API}${path}`, {
    method: body === undefined && path === "/api/notifications" ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? "通知请求失败");
  return data;
}

export const notificationApi = {
  list: () => notificationRequest("/api/notifications"),
  read: (notificationId: string) => notificationRequest("/api/notifications/read", { notification_id: notificationId }),
  readAll: () => notificationRequest("/api/notifications/read-all", {}),
  archive: (notificationId: string) => notificationRequest("/api/notifications/archive", { notification_id: notificationId }),
};
