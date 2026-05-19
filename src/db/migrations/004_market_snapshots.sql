-- Migration 004: Market Snapshots

CREATE TABLE IF NOT EXISTS market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id VARCHAR NOT NULL,
    bid NUMERIC,
    ask NUMERIC,
    price NUMERIC NOT NULL,
    volume NUMERIC,
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_asset_timestamp ON market_snapshots(asset_id, timestamp DESC);
