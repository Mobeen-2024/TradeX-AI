import { create } from 'zustand';

export interface SystemIntelligence {
  quantAgent: any;
  riskGuardian: any;
  newsOracle: any;
  coordinator: any;
  activeStrategy: any;
  portfolioMetrics: any;
  systemStatus: string;
}

export interface AgentState {
  status: 'idle' | 'running' | 'completed' | 'error';
  lastMessage?: string;
}

export interface TraceInformation {
  correlationId: string;
  quant?: any;
  risk?: any;
  news?: any;
  coordinator?: any;
  evaluation?: any;
  outcome?: any;
} // Decision trace pipeline

interface SystemStore {
  // Global Identifiers
  activePortfolioId: string | null;
  setActivePortfolioId: (id: string | null) => void;
  
  // Traces & UI Focus
  selectedCorrelationId: string | null;
  setSelectedCorrelationId: (id: string | null) => void;
  
  // Intelligence State
  systemIntelligence: SystemIntelligence | null;
  setSystemIntelligence: (data: SystemIntelligence | null) => void;
  
  // Traces
  currentTrace: TraceInformation | null;
  setCurrentTrace: (trace: TraceInformation | null) => void;
  isLoadingTrace: boolean;
  setIsLoadingTrace: (loading: boolean) => void;
  
  // Live Events and Agent states
  livePipelineEvents: any[];
  addPipelineEvent: (event: any) => void;
  clearPipelineEvents: () => void;
  
  agentStates: Record<string, AgentState>;
  updateAgentState: (agentName: string, state: AgentState) => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  activePortfolioId: null,
  setActivePortfolioId: (id) => set({ activePortfolioId: id }),
  
  selectedCorrelationId: null,
  setSelectedCorrelationId: (id) => set({ selectedCorrelationId: id }),
  
  systemIntelligence: null,
  setSystemIntelligence: (data) => set({ systemIntelligence: data }),
  
  currentTrace: null,
  setCurrentTrace: (trace) => set({ currentTrace: trace }),
  isLoadingTrace: false,
  setIsLoadingTrace: (loading) => set({ isLoadingTrace: loading }),
  
  livePipelineEvents: [],
  addPipelineEvent: (event) => set((state) => ({ 
    livePipelineEvents: [event, ...state.livePipelineEvents].slice(0, 100) 
  })),
  clearPipelineEvents: () => set({ livePipelineEvents: [] }),
  
  agentStates: {
    QuantAgent: { status: 'idle' },
    RiskGuardian: { status: 'idle' },
    NewsOracle: { status: 'idle' },
    Coordinator: { status: 'idle' },
    ExecutionAgent: { status: 'idle' },
  },
  updateAgentState: (agentName, state) => set((prev) => ({
    agentStates: {
      ...prev.agentStates,
      [agentName]: state
    }
  }))
}));
