import type { DemoState, MemorySearchResult } from "@/types/agent";

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
