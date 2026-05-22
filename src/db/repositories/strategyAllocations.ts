import { getPool } from "../connection";

export class StrategyAllocationRepository {
    static async upsertAllocation(portfolioId: string, strategyId: string, allocationPercentage: number, riskWeight: number) {
        const pool = getPool();
        await pool.query(`
            INSERT INTO strategy_allocations (portfolio_id, strategy_id, allocation_percentage, risk_weight, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (portfolio_id, strategy_id) DO UPDATE SET
                allocation_percentage = EXCLUDED.allocation_percentage,
                risk_weight = EXCLUDED.risk_weight,
                updated_at = NOW()
        `, [portfolioId, strategyId, allocationPercentage, riskWeight]);
    }

    static async getAllocations(portfolioId: string) {
        const pool = getPool();
        const res = await pool.query(`
            SELECT a.strategy_id, a.allocation_percentage, a.risk_weight, p.name 
            FROM strategy_allocations a
            JOIN strategy_profiles p ON a.strategy_id = p.id
            WHERE a.portfolio_id = $1
        `, [portfolioId]);
        return res.rows;
    }

    static async getAllocationForStrategy(portfolioId: string, strategyId: string) {
        const pool = getPool();
        const res = await pool.query(`
            SELECT allocation_percentage, risk_weight
            FROM strategy_allocations
            WHERE portfolio_id = $1 AND strategy_id = $2
        `, [portfolioId, strategyId]);
        return res.rows[0] || null;
    }

    static async getActiveStrategiesPerformance(portfolioId: string) {
        const pool = getPool();
        const res = await pool.query(`
            SELECT p.id, p.performance_score, sp.expectancy, sp.drawdown
            FROM strategy_profiles p
            LEFT JOIN strategy_performance sp ON p.id = sp.strategy_id
            WHERE p.portfolio_id = $1 AND p.is_active = true
        `, [portfolioId]);
        return res.rows;
    }
}
