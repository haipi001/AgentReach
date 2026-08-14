import type { UISurfaceSchema } from "@agentreach/ui-schema";

const approval = (id: string, mode: string, approve: string, reject?: string) => ({
  id,
  componentId: "approval-surface",
  zone: "primary" as const,
  visibility: { when: "approval.mode", equals: mode },
  bindings: {
    title: { source: "approval.title", fallback: "等待你的确认" },
    summary: { source: "approval.summary", fallback: "请检查将要披露或执行的内容。" },
    details: { source: "approval.details", fallback: [] },
    level: { source: "approval.level", fallback: "三级强确认" },
    busy: { source: "approval.busy", fallback: false },
    error: { source: "approval.error", fallback: "" },
  },
  props: { approveLabel: mode === "commitment" ? "执行并验证" : mode === "peer" ? "代表 Alice 接受" : "批准并触达", rejectLabel: reject ? "拒绝" : "暂不批准" },
  actions: [
    { event: "approve", command: approve, approval: "strong" as const },
    ...(reject ? [{ event: "reject", command: reject, approval: "strong" as const }] : []),
  ],
});

export const WORKSPACE_APPROVAL_SURFACE: UISurfaceSchema = {
  id: "workspace.approval",
  version: "1.0.0",
  surface: "workspace",
  layout: "list",
  components: [
    approval("introduction-gate", "introduction", "protected.approval.introduction.approve"),
    approval("peer-gate", "peer", "protected.approval.peer.approve", "protected.approval.peer.reject"),
    approval("commitment-gate", "commitment", "protected.approval.commitment.approve"),
  ],
};
