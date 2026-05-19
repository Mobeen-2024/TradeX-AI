CREATE TABLE IF NOT EXISTS balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
    cash DECIMAL(18, 8) DEFAULT 100000.0, -- Default starting cash
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
