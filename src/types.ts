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
    cashBalance: number;
    totalValue: number;
    unrealizedPnl: number;
    realizedPnl: number;
}

export interface StrategyMetrics {
    portfolioId: string;
    name?: string;
    winRate: number;
    expectancy: number;
    regimeScore: number;
    baseScore: number;
    allocationWeight: number;
    status: 'ACTIVE' | 'DISABLED';
}

export interface RiskMetrics {
    state: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
    drawdown: number;
    volatility: number;
    riskMultiplier: number;
}

export interface AgentState {
    status: 'idle' | 'running' | 'completed' | 'error';
    lastMessage?: string;
    timestamp?: number;
}

export interface TradeEvent {
    id: string;
    type: 'EXECUTION' | 'AGENT_DECISION' | 'RISK_ALERT' | 'SYSTEM';
    message: string;
    portfolioId?: string;
    metadata?: any;
    timestamp: number;
}
