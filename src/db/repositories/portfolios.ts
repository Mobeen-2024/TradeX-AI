import { getPool } from "../connection";

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_trading_enabled: boolean;
  max_position_size: number;
  max_loss: number;
  execution_mode: string; // 'AUTO', 'SEMI_AUTO', 'SIMULATION'
  created_at: Date;
  updated_at: Date;
}

export class PortfolioRepository {
  static async updateSettings(id: string, is_trading_enabled: boolean, max_position_size: number, max_loss: number): Promise<Portfolio> {
    const pool = getPool();
    const result = await pool.query(
      "UPDATE portfolios SET is_trading_enabled = $1, max_position_size = $2, max_loss = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
      [is_trading_enabled, max_position_size, max_loss, id]
    );
    return result.rows[0] as Portfolio;
  }

  static async updateExecutionMode(id: string, executionMode: string): Promise<Portfolio> {
    const pool = getPool();
    const result = await pool.query(
      "UPDATE portfolios SET execution_mode = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [executionMode, id]
    );
    return result.rows[0] as Portfolio;
  }

  static async create(userId: string, name: string, description: string | null): Promise<Portfolio> {
    const pool = getPool();
    const result = await pool.query(
      "INSERT INTO portfolios (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, description]
    );
    return result.rows[0] as Portfolio;
  }

  static async findByUserId(userId: string): Promise<Portfolio[]> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return result.rows as Portfolio[];
  }

  static async findById(id: string): Promise<Portfolio | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM portfolios WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as Portfolio;
  }
}
