import { getPool } from "../db/connection";

export class RiskControlService {
    /**
     * Streak protection: adjusts position sizes based on consecutive losses
     * Returns a sizing multiplier (e.g. 1.0, 0.5) and effectively halts trading
     * by returning throwing an error if losses hit critical threshold.
     */
    static async checkLossStreak(portfolioId: string): Promise<number> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            // Get the last 5 closed trades ordered by closed_at desc
            const result = await client.query(`
                SELECT id, pnl, closed_at 
                FROM trades 
                WHERE portfolio_id = $1 AND status = 'CLOSED' 
                ORDER BY closed_at DESC 
                LIMIT 5
            `, [portfolioId]);

            const trades = result.rows;
            if (trades.length === 0) return 1.0;

            let consecutiveLosses = 0;
            for (const trade of trades) {
                if (Number(trade.pnl) < 0) {
                    consecutiveLosses++;
                } else {
                    break;
                }
            }

            if (consecutiveLosses >= 5) {
                // Halt trading
                await client.query(`UPDATE portfolios SET is_trading_enabled = false WHERE id = $1`, [portfolioId]);
                throw new Error("Risk Control: 5 consecutive losses. Trading has been automatically halted for portfolio.");
            } else if (consecutiveLosses >= 3) {
                // Reduce size by 50%
                return 0.5;
            }

            // Otherwise no reduction
            return 1.0;
        } finally {
            client.release();
        }
    }
}
