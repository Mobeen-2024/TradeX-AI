CREATE TABLE IF NOT EXISTS global_system_controls (
    id SERIAL PRIMARY KEY,
    is_trading_enabled BOOLEAN DEFAULT true,
    ai_failures_count INTEGER DEFAULT 0,
    circuit_breaker_active BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO global_system_controls (id, is_trading_enabled) VALUES (1, true) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(255) NOT NULL,
    user_id UUID,
    portfolio_id UUID,
    details JSONB,
    severity VARCHAR(50) DEFAULT 'INFO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
