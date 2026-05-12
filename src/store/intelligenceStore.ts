import { create } from 'zustand';

interface IntelligenceStore {
  activeRegime: 'bull' | 'bear' | 'neutral' | 'volatile';
  setActiveRegime: (regime: 'bull' | 'bear' | 'neutral' | 'volatile') => void;
  globalLatency: number;
  setGlobalLatency: (latency: number) => void;
  aiOverrideActive: boolean;
  setAiOverrideActive: (active: boolean) => void;
}

export const useIntelligenceStore = create<IntelligenceStore>((set) => ({
  activeRegime: 'bull',
  setActiveRegime: (regime) => set({ activeRegime: regime }),
  globalLatency: 14,
  setGlobalLatency: (latency) => set({ globalLatency: latency }),
  aiOverrideActive: false,
  setAiOverrideActive: (active) => set({ aiOverrideActive: active })
}));
