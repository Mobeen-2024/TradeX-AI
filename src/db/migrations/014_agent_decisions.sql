CREATE TABLE IF NOT EXISTS agent_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(255) NOT NULL,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_id VARCHAR(50) NOT NULL,
    direction VARCHAR(50) NOT NULL,
    entry_price DECIMAL(18, 8) NOT NULL,
    exit_price DECIMAL(18, 8),
    pnl DECIMAL(18, 8),
    evaluation VARCHAR(255),
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_decisions_portfolio ON agent_decisions(portfolio_id);
CREATE INDEX idx_agent_decisions_created_at ON agent_decisions(created_at);
