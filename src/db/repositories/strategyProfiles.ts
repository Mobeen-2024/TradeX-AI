import { getPool } from "../connection";

export class StrategyProfileRepository {
  static async createProfile(
    portfolioId: string,
    name: string,
    parameters: any,
    isActive: boolean = false
  ) {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO strategy_profiles (portfolio_id, name, parameters, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [portfolioId, name, parameters, isActive]
    );

    // If this is set to active, deactivate others
    if (isActive) {
        await this.deactivateOtherStrategies(portfolioId, result.rows[0].id);
    }

    // Initialize performance
    await pool.query(
      `INSERT INTO strategy_performance (strategy_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [result.rows[0].id]
    );

    return result.rows[0];
  }

  static async deactivateOtherStrategies(portfolioId: string, currentActiveStrategyId: string) {
    const pool = getPool();
    await pool.query(
      `UPDATE strategy_profiles SET is_active = false WHERE portfolio_id = $1 AND id != $2`,
      [portfolioId, currentActiveStrategyId]
    );
  }

  static async getActiveStrategy(portfolioId: string) {
    const pool = getPool();
    const result = await pool.query(
      `SELECT * FROM strategy_profiles WHERE portfolio_id = $1 AND is_active = true LIMIT 1`,
      [portfolioId]
    );
    return result.rows[0] || null;
  }

  static async activateStrategy(portfolioId: string, strategyId: string) {
    const pool = getPool();
    await pool.query(
      `UPDATE strategy_profiles SET is_active = true WHERE id = $1 AND portfolio_id = $2`,
      [strategyId, portfolioId]
    );
    await this.deactivateOtherStrategies(portfolioId, strategyId);
  }

  static async updatePerformance(
    strategyId: string,
    performance: {
        total_trades: number;
        win_rate: number;
        avg_pnl: number;
        sharpe_ratio: number;
        drawdown: number;
    }
  ) {
    const pool = getPool();
    await pool.query(
      `INSERT INTO strategy_performance (strategy_id, total_trades, win_rate, avg_pnl, sharpe_ratio, drawdown)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (strategy_id) DO UPDATE SET
         total_trades = EXCLUDED.total_trades,
         win_rate = EXCLUDED.win_rate,
         avg_pnl = EXCLUDED.avg_pnl,
         sharpe_ratio = EXCLUDED.sharpe_ratio,
         drawdown = EXCLUDED.drawdown`,
      [strategyId, performance.total_trades, performance.win_rate, performance.avg_pnl, performance.sharpe_ratio, performance.drawdown]
    );
  }
  
  static async getStrategyPerformance(strategyId: string) {
    const pool = getPool();
    const result = await pool.query(`SELECT * FROM strategy_performance WHERE strategy_id = $1`, [strategyId]);
    return result.rows[0] || null;
  }

  static async getActivePortfolioIds() {
    const pool = getPool();
    const result = await pool.query(`SELECT id FROM portfolios`);
    return result.rows.map(r => r.id);
  }

  static async getRecentTrades(portfolioId: string) {
    const pool = getPool();
    const result = await pool.query(`
        SELECT t.id, t.asset_id, t.pnl, o.decision_context 
        FROM trades t
        LEFT JOIN trade_outcomes o ON t.id = o.trade_id
        WHERE t.portfolio_id = $1
        ORDER BY t.closed_at DESC LIMIT 50
    `, [portfolioId]);
    return result.rows;
  }
}
