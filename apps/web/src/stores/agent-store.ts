import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentState, DemoState, PersonaConfig, ViewMode } from "@/types/agent";

type Store = {
  view: ViewMode;
  agentState: AgentState;
  activeOrbit: string | null;
  demo: DemoState | null;
  persona: PersonaConfig;
  personaStudioOpen: boolean;
  setView: (view: ViewMode) => void;
  setAgentState: (agentState: AgentState) => void;
  setActiveOrbit: (orbit: string | null) => void;
  setDemo: (demo: DemoState) => void;
  setPersona: (persona: Partial<PersonaConfig>) => void;
  setPersonaStudioOpen: (open: boolean) => void;
};

export const useAgentStore = create<Store>()(persist((set) => ({
  view: "self",
  agentState: "idle",
  activeOrbit: null,
  demo: null,
  persona: { name: "HAIPI", form: "human", finish: "matte", accent: "lichen", aura: 0.52 },
  personaStudioOpen: false,
  setView: (view) => set({ view }),
  setAgentState: (agentState) => set({ agentState }),
  setActiveOrbit: (activeOrbit) => set({ activeOrbit }),
  setDemo: (demo) => set({ demo }),
  setPersona: (persona) => set((state) => ({ persona: { ...state.persona, ...persona } })),
  setPersonaStudioOpen: (personaStudioOpen) => set({ personaStudioOpen }),
}), {
  name: "agentreach-persona",
  version: 2,
  migrate: () => ({ persona: { name: "HAIPI", form: "human", finish: "matte", accent: "lichen", aura: 0.52 } as PersonaConfig }),
  partialize: (state) => ({ persona: state.persona }),
}));
