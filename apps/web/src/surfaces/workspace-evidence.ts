import type { UISurfaceSchema } from "@agentreach/ui-schema";

export const WORKSPACE_EVIDENCE_SURFACE: UISurfaceSchema = {
  id: "workspace.evidence",
  version: "1.0.0",
  surface: "workspace",
  layout: "list",
  components: [{
    id: "evidence-readout",
    componentId: "evidence-panel",
    zone: "evidence",
    bindings: {
      verdict: { source: "verification.verdict", fallback: "尚未运行" },
      worldChanged: { source: "world.changed", fallback: false },
      traceId: { source: "trace.id", fallback: "暂无轨迹" },
      trace: { source: "trace.latest", fallback: [] },
      denialCount: { source: "boundary.denials", fallback: 0 },
    },
    props: { title: "独立验证器", boundaryTitle: "默认私密" },
  }],
};
