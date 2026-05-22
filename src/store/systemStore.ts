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
  strategyScores: StrategyMetrics[];
  agentStates: Record<string, AgentState>;
  telemetryFeed: TradeEvent[];
  wsConnected: boolean;

  // ACTIONS
  setActivePortfolio: (portfolio: PortfolioMetrics | null) => void;
  setPortfolios: (portfolios: PortfolioMetrics[]) => void;
  setGlobalMetrics: (metrics: GlobalMetrics) => void;
  setRiskState: (risk: RiskMetrics) => void;
  setStrategyScores: (scores: StrategyMetrics[]) => void;
  updateAgentState: (agent: string, state: AgentState) => void;
  addTelemetryEvent: (event: TradeEvent) => void;
  setWsConnected: (connected: boolean) => void;

  // LAYER 2: WEBSOCKET ORCHESTRATION
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
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
  strategyScores: [],
  agentStates: {
    QuantAgent: { status: "idle" },
    RiskGuardian: { status: "idle" },
    NewsOracle: { status: "idle" },
    Coordinator: { status: "idle" },
    ExecutionAgent: { status: "idle" },
  },
  telemetryFeed: [],
  wsConnected: false,

  setActivePortfolio: (portfolio) => set({ activePortfolio: portfolio }),
  setPortfolios: (portfolios) => set({ portfolios }),
  setGlobalMetrics: (metrics) => set({ globalMetrics: metrics }),
  setRiskState: (risk) => set({ riskState: risk }),
  setStrategyScores: (scores) => set({ strategyScores: scores }),

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

            // Append telemetry
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
          }

          if (data.type === "METRICS_UPDATE" && data.payload) {
            if (data.payload.globalMetrics)
              get().setGlobalMetrics(data.payload.globalMetrics);
            if (data.payload.portfolios)
              get().setPortfolios(data.payload.portfolios);
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
