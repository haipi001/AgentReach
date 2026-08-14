import type { SurfaceKind } from "@agentreach/ui-schema";
export type ComponentRisk = "safe" | "guarded" | "restricted" | "protected";
export interface ComponentManifest { id:string; version:string; category:"core"|"entity"|"capability"|"intent"|"action"|"approval"|"evidence"|"engineering"; allowedSurfaces:readonly SurfaceKind[]; risk:ComponentRisk; protected:boolean; evolvable:boolean; accessibility:boolean; events:readonly string[] }
export class ComponentRegistry<T> {
  readonly #entries = new Map<string,{manifest:ComponentManifest;component:T}>();
  register(manifest:ComponentManifest,component:T):void { if(this.#entries.has(manifest.id)) throw new Error(`component already registered: ${manifest.id}`); if(manifest.protected&&manifest.evolvable) throw new Error(`protected component cannot be evolvable: ${manifest.id}`); if(!manifest.accessibility) throw new Error(`component must declare accessibility support: ${manifest.id}`); this.#entries.set(manifest.id,{manifest:Object.freeze({...manifest}),component}); }
  resolve(id:string,surface:SurfaceKind):T { const entry=this.#entries.get(id); if(!entry) throw new Error(`unknown component: ${id}`); if(!entry.manifest.allowedSurfaces.includes(surface)) throw new Error(`component ${id} is not allowed on ${surface}`); return entry.component; }
  manifest(id:string):ComponentManifest|undefined { return this.#entries.get(id)?.manifest; }
  list():readonly ComponentManifest[] { return [...this.#entries.values()].map(entry=>entry.manifest); }
}
export const CORE_MANIFESTS:readonly ComponentManifest[]=[
  {id:"agent-orb",version:"1.0.0",category:"core",allowedSurfaces:["orb","halo","workspace"],risk:"safe",protected:false,evolvable:true,accessibility:true,events:["focus","open"]},
  {id:"entity-node",version:"1.0.0",category:"entity",allowedSurfaces:["halo","workspace"],risk:"safe",protected:false,evolvable:true,accessibility:true,events:["inspect"]},
  {id:"action-preview",version:"1.0.0",category:"action",allowedSurfaces:["halo","workspace"],risk:"restricted",protected:true,evolvable:false,accessibility:true,events:["request-approval","cancel"]},
  {id:"approval-surface",version:"1.0.0",category:"approval",allowedSurfaces:["halo","workspace"],risk:"protected",protected:true,evolvable:false,accessibility:true,events:["approve","reject"]},
  {id:"context-capsule",version:"1.0.0",category:"approval",allowedSurfaces:["halo","workspace"],risk:"protected",protected:true,evolvable:false,accessibility:true,events:["approve","reject"]},
  {id:"evidence-panel",version:"1.0.0",category:"evidence",allowedSurfaces:["halo","workspace"],risk:"guarded",protected:true,evolvable:false,accessibility:true,events:["inspect"]},
  {id:"telemetry-list",version:"1.0.0",category:"engineering",allowedSurfaces:["halo","workspace"],risk:"safe",protected:false,evolvable:true,accessibility:true,events:[]}
] as const;
