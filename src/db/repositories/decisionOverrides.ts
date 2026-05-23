import { getPool } from "../connection";
import { v4 as uuidv4 } from "uuid";

export interface DecisionOverride {
  id: string;
  portfolio_id: string;
  correlation_id: string;
  asset_id: string;
  original_action: string;
  original_size: number;
  original_rationale: string | null;
  override_action: string | null;
  override_size: number | null;
  status: string; // 'PENDING', 'EXECUTED', 'DISCARDED'
  created_at: Date;
  executed_at: Date | null;
}

export class DecisionOverridesRepository {
  static async insertOverride(
    portfolioId: string,
    correlationId: string,
    assetId: string,
    originalAction: string,
    originalSize: number,
    originalRationale: string | null
  ): Promise<string> {
    const pool = getPool();
    const id = uuidv4();
    await pool.query(
      `INSERT INTO decision_overrides 
       (id, portfolio_id, correlation_id, asset_id, original_action, original_size, original_rationale, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
      [id, portfolioId, correlationId, assetId, originalAction, originalSize, originalRationale]
    );
    return id;
  }

  static async getPendingByPortfolio(portfolioId: string): Promise<DecisionOverride[]> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT * FROM decision_overrides WHERE portfolio_id = $1 AND status = 'PENDING' ORDER BY created_at DESC`,
      [portfolioId]
    );
    return result.rows as DecisionOverride[];
  }

  static async findById(id: string): Promise<DecisionOverride | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT * FROM decision_overrides WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0] as DecisionOverride;
  }

  static async updateExecuted(
    id: string,
    overrideAction: string,
    overrideSize: number
  ): Promise<void> {
    const pool = getPool();
    await pool.query(
      `UPDATE decision_overrides 
       SET override_action = $1, override_size = $2, status = 'EXECUTED', executed_at = NOW() 
       WHERE id = $3`,
      [overrideAction, overrideSize, id]
    );
  }

  static async discardOverride(id: string): Promise<void> {
    const pool = getPool();
    await pool.query(
      `UPDATE decision_overrides SET status = 'DISCARDED', executed_at = NOW() WHERE id = $1`,
      [id]
    );
  }
}
