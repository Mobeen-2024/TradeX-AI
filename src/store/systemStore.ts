import { create } from "zustand";
import {
  GlobalMetrics,
  PortfolioMetrics,
  StrategyMetrics,
  RiskMetrics,
  AgentState,
  TradeEvent,
} from "../types";

interface SystemState {
  // LAYER 1: GLOBAL UI STATE
  activePortfolio: PortfolioMetrics | null;
  portfolios: PortfolioMetrics[];
  globalMetrics: GlobalMetrics;
  riskState: RiskMetrics;
  strategyScores: Record<string, StrategyMetrics>;
  agentStates: Record<string, AgentState>;
  telemetryFeed: TradeEvent[];
  wsConnected: boolean;
  activeCorrelationId: string | null;

  // LAYER 3: SIMULATION & OVERRIDES
  isSimulationMode: boolean;
  overrideState: {
    action: "BUY" | "SELL" | "HOLD" | null;
    sizeMultiplier: number;
    riskMode: "CONSERVATIVE" | "NORMAL" | "AGGRESSIVE";
  };
  strategyOverrides: Record<
    string,
    { weightMultiplier: number; enabled: boolean }
  >;
  riskOverrides: {
    drawdownCap: number;
    volSensitivity: number;
    emergencyThrottle: number;
  };

  // LAYER 4: FEEDBACK & ADAPTATION
  overrideHistory: {
    id: string;
    correlationId: string;
    timestamp: number;
    aiDecision: string;
    userOverride: string | null;
    strategyId: string;
    regime: string;
    simulatedOutcome: number;
    actualOutcome: number | null;
  }[];

  // LAYER 5: AUDIT & GOVERNANCE
  lockOverrides: boolean;
  sessionSnapshot: any | null;

  // ACTIONS
  setActivePortfolio: (portfolio: PortfolioMetrics | null) => void;
  setLockOverrides: (locked: boolean) => void;
  saveSessionSnapshot: () => void;
  loadSessionSnapshot: () => void;
  setPortfolios: (portfolios: PortfolioMetrics[]) => void;
  setGlobalMetrics: (metrics: GlobalMetrics) => void;
  setRiskState: (risk: RiskMetrics) => void;
  setStrategyScores: (scores: Record<string, StrategyMetrics>) => void;
  updateAgentState: (agent: string, state: AgentState) => void;
  addTelemetryEvent: (event: TradeEvent) => void;
  setWsConnected: (connected: boolean) => void;
  setActiveCorrelationId: (id: string | null) => void;
  setIsSimulationMode: (mode: boolean) => void;
  setOverrideState: (overrides: Partial<SystemState["overrideState"]>) => void;
  setStrategyOverride: (
    strategyId: string,
    overrides: Partial<SystemState["strategyOverrides"][string]>,
  ) => void;
  setRiskOverride: (overrides: Partial<SystemState["riskOverrides"]>) => void;
  addOverrideRecord: (record: SystemState["overrideHistory"][0]) => void;

  // LAYER 2: WEBSOCKET ORCHESTRATION & INITIALIZATION
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  fetchInitialData: () => Promise<void>;
}

let wsSocket: WebSocket | null = null;

export const useSystemStore = create<SystemState>((set, get) => ({
  activePortfolio: null,
  portfolios: [],
  globalMetrics: {
    totalPnl: 0,
    globalDrawdown: 0,
    winRate: 0,
    sharpeRatio: 0,
    totalCapital: 0,
    totalExposure: 0,
  },
  riskState: {
    state: "NORMAL",
    drawdown: 0,
    volatility: 0,
    riskMultiplier: 1.0,
  },
  strategyScores: {},
  agentStates: {
    QuantAgent: { status: "idle" },
    RiskGuardian: { status: "idle" },
    NewsOracle: { status: "idle" },
    Coordinator: { status: "idle" },
    ExecutionAgent: { status: "idle" },
  },
  telemetryFeed: [],
  wsConnected: false,
  activeCorrelationId: null,
  isSimulationMode: false,
  overrideState: {
    action: null,
    sizeMultiplier: 1.0,
    riskMode: "NORMAL",
  },
  strategyOverrides: {},
  riskOverrides: {
    drawdownCap: 10.0,
    volSensitivity: 1.0,
    emergencyThrottle: 1.0,
  },
  overrideHistory: [],
  lockOverrides: false,
  sessionSnapshot: null,

  setActivePortfolio: (portfolio) => set({ activePortfolio: portfolio }),
  setLockOverrides: (locked) => set({ lockOverrides: locked }),
  saveSessionSnapshot: () =>
    set((state) => ({
      sessionSnapshot: {
        strategyOverrides: state.strategyOverrides,
        riskOverrides: state.riskOverrides,
        isSimulationMode: state.isSimulationMode,
        overrideHistory: state.overrideHistory,
        timestamp: Date.now(),
      },
    })),
  loadSessionSnapshot: () =>
    set((state) => {
      if (!state.sessionSnapshot) return state;
      return {
        strategyOverrides: state.sessionSnapshot.strategyOverrides,
        riskOverrides: state.sessionSnapshot.riskOverrides,
        isSimulationMode: state.sessionSnapshot.isSimulationMode,
        overrideHistory: state.sessionSnapshot.overrideHistory,
      };
    }),
  setPortfolios: (portfolios) => set({ portfolios }),
  setGlobalMetrics: (metrics) => set({ globalMetrics: metrics }),
  setRiskState: (risk) => set({ riskState: risk }),
  setStrategyScores: (scores) => set({ strategyScores: scores }),
  setActiveCorrelationId: (id) => set({ activeCorrelationId: id }),
  setIsSimulationMode: (mode) => set({ isSimulationMode: mode }),
  setOverrideState: (overrides) =>
    set((state) => ({
      overrideState: { ...state.overrideState, ...overrides },
    })),
  setStrategyOverride: (strategyId, overrides) =>
    set((state) => ({
      strategyOverrides: {
        ...state.strategyOverrides,
        [strategyId]: {
          ...(state.strategyOverrides[strategyId] || {
            weightMultiplier: 1.0,
            enabled: true,
          }),
          ...overrides,
        },
      },
    })),
  setRiskOverride: (overrides) =>
    set((state) => ({
      riskOverrides: { ...state.riskOverrides, ...overrides },
    })),
  addOverrideRecord: (record) => {
    set((state) => ({ overrideHistory: [record, ...state.overrideHistory] }));
    // Persist to backend without blocking UI
    fetch("/api/overrides/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).catch((err) => console.error("Failed to persist override log", err));
  },

  updateAgentState: (agent, state) =>
    set((prev) => ({
      agentStates: {
        ...prev.agentStates,
        [agent]: { ...prev.agentStates[agent], ...state },
      },
    })),

  addTelemetryEvent: (event) =>
    set((state) => {
      const newFeed = [event, ...state.telemetryFeed].slice(0, 100);
      return { telemetryFeed: newFeed };
    }),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  fetchInitialData: async () => {
    try {
      // 1. Fetch Portfolios
      const portRes = await fetch("/api/portfolio/me");
      if (portRes.ok) {
        const data = await portRes.json();
        if (data.portfolios && data.portfolios.length > 0) {
          get().setPortfolios(data.portfolios);
          get().setActivePortfolio(data.portfolios[0]);

          // Populate global metrics roughly from the first portfolio
          const p = data.portfolios[0];
          get().setGlobalMetrics({
            totalPnl: p.totalRealizedPnl + p.totalUnrealizedPnl,
            globalDrawdown: p.maxDrawdown || 0,
            winRate: p.winRate || 0,
            sharpeRatio: p.sharpeRatio || 0,
            totalCapital: p.cash + (p.totalValue || 0),
            totalExposure: p.totalValue || 0,
          });
        }
      }

      // 2. Fetch Risk State
      const riskRes = await fetch("/api/intelligence/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (riskRes.ok) {
        const riskData = await riskRes.json();
        if (riskData.riskState) {
          get().setRiskState(riskData.riskState);
        }
      }

      // 3. Fetch Strategy / Intelligence (mocked endpoint or backtest if available, assuming events/recent acts as a general pulse)
      const eventsRes = await fetch("/api/events/recent");
      if (eventsRes.ok) {
        const evData = await eventsRes.json();
        // This doesn't strictly set strategy scores yet, just prewarms the API cache
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    }
  },

  connectWebSocket: () => {
    if (wsSocket) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/agent-telemetry`;
      wsSocket = new WebSocket(wsUrl);

      wsSocket.onopen = () => {
        get().setWsConnected(true);
      };

      wsSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "AGENT_UPDATE" && data.payload) {
            get().updateAgentState(data.payload.agent, data.payload.state);

            get().addTelemetryEvent({
              id: Math.random().toString(36).substring(7),
              type: "AGENT_DECISION",
              message: `${data.payload.agent}: ${data.payload.state.lastMessage || "Status updated"}`,
              timestamp: Date.now(),
            });
          }

          if (data.type === "EXECUTION_UPDATE" && data.payload) {
            get().addTelemetryEvent({
              id: Math.random().toString(36).substring(7),
              type: "EXECUTION",
              message: data.payload.message || "Execution event",
              timestamp: Date.now(),
            });

            // Re-fetch portfolios on execution updates to keep UI perfectly in sync
            get().fetchInitialData();
          }

          if (data.type === "METRICS_UPDATE" && data.payload) {
            if (data.payload.globalMetrics)
              get().setGlobalMetrics(data.payload.globalMetrics);
            if (data.payload.portfolios) {
              get().setPortfolios(data.payload.portfolios);
              // Keep active portfolio reference updated
              const currentActive = get().activePortfolio;
              if (currentActive) {
                const updatedActive = data.payload.portfolios.find(
                  (p: any) => p.id === currentActive.id,
                );
                if (updatedActive) get().setActivePortfolio(updatedActive);
              }
            }
            if (data.payload.riskState)
              get().setRiskState(data.payload.riskState);
            if (data.payload.strategyScores)
              get().setStrategyScores(data.payload.strategyScores);
          }
        } catch (e) {
          console.error("WebSocket parse error", e);
        }
      };

      wsSocket.onclose = () => {
        get().setWsConnected(false);
        wsSocket = null;
        // Optional: Reconnect logic
      };
    } catch (e) {
      console.error("Failed to connect WebSocket", e);
    }
  },

  disconnectWebSocket: () => {
    if (wsSocket) {
      wsSocket.close();
      wsSocket = null;
    }
  },
}));
