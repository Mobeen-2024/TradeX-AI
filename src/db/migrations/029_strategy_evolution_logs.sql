CREATE TABLE IF NOT EXISTS strategy_evolution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    failure_type VARCHAR(50), 
    adjustment_signal VARCHAR(255), 
    confidence_delta DECIMAL, 
    contextual_metadata JSONB, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
