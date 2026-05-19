-- Migration 001: Initial Schema

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    risk_tolerance_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios table (also mapping positions concept)
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id VARCHAR NOT NULL,
    entry_price DECIMAL(18, 8),
    size DECIMAL(18, 8),
    pnl_realized DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semantic Memory Logs table (The Agent Vault)
CREATE TABLE IF NOT EXISTS semantic_memory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    market_regime VARCHAR,
    ai_rationale TEXT,
    vector_embedding VECTOR(1536), -- Assuming 1536 dims for standard OpenAI/Gemini embeddings. Adjust if different.
    created_at TIMESTAMPTZ DEFAULT NOW()
);
