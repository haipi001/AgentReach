import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentState, DemoState, PersonaConfig, SurfaceDestination, ViewMode } from "@/types/agent";

type Store = {
  view: ViewMode;
  agentState: AgentState;
  activeOrbit: string | null;
  demo: DemoState | null;
  persona: PersonaConfig;
  personaStudioOpen: boolean;
  systemPanelOpen: boolean;
  notificationCenterOpen: boolean;
  surface: SurfaceDestination;
  setView: (view: ViewMode) => void;
  setAgentState: (agentState: AgentState) => void;
  setActiveOrbit: (orbit: string | null) => void;
  setDemo: (demo: DemoState) => void;
  setPersona: (persona: Partial<PersonaConfig>) => void;
  setPersonaStudioOpen: (open: boolean) => void;
  setSystemPanelOpen: (open: boolean) => void;
  setNotificationCenterOpen: (open: boolean) => void;
  navigate: (surface: SurfaceDestination) => void;
};

export const useAgentStore = create<Store>()(persist((set) => ({
  view: "identity",
  agentState: "idle",
  activeOrbit: null,
  demo: null,
  persona: { name: "HAIPI", finish: "chrome", accent: "lichen", aura: 0.72 },
  personaStudioOpen: false,
  systemPanelOpen: false,
  notificationCenterOpen: false,
  surface: { kind: "self" },
  setView: (view) => set({ view }),
  setAgentState: (agentState) => set({ agentState }),
  setActiveOrbit: (activeOrbit) => set({ activeOrbit }),
  setDemo: (demo) => set({ demo }),
  setPersona: (persona) => set((state) => ({ persona: { ...state.persona, ...persona } })),
  setPersonaStudioOpen: (personaStudioOpen) => set({ personaStudioOpen }),
  setSystemPanelOpen: (systemPanelOpen) => set({ systemPanelOpen }),
  setNotificationCenterOpen: (notificationCenterOpen) => set({ notificationCenterOpen }),
  navigate: (surface) => set({
    surface,
    view: "identity",
    activeOrbit: surface.kind === "dimension" ? surface.id.toUpperCase() : null,
    systemPanelOpen: surface.kind === "system",
  }),
}), {
  name: "agentreach-persona",
  version: 4,
  migrate: (persisted) => {
    const prior = (persisted as { persona?: Partial<PersonaConfig> })?.persona ?? {};
    return { persona: { name: prior.name ?? "HAIPI", finish: prior.finish ?? "chrome", accent: prior.accent ?? "lichen", aura: prior.aura ?? 0.72 } as PersonaConfig };
  },
  partialize: (state) => ({ persona: state.persona }),
}));
