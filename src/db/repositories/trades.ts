import { getPool } from "../connection";

export class TradeRepository {
  static async getRecentClosedPnls(portfolioId: string, limit: number = 3): Promise<number[]> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT pnl FROM trades WHERE portfolio_id = $1 AND status = 'CLOSED' ORDER BY closed_at DESC LIMIT $2`,
      [portfolioId, limit]
    );
    return result.rows.map(r => Number(r.pnl));
  }
}
