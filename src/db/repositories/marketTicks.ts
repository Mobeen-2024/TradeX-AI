import { getPool } from "../connection";

export interface MarketTick {
  id: string;
  provider: string;
  symbol: string;
  price: string;
  volume_24h: string;
  timestamp: Date;
  created_at: Date;
}

export class MarketTickRepository {
  static async insert(
    provider: string,
    symbol: string,
    price: string,
    volume24h: string,
    timestamp: Date
  ): Promise<MarketTick> {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO market_ticks (provider, symbol, price, volume_24h, timestamp)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [provider, symbol, price, volume24h, timestamp]
    );
    return result.rows[0] as MarketTick;
  }

  static async getLatest(symbol?: string): Promise<MarketTick[]> {
    const pool = getPool();
    if (symbol) {
      const result = await pool.query(
        `SELECT * FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`,
        [symbol]
      );
      return result.rows as MarketTick[];
    } else {
      const result = await pool.query(
        `SELECT DISTINCT ON (symbol) * FROM market_ticks ORDER BY symbol, timestamp DESC`
      );
      return result.rows as MarketTick[];
    }
  }

  static async getRecentPrices(limit: number = 20): Promise<number[]> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT price FROM market_ticks ORDER BY timestamp DESC LIMIT $1`, [limit]
    );
    return result.rows.map(r => Number(r.price));
  }
}
