-- Migration 009: Idempotency Protection

ALTER TABLE semantic_memory_logs ADD COLUMN agent_name VARCHAR;
ALTER TABLE semantic_memory_logs ADD COLUMN correlation_id UUID;

CREATE UNIQUE INDEX uq_semantic_memory_correlation_agent ON semantic_memory_logs (correlation_id, agent_name) WHERE correlation_id IS NOT NULL AND agent_name IS NOT NULL;
