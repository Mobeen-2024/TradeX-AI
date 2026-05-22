import { create } from "zustand";
import {
  GlobalMetrics,
  PortfolioMetrics,
  StrategyMetrics,
  RiskMetrics,
  AgentState,
  TradeEvent,
  SystemInsight,
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

  // LAYER 6: STRATEGIC GUIDANCE
  systemInsights: SystemInsight[];
  generateInsights: () => void;

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
  systemInsights: [],

  generateInsights: () =>
    set((state) => {
      const insights: SystemInsight[] = [];

      // 1. Analyze Override History
      if (state.overrideHistory.length >= 2) {
        const overrides = state.overrideHistory.filter((h) => h.userOverride);
        const userWins = overrides.filter(
          (h) => h.actualOutcome && h.actualOutcome > 0,
        ).length;
        const userTotal = overrides.length;

        if (userTotal > 0 && userWins / userTotal >= 0.6) {
          insights.push({
            id: "insight-override-outperform",
            description:
              "User overrides are outperforming AI autonomous decisions.",
            affectedComponent: "EXECUTION",
            confidence: 85,
            priority: "MEDIUM",
            suggestedAction:
              "Consider adjusting base AI models or maintain manual supervision.",
          });
        } else if (userTotal > 0 && userWins / userTotal <= 0.4) {
          insights.push({
            id: "insight-override-underperform",
            description:
              "User overrides are statistically degrading system performance.",
            affectedComponent: "EXECUTION",
            confidence: 90,
            priority: "HIGH",
            suggestedAction:
              "Trust AI autonomous decisions and reduce manual interventions.",
          });
        }
      }

      // 2. Analyze Risk State
      if (state.riskState.drawdown > 15) {
        insights.push({
          id: "insight-risk-drawdown",
          description:
            "System drawdown is approaching critical threshold limits.",
          affectedComponent: "RISK",
          confidence: 95,
          priority: "HIGH",
          suggestedAction:
            "Immediate risk reduction. Consider tightening risk sensitivity.",
        });
      }

      if (state.riskState.volatility > 5) {
        insights.push({
          id: "insight-risk-volatility",
          description:
            "High market volatility detected across portfolio assets.",
          affectedComponent: "RISK",
          confidence: 80,
          priority: "MEDIUM",
          suggestedAction:
            "Increase risk sensitivity and prepare for market whipsaw.",
        });
      }

      // 3. Analyze Strategy Scores
      const degradingStrategies = Object.entries(state.strategyScores).filter(
        ([k, v]) => v.winRate < 40 && (v.totalTrades ?? 0) > 5,
      );

      degradingStrategies.forEach(([k, v]) => {
        insights.push({
          id: `insight-strategy-degrading-${k}`,
          description: `Strategy ${k} is exhibiting sustained underperformance.`,
          affectedComponent: "STRATEGY",
          confidence: 88,
          priority: v.winRate < 30 ? "HIGH" : "MEDIUM",
          suggestedAction: "Reduce allocation or disable strategy.",
          targetId: k,
        });
      });

      const sortedInsights = insights.sort((a, b) => {
        const pMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (pMap[a.priority] !== pMap[b.priority])
          return pMap[b.priority] - pMap[a.priority];
        return b.confidence - a.confidence;
      });

      return { systemInsights: sortedInsights.slice(0, 3) };
    }),

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
  setRiskState: (risk) => {
    set({ riskState: risk });
    get().generateInsights();
  },
  setStrategyScores: (scores) => {
    set({ strategyScores: scores });
    get().generateInsights();
  },
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
    get().generateInsights();
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

          // Legacy formats if any exist
          if (data.type === "AGENT_UPDATE" && data.payload) {
            get().updateAgentState(data.payload.agent, data.payload.state);

            get().addTelemetryEvent({
              id: crypto.randomUUID(),
              type: "AGENT_DECISION",
              message: `${data.payload.agent}: ${data.payload.state.lastMessage || "Status updated"}`,
              timestamp: Date.now(),
            });
          }

          if (data.type === "EXECUTION_UPDATE" && data.payload) {
            get().addTelemetryEvent({
              id: crypto.randomUUID(),
              type: "EXECUTION",
              message: data.payload.message || "Execution event",
              timestamp: Date.now(),
            });

            get().fetchInitialData();
          }

          if (data.type === "METRICS_UPDATE" && data.payload) {
            if (data.payload.globalMetrics)
              get().setGlobalMetrics(data.payload.globalMetrics);
            if (data.payload.portfolios) {
              get().setPortfolios(data.payload.portfolios);
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

          // Unified Event Mapping from Backend TelemetryServer
          if (data.eventType) {
            const agentMapping: Record<string, string> = {
              QuantAgent: "QuantAgent",
              RiskGuardian: "RiskGuardian",
              NewsOracle: "NewsOracle",
              Coordinator: "Coordinator",
              ExecutionAgent: "ExecutionAgent",
            };

            const agentId = agentMapping[data.agent_name];
            if (agentId) {
              get().updateAgentState(agentId, {
                status: data.status === "completed" ? "idle" : "running",
                lastMessage: data.summary,
              });
            }

            if (data.eventType === "ORDER_EXECUTED") {
              get().addTelemetryEvent({
                id: crypto.randomUUID(),
                type: "EXECUTION",
                message: data.summary || "Order Executed",
                timestamp: new Date(data.timestamp).getTime(),
              });
              get().fetchInitialData();
            } else {
              get().addTelemetryEvent({
                id: crypto.randomUUID(),
                type: "AGENT_DECISION",
                message: `[${data.agent_name}] ${data.summary}`,
                timestamp: new Date(data.timestamp).getTime(),
              });
            }

            // Pull specific state objects if we completed a risk or quant task
            if (data.eventType === "RISK_VALIDATED") {
              // Can re-fetch risk specifically here, or let initial fetch handle
              get().fetchInitialData();
            }
          }
        } catch (e) {
          console.error("WebSocket parse error", e);
        }
      };

      // Reconnect logic
      wsSocket.onclose = () => {
        get().setWsConnected(false);
        wsSocket = null;
        setTimeout(() => {
          const state = get();
          if (!state.wsConnected) state.connectWebSocket();
        }, 5000);
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
