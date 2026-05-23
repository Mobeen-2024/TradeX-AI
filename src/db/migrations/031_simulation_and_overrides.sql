-- Migration 031: Simulation and Overrides

-- 1. Add execution_mode to portfolios (AUTO, SEMI_AUTO, SIMULATION)
ALTER TABLE portfolios ADD COLUMN execution_mode VARCHAR(20) DEFAULT 'AUTO';

-- 2. Add is_simulation flag to orders and trades
ALTER TABLE orders ADD COLUMN is_simulation BOOLEAN DEFAULT false;
ALTER TABLE trades ADD COLUMN is_simulation BOOLEAN DEFAULT false;

-- 3. Create decision_overrides table to store paused decisions in SEMI_AUTO mode
CREATE TABLE decision_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    correlation_id VARCHAR(255) NOT NULL,
    asset_id VARCHAR(20) NOT NULL,
    original_action VARCHAR(10) NOT NULL,
    original_size NUMERIC NOT NULL,
    original_rationale TEXT,
    override_action VARCHAR(10),
    override_size NUMERIC,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'EXECUTED', 'DISCARDED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- 4. Add override_id to trades to link them explicitly
ALTER TABLE trades ADD COLUMN override_id UUID REFERENCES decision_overrides(id) ON DELETE SET NULL;
