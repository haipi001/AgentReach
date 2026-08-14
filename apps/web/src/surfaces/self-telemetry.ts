import type { UISurfaceSchema } from "@agentreach/ui-schema";

export const SELF_TELEMETRY_SURFACE: UISurfaceSchema = {
  id: "self.telemetry",
  version: "1.0.0",
  surface: "halo",
  layout: "list",
  components: [{
    id: "runtime-telemetry",
    componentId: "telemetry-list",
    zone: "secondary",
    bindings: {
      stage: { source: "stage", fallback: "LOADING" },
      memories: { source: "memory.records", fallback: 0 },
      healthyConnectors: { source: "connectors.healthy", fallback: 0 },
      connectorTotal: { source: "connectors.total", fallback: 0 },
      growth: { source: "growth.points", fallback: [] },
      activity: { source: "activity.items", fallback: [] },
    },
  }],
};
