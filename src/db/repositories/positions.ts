import { getPool } from "../connection";

export interface Position {
  id: string;
  portfolio_id: string;
  asset_id: string;
  avg_entry_price: string; // Decimal is string in pg driver by default
  size: string;
  pnl_realized: string;
  created_at: Date;
  updated_at: Date;
}

export class PositionRepository {
  static async create(portfolioId: string, assetId: string, entryPrice: string, size: string): Promise<Position> {
    const pool = getPool();
    const result = await pool.query(
      "INSERT INTO positions (portfolio_id, asset_id, avg_entry_price, size) VALUES ($1, $2, $3, $4) RETURNING *",
      [portfolioId, assetId, entryPrice, size]
    );
    return result.rows[0] as Position;
  }

  static async findByPortfolioId(portfolioId: string): Promise<Position[]> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM positions WHERE portfolio_id = $1 ORDER BY created_at DESC", [portfolioId]);
    return result.rows as Position[];
  }
}
