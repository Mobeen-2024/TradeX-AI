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

### `market_ticks`
- `id` (UUID, PK)
- `provider` (VARCHAR)
- `symbol` (VARCHAR)
- `price` (NUMERIC)
- `volume_24h` (NUMERIC)
- `timestamp` (TIMESTAMPTZ)
- *Indexes*: `(symbol, timestamp DESC)`

### `market_snapshots` (Replay Engine)
- `id` (UUID, PK)
- `asset_id` (VARCHAR)
- `bid` (NUMERIC), `ask` (NUMERIC)
- `price` (NUMERIC)
- `volume` (NUMERIC)
- `timestamp` (TIMESTAMPTZ)
- `source` (VARCHAR)
- *Indexes*: `(asset_id, timestamp DESC)`, Note: Consider `(portfolio_id, timestamp DESC)` if scoping later for combined similarity and market playback.

### `execution_logs` (Agent Tracing)
- `id` (UUID, PK)
- `agent_name` (VARCHAR)
- `start_timestamp` (TIMESTAMPTZ)
- `duration_ms` (INTEGER)
- `success` (BOOLEAN)
- `error_message` (TEXT, nullable)
- `portfolio_id` (UUID, FK -> portfolios, nullable)
- `user_id` (UUID, FK -> users, nullable)
- *Indexes*: `(agent_name, start_timestamp DESC)`, `(portfolio_id, start_timestamp DESC)`
