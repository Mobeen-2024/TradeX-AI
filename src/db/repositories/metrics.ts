import { getPool } from "../connection";

export class MetricsRepository {
    static async getAllPortfolioIds() {
        const pool = getPool();
        const res = await pool.query("SELECT id FROM portfolios");
        return res.rows.map(r => r.id);
    }

    static async getPortfolioValueStats(portfolioId: string) {
        const pool = getPool();
        const balancesRes = await pool.query("SELECT cash_balance FROM balances WHERE portfolio_id = $1", [portfolioId]);
        const positionsRes = await pool.query("SELECT * FROM positions WHERE portfolio_id = $1", [portfolioId]);
        
        let cash = balancesRes.rows.length > 0 ? Number(balancesRes.rows[0].cash_balance) : 0;
        let unrealizedPnl = 0;
        
        for (const pos of positionsRes.rows) {
            const tickRes = await pool.query("SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1", [pos.asset_id]);
            const currentPrice = tickRes.rows.length > 0 ? Number(tickRes.rows[0].price) : Number(pos.avg_entry_price);
            unrealizedPnl += (currentPrice - Number(pos.avg_entry_price)) * Number(pos.size);
        }
        
        return { cash, unrealizedPnl };
    }

    static async getTradesStats(portfolioId: string) {
        const pool = getPool();
        const tradesRes = await pool.query("SELECT pnl FROM trades WHERE portfolio_id = $1 AND status = 'CLOSED'", [portfolioId]);
        return tradesRes.rows;
    }

    static async getPrevMetrics(portfolioId: string) {
        const pool = getPool();
        const prevMetrics = await pool.query(
            "SELECT portfolio_value FROM portfolio_metrics_history WHERE portfolio_id = $1 ORDER BY logical_time DESC LIMIT 50",
            [portfolioId]
        );
        return prevMetrics.rows;
    }

    static async saveMetricsHistory(portfolioId: string, portfolioValue: number, dailyReturn: number, sharpe: number, drawdown: number, winRate: number) {
        const pool = getPool();
        await pool.query(
            `INSERT INTO portfolio_metrics_history (portfolio_id, logical_time, portfolio_value, daily_return, rolling_sharpe, rolling_drawdown, win_rate)
             VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
            [portfolioId, portfolioValue, dailyReturn, sharpe, drawdown, winRate]
        );
    }

    static async getActiveStrategyStats(portfolioId: string) {
        const pool = getPool();
        const activeStrategyRes = await pool.query(
            `SELECT id, created_at FROM strategy_profiles WHERE portfolio_id = $1 AND is_active = true LIMIT 1`,
            [portfolioId]
        );
        if (activeStrategyRes.rows.length === 0) return null;
        const strategy = activeStrategyRes.rows[0];

        const strategyTradesRes = await pool.query(
            `SELECT pnl FROM trades WHERE portfolio_id = $1 AND status = 'CLOSED' AND closed_at > $2`,
            [portfolioId, strategy.created_at]
        );
        return { strategy, trades: strategyTradesRes.rows };
    }

    static async updateStrategyPerformance(totalTrades: number, sWinRate: number, sAvgPnl: number, sSharpe: number, sDrawdown: number, strategyId: string) {
        const pool = getPool();
        await pool.query(
            `UPDATE strategy_performance SET 
               total_trades = $1, win_rate = $2, avg_pnl = $3, sharpe_ratio = $4, drawdown = $5, updated_at = NOW() 
             WHERE strategy_id = $6`,
            [totalTrades, sWinRate, sAvgPnl, sSharpe, sDrawdown, strategyId]
        );
    }
}
