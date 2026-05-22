CREATE TABLE IF NOT EXISTS contextual_strategy_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategy_profiles(id) ON DELETE CASCADE,
  market_regime VARCHAR(100),
  volatility_level VARCHAR(100),
  win_rate DECIMAL DEFAULT 0,
  avg_pnl DECIMAL DEFAULT 0,
  expectancy DECIMAL DEFAULT 0,
  total_trades INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(strategy_id, market_regime, volatility_level)
);

ALTER TABLE trade_outcomes ADD COLUMN IF NOT EXISTS market_regime VARCHAR(100);
ALTER TABLE trade_outcomes ADD COLUMN IF NOT EXISTS volatility_level VARCHAR(100);
