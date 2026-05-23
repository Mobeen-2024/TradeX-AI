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

  static async getAggregatedMetrics(portfolioId: string): Promise<{ winRate: number; avgAlpha: number; expectancy: number; totalTrades: number } | null> {
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        COUNT(*)::INTEGER as total_trades,
        COALESCE(SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0)::FLOAT, 0.0) as win_rate,
        COALESCE(AVG(o.actual_alpha)::FLOAT, 0.0) as avg_alpha,
        COALESCE(AVG(o.expectancy_contribution)::FLOAT, 0.0) as expectancy
      FROM trade_outcomes o
      JOIN trades t ON t.id = o.trade_id
      WHERE t.portfolio_id = $1 AND t.status = 'CLOSED'
    `, [portfolioId]);

    if (result.rows.length === 0 || result.rows[0].total_trades === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      winRate: row.win_rate,
      avgAlpha: row.avg_alpha,
      expectancy: row.expectancy,
      totalTrades: row.total_trades
    };
  }

  static async getMetricsByRegime(portfolioId: string): Promise<{ marketRegime: string; winRate: number; avgAlpha: number; expectancy: number; totalTrades: number }[]> {
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        COALESCE(o.market_regime, 'UNKNOWN') as market_regime,
        COUNT(*)::INTEGER as total_trades,
        COALESCE(SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0)::FLOAT, 0.0) as win_rate,
        COALESCE(AVG(o.actual_alpha)::FLOAT, 0.0) as avg_alpha,
        COALESCE(AVG(o.expectancy_contribution)::FLOAT, 0.0) as expectancy
      FROM trade_outcomes o
      JOIN trades t ON t.id = o.trade_id
      WHERE t.portfolio_id = $1 AND t.status = 'CLOSED'
      GROUP BY o.market_regime
    `, [portfolioId]);

    return result.rows.map(row => ({
      marketRegime: row.market_regime,
      winRate: row.win_rate,
      avgAlpha: row.avg_alpha,
      expectancy: row.expectancy,
      totalTrades: row.total_trades
    }));
  }
}

