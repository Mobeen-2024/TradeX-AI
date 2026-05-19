# Active Development Context

Current Sprint:
- Backend API migration
- Express scaffold
- Gemini API backend integration
- Database schema and migrations
- Authentication foundation
- Portfolio domain layer
- Semantic memory infrastructure
- Embedding provider integration
- Market ingestion foundation
- Market snapshots schema for replay engine
- Quant Agent backend service
- Risk Guardian backend service
- Agent execution tracing

Rules:
- MIGRATION POLICY: Freeze 001_initial_schema.sql permanently. Do not modify historical migrations again. Use additive numbered migrations (002_*.sql, 003_*.sql) for all future schema changes.
- Only edit files directly related to current user request.
- Do not modify unrelated architecture.
- Do not infer backend work unless requested.
- Ask before structural changes.
