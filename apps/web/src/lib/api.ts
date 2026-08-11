import type { DemoState } from "@/types/agent";

const API = process.env.NEXT_PUBLIC_AGENTREACH_API ?? "http://127.0.0.1:8765";

async function request(path: string, body?: unknown): Promise<DemoState> {
  const response = await fetch(`${API}${path}`, {
    method: path === "/api/demo" ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? "Protocol request failed");
  return data;
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
};
