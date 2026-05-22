import { getPool } from "../db/connection";

export interface StrategyProfile {
    portfolioId: string;
    winRate: number;
    expectancy: number; 
    avgHoldingTimeMs: number;
    volatilityExposure: number; 
    edgeDecayPenalty: number;
    regimeScore: number;
    baseScore: number;
}

export class StrategyIntelligenceService {
    static async getStrategyScore(portfolioId: string, currentRegime: string): Promise<StrategyProfile> {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            // LAYER 6: MEMORY INTEGRATION
            // Fetch all trades, ordering by closed_at to detect trends (failures & successes)
            const tradesRes = await client.query(`
                SELECT t.id, t.pnl, t.opened_at, t.closed_at, a.market_regime 
                FROM trades t
                LEFT JOIN agent_decisions a ON a.portfolio_id = t.portfolio_id AND a.asset_id = t.asset_id 
                   AND a.created_at >= t.opened_at AND a.created_at <= t.closed_at
                WHERE t.portfolio_id = $1 AND t.status = 'CLOSED' 
                ORDER BY t.closed_at ASC
            `, [portfolioId]);
            
            const trades = tradesRes.rows;
            
            // New strategies bootstrap
            if (trades.length === 0) {
                return {
                    portfolioId, winRate: 0.5, expectancy: 0, avgHoldingTimeMs: 0, 
                    volatilityExposure: 0, edgeDecayPenalty: 0, regimeScore: 1.0, baseScore: 0.5
                };
            }
            
            // LAYER 1: STRATEGY PROFILING
            let wins = 0;
            let totalWinPnl = 0;
            let losses = 0;
            let totalLossPnl = 0;
            let totalHoldingTime = 0;
            
            for (const t of trades) {
                const pnl = Number(t.pnl);
                if (pnl > 0) {
                    wins++;
                    totalWinPnl += pnl;
                } else {
                    losses++;
                    totalLossPnl += Math.abs(pnl);
                }
                const openTime = new Date(t.opened_at).getTime();
                const closeTime = new Date(t.closed_at).getTime();
                totalHoldingTime += (closeTime - openTime);
            }
            
            const winRate = wins / trades.length;
            const lossRate = 1 - winRate;
            const avgWin = wins > 0 ? totalWinPnl / wins : 0;
            const avgLoss = losses > 0 ? totalLossPnl / losses : 0;
            
            // Expectancy: Average amount won/lost per trade
            const expectancy = (winRate * avgWin) - (lossRate * avgLoss);
            const avgHoldingTimeMs = totalHoldingTime / trades.length;
            
            // LAYER 2: EDGE DECAY DETECTION 
            // Compare last 10 trades to overall strategy performance
            const recentTrades = trades.slice(-10);
            let recentWins = 0;
            let recentTotalWin = 0;
            let recentTotalLoss = 0;
            
            for (const t of recentTrades) {
                const pnl = Number(t.pnl);
                if (pnl > 0) {
                    recentWins++;
                    recentTotalWin += pnl;
                } else {
                    recentTotalLoss += Math.abs(pnl);
                }
            }
            
            const recentWinRate = recentTrades.length > 0 ? recentWins / recentTrades.length : winRate;
            const recentAvgWin = recentWins > 0 ? recentTotalWin / recentWins : avgWin;
            const recentAvgLoss = (recentTrades.length - recentWins) > 0 ? recentTotalLoss / (recentTrades.length - recentWins) : avgLoss;
            const recentExpectancy = (recentWinRate * recentAvgWin) - ((1 - recentWinRate) * recentAvgLoss);
            
            let edgeDecayPenalty = 0;
            if (trades.length > 15) { // Ensure sufficient data to detect edge decay
                // Declining win rate
                if (recentWinRate < winRate * 0.8) edgeDecayPenalty += 0.2;
                // Shrinking expectancy
                if (recentExpectancy < expectancy * 0.7) edgeDecayPenalty += 0.2;
                // Increasing variance (higher average losses indicating loss of control)
                if (recentAvgLoss > avgLoss * 1.5) edgeDecayPenalty += 0.15;
            }
            
            // LAYER 3: REGIME MATCHING
            let regimeWins = 0;
            let regimeTrades = 0;
            for (const t of trades) {
                if (t.market_regime === currentRegime || currentRegime === 'UNKNOWN') {
                    regimeTrades++;
                    if (Number(t.pnl) > 0) regimeWins++;
                }
            }
            
            let regimeScore = 1.0;
            if (regimeTrades >= 5) {
                const regimeWinRate = regimeWins / regimeTrades;
                if (regimeWinRate < 0.4) {
                    regimeScore = 0.7; // Heavy penalty for poor regime fit
                } else if (regimeWinRate >= 0.6) {
                    regimeScore = 1.3; // Boost allocation during strong regime
                }
            } else if (currentRegime !== 'UNKNOWN') {
                // Mild penalty for unproven regime performance
                regimeScore = 0.9;
            }
            
            // LAYER 4: CONFIDENCE SCORING
            // strategy_score = weighted(expectancy, consistency, regime fit)
            
            // Normalize expectancy via simple cap
            const maxNormExpectancy = 200; 
            let normExpectancy = Math.max(0, Math.min(1, expectancy / maxNormExpectancy)); 
            if (expectancy < 0) normExpectancy = -Math.min(1, Math.abs(expectancy) / maxNormExpectancy);
            
            const consistency = Math.max(0, Math.min(1, winRate)); // [0, 1] range
            
            // Weighted base score (ignoring regime fit as it's applied outside)
            const baseScore = (normExpectancy * 0.4) + (consistency * 0.6);
            
            return {
                portfolioId,
                winRate,
                expectancy,
                avgHoldingTimeMs,
                volatilityExposure: 0, // Placeholder
                edgeDecayPenalty: Math.min(1.0, edgeDecayPenalty),
                regimeScore,
                baseScore
            };
        } finally {
            client.release();
        }
    }
}
