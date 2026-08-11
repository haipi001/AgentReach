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
  systemPanelOpen: boolean;
  avatarAsset: { url: string; name: string } | null;
  setView: (view: ViewMode) => void;
  setAgentState: (agentState: AgentState) => void;
  setActiveOrbit: (orbit: string | null) => void;
  setDemo: (demo: DemoState) => void;
  setPersona: (persona: Partial<PersonaConfig>) => void;
  setPersonaStudioOpen: (open: boolean) => void;
  setSystemPanelOpen: (open: boolean) => void;
  setAvatarAsset: (asset: { url: string; name: string } | null) => void;
};

export const useAgentStore = create<Store>()(persist((set) => ({
  view: "self",
  agentState: "idle",
  activeOrbit: null,
  demo: null,
  persona: { name: "HAIPI", form: "human", finish: "matte", accent: "lichen", aura: 0.52, face: { shape: "oval", skin: "warm", eyes: "charcoal", hairStyle: "hood", hairColor: "ink" } },
  personaStudioOpen: false,
  systemPanelOpen: false,
  avatarAsset: null,
  setView: (view) => set({ view }),
  setAgentState: (agentState) => set({ agentState }),
  setActiveOrbit: (activeOrbit) => set({ activeOrbit }),
  setDemo: (demo) => set({ demo }),
  setPersona: (persona) => set((state) => ({ persona: { ...state.persona, ...persona } })),
  setPersonaStudioOpen: (personaStudioOpen) => set({ personaStudioOpen }),
  setSystemPanelOpen: (systemPanelOpen) => set({ systemPanelOpen }),
  setAvatarAsset: (avatarAsset) => set({ avatarAsset }),
}), {
  name: "agentreach-persona",
  version: 3,
  migrate: (persisted) => {
    const prior = (persisted as { persona?: Partial<PersonaConfig> })?.persona ?? {};
    return { persona: { name: prior.name ?? "HAIPI", form: prior.form ?? "human", finish: prior.finish ?? "matte", accent: prior.accent ?? "lichen", aura: prior.aura ?? 0.52, face: { shape: "oval", skin: "warm", eyes: "charcoal", hairStyle: "hood", hairColor: "ink", ...prior.face } } as PersonaConfig };
  },
  partialize: (state) => ({ persona: state.persona }),
}));
