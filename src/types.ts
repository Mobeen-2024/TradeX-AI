export interface GlobalMetrics {
  totalPnl: number;
  globalDrawdown: number;
  winRate: number;
  sharpeRatio: number;
  totalCapital: number;
  totalExposure: number;
}

export interface PortfolioMetrics {
  id: string;
  name: string;
  cash?: number;
  cashBalance?: number;
  totalValue?: number;
  unrealizedPnl?: number;
  realizedPnl?: number;
  totalUnrealizedPnl?: number;
  totalRealizedPnl?: number;
  maxDrawdown?: number;
  winRate?: number;
  sharpeRatio?: number;
  profitFactor?: number;
  expectancy?: number;
  positions?: any[];
  execution_mode?: string;
  is_trading_enabled?: boolean;
  max_position_size?: number;
  max_loss?: number;
}

export interface StrategyMetrics {
  portfolioId: string;
  name?: string;
  winRate: number;
  totalTrades?: number;
  expectancy: number;
  regimeScore: number;
  baseScore: number;
  allocationWeight: number;
  status: "ACTIVE" | "DISABLED";
}

export interface RiskMetrics {
  state: "NORMAL" | "ELEVATED" | "CRITICAL";
  drawdown: number;
  volatility: number;
  riskMultiplier: number;
}

export interface AgentState {
  status: "idle" | "running" | "completed" | "error";
  lastMessage?: string;
  timestamp?: number;
}

export type InsightPriority = "HIGH" | "MEDIUM" | "LOW";
export type AffectedComponent = "STRATEGY" | "RISK" | "EXECUTION" | "PORTFOLIO";

export interface SystemInsight {
  id: string;
  description: string;
  affectedComponent: AffectedComponent;
  confidence: number;
  priority: InsightPriority;
  suggestedAction: string;
  targetId?: string;
}

export interface TradeEvent {
  id: string;
  type: "EXECUTION" | "AGENT_DECISION" | "RISK_ALERT" | "SYSTEM";
  agent?: string;
  correlationId?: string;
  message: string;
  portfolioId?: string;
  metadata?: any;
  timestamp: number;
}
