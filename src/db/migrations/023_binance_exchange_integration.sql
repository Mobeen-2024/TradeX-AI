ALTER TABLE orders ADD COLUMN exchange_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN average_fill_price NUMERIC;
ALTER TABLE orders ADD COLUMN filled_size NUMERIC DEFAULT 0;

ALTER TABLE trades ADD COLUMN exchange_trade_id VARCHAR(255);
ALTER TABLE global_system_controls ADD COLUMN IF NOT EXISTS exchange_api_failures INTEGER DEFAULT 0;

