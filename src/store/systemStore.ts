import { create } from "zustand";
import { useToastStore } from "./toastStore";
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
  savedSnapshots: { id: string; label: string; created_at: string }[];
  systemHealth: {
    dbConnected: boolean;
    dbLatencyMs: number;
    wsClientCount: number;
    circuitBreakerActive: boolean;
    isTradingEnabled: boolean;
  };

  // LAYER 6: STRATEGIC GUIDANCE
  systemInsights: SystemInsight[];
  generateInsights: () => void;

  // ACTIONS
  setActivePortfolio: (portfolio: PortfolioMetrics | null) => void;
  setLockOverrides: (locked: boolean) => void;
  saveSessionSnapshot: (label?: string) => void;
  loadSessionSnapshot: (data?: any) => void;
  setSavedSnapshots: (snapshots: { id: string; label: string; created_at: string }[]) => void;
  setSystemHealth: (health: Partial<SystemState["systemHealth"]>) => void;
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
  savedSnapshots: [],
  systemHealth: {
    dbConnected: true,
    dbLatencyMs: 0,
    wsClientCount: 0,
    circuitBreakerActive: false,
    isTradingEnabled: true,
  },
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
  setSystemHealth: (health) => set((state) => ({ systemHealth: { ...state.systemHealth, ...health } })),
  setSavedSnapshots: (snapshots) => set({ savedSnapshots: snapshots }),
  saveSessionSnapshot: (label) =>
    set((state) => {
      const snapshotData = {
        strategyOverrides: state.strategyOverrides,
        riskOverrides: state.riskOverrides,
        isSimulationMode: state.isSimulationMode,
        overrideHistory: state.overrideHistory,
        timestamp: Date.now(),
      };
      
      // If a label is provided and we have an active portfolio, persist it to the DB
      if (label && state.activePortfolio) {
        fetch('/api/system/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolioId: state.activePortfolio.id, label, data: snapshotData })
        }).then(res => {
          if (res.ok) {
            fetch(`/api/system/snapshots?portfolioId=${state.activePortfolio!.id}`)
              .then(r => r.json())
              .then(data => set({ savedSnapshots: data }));
          }
        }).catch(console.error);
      }

      return { sessionSnapshot: snapshotData };
    }),
  loadSessionSnapshot: (data) =>
    set((state) => {
      const snapshotToLoad = data || state.sessionSnapshot;
      if (!snapshotToLoad) return state;
      return {
        strategyOverrides: snapshotToLoad.strategyOverrides,
        riskOverrides: snapshotToLoad.riskOverrides,
      };
    }),
  setPortfolios: (portfolios) => set({ portfolios }),
  setGlobalMetrics: (metrics) => set({ globalMetrics: metrics }),
  setRiskState: (risk) => {
    set({ riskState: risk });
    get().generateInsights();
  },
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
    const fetchWithRetry = async (url: string, options?: RequestInit, maxRetries = 3, delayMs = 1500): Promise<Response> => {
      let lastError: any;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch(url, options);
          return res;
        } catch (e) {
          lastError = e;
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
      throw lastError;
    };

    // 1. Fetch Portfolios
    try {
      const portRes = await fetchWithRetry("/api/portfolio/me");
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
      } else {
        console.warn("fetch portfolios returned not ok", portRes.status);
      }
    } catch (e) {
      console.warn("Failed to fetch initial portfolios (retries exhausted), falling back to mock portfolio:", e);
      const mockPortfolio = {
        id: "mock-portfolio-1",
        name: "Default Portfolio",
        description: "Created by memory mock",
        totalRealizedPnl: 1200,
        totalUnrealizedPnl: 1560,
        maxDrawdown: 1.8,
        winRate: 64,
        sharpeRatio: 2.1,
        cash: 100000.0,
        totalValue: 98440,
        positions: []
      };
      get().setPortfolios([mockPortfolio as any]);
      get().setActivePortfolio(mockPortfolio as any);
      get().setGlobalMetrics({
        totalPnl: 2760,
        globalDrawdown: 1.8,
        winRate: 64,
        sharpeRatio: 2.1,
        totalCapital: 198440,
        totalExposure: 98440,
      });
    }

    // 2. Fetch Risk State
    try {
      const activePortId = get().activePortfolio?.id;
      if (activePortId) {
        const riskRes = await fetchWithRetry("/api/intelligence/risk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId: activePortId }),
        });
        if (riskRes.ok) {
          const riskData = await riskRes.json();
          if (riskData.riskState) {
            get().setRiskState(riskData.riskState);
          }
        } else {
          console.warn("fetch risk returned not ok", riskRes.status);
          get().setRiskState({
            state: "NORMAL",
            drawdown: 0.8,
            volatility: 1.25,
            riskMultiplier: 1.0,
          });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch initial risk state (retries exhausted):", e);
      get().setRiskState({
        state: "NORMAL",
        drawdown: 0.8,
        volatility: 1.25,
        riskMultiplier: 1.0,
      });
    }

    // 3. Fetch Strategy / Intelligence
    try {
      const eventsRes = await fetchWithRetry("/api/events/recent");
      if (!eventsRes.ok) {
        console.warn("fetch events returned not ok", eventsRes.status);
      }
    } catch (e) {
      console.warn("Failed to fetch initial events (retries exhausted):", e);
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
          const msg = data;

          if (msg.type === "RISK_ALERT") {
            useToastStore.getState().addToast("error", `⚠ Risk Alert: ${msg.message}`, 6000);
          }
          if (msg.type === "ORDER_EXECUTED" && msg.data?.action === "BUY") {
            useToastStore.getState().addToast("success", `✓ BUY order executed: ${msg.data?.orderId?.slice(0,8)}`, 5000);
          }
          if (msg.type === "CIRCUIT_BREAKER") {
            useToastStore.getState().addToast("error", "⛔ Circuit Breaker Activated — All trading halted", 10000);
          }

          // Legacy formats if any exist
          if (data.type === "SYSTEM_CONTROL" && data.action) {
             if (data.action === "KILL") {
               get().setSystemHealth({ isTradingEnabled: false });
               get().addTelemetryEvent({ id: crypto.randomUUID(), type: "EXECUTION", message: "SYSTEM KILLED", timestamp: Date.now() });
             } else if (data.action === "RESUME") {
               get().setSystemHealth({ isTradingEnabled: true, circuitBreakerActive: false });
               get().addTelemetryEvent({ id: crypto.randomUUID(), type: "EXECUTION", message: "SYSTEM RESUMED", timestamp: Date.now() });
             }
          }

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
                agent: data.agent_name,
                correlationId: data.correlationId,
                message: data.summary || "Order Executed",
                timestamp: new Date(data.timestamp).getTime(),
                metadata: {
                  status: data.status,
                  reasoning: data.reasoning,
                  confidence: data.confidence,
                  metrics: data.metrics,
                },
              });
              get().fetchInitialData();
            } else {
              get().addTelemetryEvent({
                id: crypto.randomUUID(),
                type: "AGENT_DECISION",
                agent: data.agent_name,
                correlationId: data.correlationId,
                message: `[${data.agent_name}] ${data.summary}`,
                timestamp: new Date(data.timestamp).getTime(),
                metadata: {
                  status: data.status,
                  reasoning: data.reasoning,
                  confidence: data.confidence,
                  metrics: data.metrics,
                },
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
