export type SurfaceKind = "orb" | "halo" | "workspace";
export type LayoutKind = "spatial-orbit" | "spatial-field" | "workspace-grid" | "list";
export type SurfaceZone = "center" | "orbit" | "header" | "primary" | "secondary" | "evidence" | "footer";

export interface UIDataBinding { source: string; select?: string; fallback?: unknown }
export interface UIActionBinding { event: string; command: string; approval?: "none" | "standard" | "strong" }
export interface UIVisibilityRule { when: string; equals?: unknown; exists?: boolean }
export interface UISurfaceComponent {
  id: string;
  componentId: string;
  zone: SurfaceZone;
  weight?: number;
  visible?: boolean;
  bindings?: Readonly<Record<string, UIDataBinding>>;
  actions?: readonly UIActionBinding[];
  visibility?: UIVisibilityRule;
  props?: Readonly<Record<string, unknown>>;
}
export interface UISurfaceSchema {
  id: string;
  version: string;
  surface: SurfaceKind;
  layout: LayoutKind;
  centerComponent?: string | null;
  components: readonly UISurfaceComponent[];
}
export type SchemaIssue = { path: string; message: string };
export type SchemaResult = { success: true; value: UISurfaceSchema } | { success: false; issues: SchemaIssue[] };

const surfaces: readonly SurfaceKind[] = ["orb", "halo", "workspace"];
const layouts: readonly LayoutKind[] = ["spatial-orbit", "spatial-field", "workspace-grid", "list"];
const zones: readonly SurfaceZone[] = ["center", "orbit", "header", "primary", "secondary", "evidence", "footer"];
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export function validateSurfaceSchema(input: unknown): SchemaResult {
  const issues: SchemaIssue[] = [];
  if (!isRecord(input)) return { success: false, issues: [{ path: "$", message: "surface must be an object" }] };
  for (const key of ["id", "version"] as const) if (typeof input[key] !== "string" || !input[key]) issues.push({ path: `$.${key}`, message: "must be a non-empty string" });
  if (!surfaces.includes(input.surface as SurfaceKind)) issues.push({ path: "$.surface", message: "must be orb, halo, or workspace" });
  if (!layouts.includes(input.layout as LayoutKind)) issues.push({ path: "$.layout", message: "unsupported layout" });
  if (!Array.isArray(input.components)) issues.push({ path: "$.components", message: "must be an array" });
  else input.components.forEach((component, index) => {
    if (!isRecord(component)) { issues.push({ path: `$.components[${index}]`, message: "must be an object" }); return; }
    if (typeof component.id !== "string" || !component.id) issues.push({ path: `$.components[${index}].id`, message: "must be a non-empty string" });
    if (typeof component.componentId !== "string" || !component.componentId) issues.push({ path: `$.components[${index}].componentId`, message: "must be a non-empty string" });
    if (!zones.includes(component.zone as SurfaceZone)) issues.push({ path: `$.components[${index}].zone`, message: "unsupported zone" });
    if (component.actions !== undefined && !Array.isArray(component.actions)) issues.push({ path: `$.components[${index}].actions`, message: "must be an array" });
  });
  return issues.length ? { success: false, issues } : { success: true, value: input as unknown as UISurfaceSchema };
}
