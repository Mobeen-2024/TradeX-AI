import { getPool } from "../db/connection";

export interface StrategyPerformance {
    market_regime: string;
    strategy_tag: string;
    asset_id: string;
    win_rate: number;
    avg_pnl: number;
    total_trades: number;
}

export class StrategyPerformanceService {
    /**
     * Calculates the performance (win rate, avg pnl, total trades) of different 
     * market_regime and strategy_tags across assets using the trade_outcomes and semantic_memory_logs.
     */
    static async getStrategyPerformance(portfolioId: string): Promise<StrategyPerformance[]> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            // We join trades with the most recent QuantAgent semantic memory before the trade opened
            // The AI rationale JSON contains strategy_tag, or metadata contains it
            const result = await client.query(`
                WITH TradeMetadata AS (
                    SELECT 
                        t.id as trade_id,
                        t.portfolio_id,
                        t.asset_id,
                        t.pnl,
                        t.status,
                        q.market_regime,
                        q.metadata->>'strategy_tag' as strategy_tag,
                        t.closed_at
                    FROM trades t
                    LEFT JOIN LATERAL (
                        SELECT s.market_regime, s.metadata
                        FROM semantic_memory_logs s
                        WHERE s.portfolio_id = t.portfolio_id 
                        AND s.agent_name = 'QuantAgent'
                        AND s.timestamp <= t.opened_at
                        ORDER BY s.timestamp DESC
                        LIMIT 1
                    ) q ON true
                    WHERE t.portfolio_id = $1 AND t.status = 'CLOSED'
                )
                SELECT 
                    market_regime,
                    strategy_tag,
                    asset_id,
                    COUNT(*) as total_trades,
                    AVG(CASE WHEN pnl > 0 THEN 1.0 ELSE 0.0 END) as win_rate,
                    AVG(pnl) as avg_pnl
                FROM TradeMetadata
                GROUP BY market_regime, strategy_tag, asset_id
                HAVING COUNT(*) > 0
            `, [portfolioId]);
            
            return result.rows.map(row => ({
                market_regime: row.market_regime || 'UNKNOWN',
                strategy_tag: row.strategy_tag || 'DEFAULT',
                asset_id: row.asset_id,
                win_rate: Number(row.win_rate),
                avg_pnl: Number(row.avg_pnl),
                total_trades: Number(row.total_trades)
            }));
        } finally {
            client.release();
        }
    }

    static async getTopPerformingStrategies(portfolioId: string, limit: number = 3): Promise<StrategyPerformance[]> {
        const stats = await this.getStrategyPerformance(portfolioId);
        // Sort by win_rate and then avg_pnl
        return stats.sort((a, b) => {
            if (b.win_rate === a.win_rate) {
                return b.avg_pnl - a.avg_pnl;
            }
            return b.win_rate - a.win_rate;
        }).slice(0, limit);
    }

    static async getWorstPerformingStrategies(portfolioId: string, limit: number = 3): Promise<StrategyPerformance[]> {
        const stats = await this.getStrategyPerformance(portfolioId);
        // Sort ascending by avg_pnl for worst ones
        return stats.sort((a, b) => a.avg_pnl - b.avg_pnl).slice(0, limit);
    }

    static async trackStrategyPerformance(strategyId: string) {
        const pool = getPool();
        
        // Compute stats for everything linked to this strategy_id
        // from trades, and metrics from portfolio to approximate drawdown
        const tradesRes = await pool.query(
            "SELECT pnl, status FROM trades WHERE strategy_id = $1 AND status = 'CLOSED'",
            [strategyId]
        );
        
        const trades = tradesRes.rows;
        const totalTrades = trades.length;
        if (totalTrades === 0) return;
        
        const wins = trades.filter(t => Number(t.pnl) > 0).length;
        const winRate = wins / totalTrades;
        const avgPnl = trades.reduce((sum, t) => sum + Number(t.pnl), 0) / totalTrades;
        
        // Compute expectancy via trade_outcomes
        const outcomesRes = await pool.query(`
            SELECT AVG(expectancy_contribution) as avg_expectancy 
            FROM trade_outcomes o JOIN trades t ON o.trade_id = t.id 
            WHERE t.strategy_id = $1
        `, [strategyId]);
        
        const expectancy = outcomesRes.rows[0]?.avg_expectancy ? Number(outcomesRes.rows[0].avg_expectancy) : 0;
        
        let runningPnl = 0;
        let peakPnl = 0;
        let maxDrawdown = 0;
        for(const t of trades) {
            runningPnl += Number(t.pnl);
            if (runningPnl > peakPnl) peakPnl = runningPnl;
            const dd = peakPnl - runningPnl;
            if (dd > maxDrawdown) maxDrawdown = dd;
        }
        
        await pool.query(`
            INSERT INTO strategy_performance (strategy_id, win_rate, avg_pnl, expectancy, drawdown, total_trades, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (strategy_id) DO UPDATE SET
            win_rate = EXCLUDED.win_rate,
            avg_pnl = EXCLUDED.avg_pnl,
            expectancy = EXCLUDED.expectancy,
            drawdown = EXCLUDED.drawdown,
            total_trades = EXCLUDED.total_trades,
            updated_at = NOW()
        `, [strategyId, winRate, avgPnl, expectancy, maxDrawdown, totalTrades]);
        
        const perfScore = (winRate * 2) + Math.min(avgPnl / 100, 2) + expectancy - Math.min(maxDrawdown / 1000, 0.5);
        await pool.query(
            "UPDATE strategy_profiles SET performance_score = $1 WHERE id = $2",
            [perfScore, strategyId]
        );

        // Phase 8.5: Context-aware performance
        // Group trades by market_regime and volatility_level from trade_outcomes
        const ctxRes = await pool.query(`
            SELECT 
                o.market_regime, 
                o.volatility_level, 
                COUNT(t.id) as total_trades,
                AVG(CASE WHEN t.pnl > 0 THEN 1.0 ELSE 0.0 END) as win_rate,
                AVG(t.pnl) as avg_pnl,
                AVG(o.expectancy_contribution) as expectancy
            FROM trades t
            JOIN trade_outcomes o ON t.id = o.trade_id
            WHERE t.strategy_id = $1 AND t.status = 'CLOSED'
            AND o.market_regime IS NOT NULL AND o.volatility_level IS NOT NULL
            GROUP BY o.market_regime, o.volatility_level
        `, [strategyId]);

        for (const row of ctxRes.rows) {
            await pool.query(`
                INSERT INTO contextual_strategy_performance (strategy_id, market_regime, volatility_level, win_rate, avg_pnl, expectancy, total_trades, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                ON CONFLICT (strategy_id, market_regime, volatility_level) DO UPDATE SET
                win_rate = EXCLUDED.win_rate,
                avg_pnl = EXCLUDED.avg_pnl,
                expectancy = EXCLUDED.expectancy,
                total_trades = EXCLUDED.total_trades,
                updated_at = NOW()
            `, [
                strategyId, 
                row.market_regime || 'UNKNOWN', 
                row.volatility_level || 'NORMAL', 
                Number(row.win_rate), 
                Number(row.avg_pnl), 
                Number(row.expectancy), 
                Number(row.total_trades)
            ]);
        }
    }
}
