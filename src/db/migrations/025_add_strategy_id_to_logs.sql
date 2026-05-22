ALTER TABLE semantic_memory_logs ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES strategy_profiles(id) ON DELETE SET NULL;
ALTER TABLE execution_logs ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES strategy_profiles(id) ON DELETE SET NULL;
