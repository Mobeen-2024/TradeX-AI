CREATE TABLE strategy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID,
  name TEXT,
  parameters JSONB,
  performance_score DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
