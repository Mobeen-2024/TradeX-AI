# Database Architecture

## Models (PostgreSQL Schema)

A relational foundation optimized for querying time-series and agent data:

### `users`
- `id` (UUID, PK)
- `email` (VARCHAR, Unique)
- `risk_tolerance_profile` (JSONB) - Dynamic thresholding configs.

### `portfolios` / `positions`
- `id` (UUID, PK)
- `user_id` (FK -> users)
- `asset_id` (VARCHAR) - e.g., 'BTC', 'ES', 'NQ'
- `entry_price` (DECIMAL)
- `size` (DECIMAL)
- `pnl_realized` (DECIMAL)

### `semantic_memory_logs` (The Agent Vault)
- `id` (UUID, PK)
- `timestamp` (TIMESTAMPTZ)
- `market_regime` (VARCHAR) - Bull, Bear, Volatile.
- `ai_rationale` (TEXT) - The LLM's raw reasoning.
- `vector_embedding` (VECTOR) - Embedding for pattern retrieval via semantic search (pgvector).
