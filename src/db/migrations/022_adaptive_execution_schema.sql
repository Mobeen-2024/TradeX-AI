CREATE TABLE portfolio_risk_controls (
    portfolio_id UUID PRIMARY KEY,
    current_drawdown DECIMAL(5,2) DEFAULT 0.0,
    max_position_size DECIMAL(10,2),
    volatility_scaler DECIMAL(5,2) DEFAULT 1.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE execution_metrics (
    trade_id UUID PRIMARY KEY,
    intended_price DECIMAL(18,8),
    executed_price DECIMAL(18,8),
    slippage_bps DECIMAL(5,2),
    latency_ms INTEGER,
    spread_paid DECIMAL(18,8)
);

CREATE TABLE trade_outcomes (
    trade_id UUID PRIMARY KEY,
    correlation_id UUID,
    decision_context JSONB,
    predicted_alpha DECIMAL(5,2),
    actual_alpha DECIMAL(5,2),
    expectancy_contribution DECIMAL(10,4),
    feedback_vector vector(1536)
);

CREATE TABLE portfolio_metrics_history (
    id SERIAL PRIMARY KEY,
    portfolio_id UUID,
    logical_time TIMESTAMP WITH TIME ZONE,
    portfolio_value DECIMAL(18,8),
    daily_return DECIMAL(5,4),
    rolling_sharpe DECIMAL(5,2),
    rolling_drawdown DECIMAL(5,2),
    win_rate DECIMAL(5,2)
);
