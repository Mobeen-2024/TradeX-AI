CREATE TABLE IF NOT EXISTS strategy_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategy_profiles(id) ON DELETE CASCADE,
  allocation_percentage DECIMAL NOT NULL DEFAULT 0.05,
  risk_weight DECIMAL NOT NULL DEFAULT 1.0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(portfolio_id, strategy_id)
);
