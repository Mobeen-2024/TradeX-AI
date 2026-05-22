CREATE TYPE trade_status as ENUM ('OPEN', 'CLOSED');

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id),
  asset_id VARCHAR NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  size NUMERIC NOT NULL,
  pnl NUMERIC,
  status VARCHAR NOT NULL DEFAULT 'OPEN',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMPTZ
);

ALTER TABLE orders ADD COLUMN trade_id UUID REFERENCES trades(id);
