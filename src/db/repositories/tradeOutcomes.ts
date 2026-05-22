import { getPool } from "../connection";

export class TradeOutcomesRepository {
  static async getSimilarOutcomes(stateEmbedding: number[], limit: number = 5): Promise<any[]> {
    const pool = getPool();
    const result = await pool.query(`
      SELECT decision_context, predicted_alpha, actual_alpha 
      FROM trade_outcomes
      ORDER BY feedback_vector <-> $1
      LIMIT $2
    `, ['[' + stateEmbedding.join(',') + ']', limit]);
    
    return result.rows;
  }

  static async getRecentOutcomes(portfolioId: string, limit: number = 5): Promise<any[]> {
    const pool = getPool();
    const result = await pool.query(`
      SELECT o.decision_context, o.predicted_alpha, o.actual_alpha, o.expectancy_contribution
      FROM trade_outcomes o
      JOIN trades t ON t.id = o.trade_id
      WHERE t.portfolio_id = $1
      ORDER BY t.closed_at DESC
      LIMIT $2
    `, [portfolioId, limit]);
    return result.rows;
  }

}
