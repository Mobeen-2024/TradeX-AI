ALTER TABLE trades ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES strategy_profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS strategy_performance (
  strategy_id UUID PRIMARY KEY REFERENCES strategy_profiles(id) ON DELETE CASCADE,
  win_rate DECIMAL DEFAULT 0,
  avg_pnl DECIMAL DEFAULT 0,
  expectancy DECIMAL DEFAULT 0,
  drawdown DECIMAL DEFAULT 0,
  total_trades INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
