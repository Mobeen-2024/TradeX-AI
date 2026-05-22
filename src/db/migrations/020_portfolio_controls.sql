ALTER TABLE portfolios 
ADD COLUMN is_trading_enabled BOOLEAN DEFAULT false,
ADD COLUMN max_position_size NUMERIC DEFAULT 0,
ADD COLUMN max_loss NUMERIC DEFAULT 0;
