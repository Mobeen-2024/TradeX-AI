import { getPool } from "../connection";

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export class PortfolioRepository {
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
