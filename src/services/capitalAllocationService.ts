import { StrategyAllocationRepository } from "../db/repositories/strategyAllocations";

export class CapitalAllocationService {
    static async rebalanceAllocations(portfolioId: string) {
        // Fetch all active strategies and their performance
        const strategies = await StrategyAllocationRepository.getActiveStrategiesPerformance(portfolioId);
        
        if (strategies.length === 0) return;
        
        let totalScore = 0;
        const scores = [];
        
        for (const s of strategies) {
            let score = (Number(s.performance_score) || 0) + (Number(s.expectancy) || 0) * 10 - (Number(s.drawdown) || 0) * 5;
            // Ensure a baseline score
            if (score <= 0) score = 0.1;
            scores.push({ id: s.id, rawScore: score });
            totalScore += score;
        }
        
        // Distribute capital based on normalized scores
        const maxAllocation = 0.40;
        const minAllocation = 0.05;
        
        let remainingAllocation = 1.0;
        let allocations = [];
        
        for (const s of scores) {
            let pct = totalScore > 0 ? s.rawScore / totalScore : (1.0 / scores.length);
            // Apply constraints
            pct = Math.max(minAllocation, Math.min(maxAllocation, pct));
            allocations.push({ id: s.id, pct });
        }
        
        // Re-normalize after constraints
        const totalPct = allocations.reduce((sum, a) => sum + a.pct, 0);
        allocations = allocations.map(a => ({
            id: a.id,
            pct: a.pct / totalPct
        }));
        
        for (const a of allocations) {
            await StrategyAllocationRepository.upsertAllocation(portfolioId, a.id, a.pct, 1.0);
        }
    }

    static async getAllocations(portfolioId: string) {
        return await StrategyAllocationRepository.getAllocations(portfolioId);
    }

    static async getContextualAllocations(portfolioId: string, marketRegime: string, volatilityLevel: string) {
        const pool = require("../db/connection").getPool();
        const baseAllocations = await this.getAllocations(portfolioId);
        if (baseAllocations.length === 0) return [];

        // Fetch contextual performance for these strategies
        const ctxRes = await pool.query(`
            SELECT strategy_id, win_rate, avg_pnl, expectancy
            FROM contextual_strategy_performance
            WHERE market_regime = $1 OR volatility_level = $2
        `, [marketRegime, volatilityLevel]);
        
        const contextMap = new Map();
        for (const row of ctxRes.rows) {
            contextMap.set(row.strategy_id, row);
        }

        let totalScore = 0;
        const adjusted = [];

        for (const alloc of baseAllocations) {
            let score = Number(alloc.allocation_percentage);
            const ctxPerf = contextMap.get(alloc.strategy_id);
            if (ctxPerf) {
                // Boost or reduce based on contextual expectancy and win_rate
                const ctxWinRate = Number(ctxPerf.win_rate) || 0;
                const ctxExpectancy = Number(ctxPerf.expectancy) || 0;
                let multiplier = 1.0;
                if (ctxWinRate > 0.6) multiplier += 0.5;
                if (ctxWinRate < 0.4) multiplier -= 0.5;
                if (ctxExpectancy > 0.02) multiplier += 0.5;
                if (ctxExpectancy < -0.01) multiplier -= 0.5;

                multiplier = Math.max(0.1, multiplier); // avoid 0
                score *= multiplier;
            } else {
                // If no contextual data, penalize slightly to prefer known regimes
                score *= 0.8; 
            }
            adjusted.push({ ...alloc, adjustedScore: score });
            totalScore += score;
        }

        // Renormalize
        const minAlloc = 0.05;
        let finalAllocations = [];
        let reTotal = 0;
        
        // Ensure at least 2 strategies
        for (const a of adjusted) {
            let pct = totalScore > 0 ? a.adjustedScore / totalScore : (1.0 / adjusted.length);
            pct = Math.max(minAlloc, pct);
            finalAllocations.push({ ...a, allocation_percentage: pct });
            reTotal += pct;
        }

        return finalAllocations.map(a => ({
            ...a,
            allocation_percentage: Number((a.allocation_percentage / reTotal).toFixed(4))
        }));
    }
}
