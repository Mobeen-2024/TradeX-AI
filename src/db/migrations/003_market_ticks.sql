-- Migration 003: Market Ticks

CREATE TABLE IF NOT EXISTS market_ticks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR NOT NULL,
    symbol VARCHAR NOT NULL,
    price NUMERIC NOT NULL,
    volume_24h NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_ticks_symbol_timestamp ON market_ticks(symbol, timestamp DESC);
