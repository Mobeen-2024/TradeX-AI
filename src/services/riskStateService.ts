import { getPool } from "../db/connection";

export type RiskState = 'NORMAL' | 'ELEVATED' | 'CRITICAL';

export interface RiskStateAssessment {
    state: RiskState;
    drawdown: number;
    volatility: number;
    correlationSpike: boolean;
    lossStreak: number;
    riskMultiplier: number; // NORMAL: 1.0, ELEVATED: 0.7, CRITICAL: 0.3 or similar
}

export class RiskStateService {
    static async assessRiskState(portfolioId: string, assetId: string): Promise<RiskStateAssessment> {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            let drawdown = 0;
            let volatility = 0;
            let correlationSpike = false;
            let lossStreak = 0;
            
            // 1. Loss Streak Calculation
            const recentTrades = await client.query(`
                SELECT id, pnl, closed_at 
                FROM trades 
                WHERE portfolio_id = $1 AND status = 'CLOSED' 
                ORDER BY closed_at DESC 
                LIMIT 10
            `, [portfolioId]);
            
            for (const trade of recentTrades.rows) {
                if (Number(trade.pnl) < 0) {
                    lossStreak++;
                } else {
                    break;
                }
            }
            
            // 2. Drawdown Calculation (Approximate Peak)
            const balanceRes = await client.query(`SELECT cash_balance FROM balances WHERE portfolio_id = $1`, [portfolioId]);
            let currentCash = balanceRes.rows.length > 0 ? Number(balanceRes.rows[0].cash_balance) : 100000;
            
            const positionsRes = await client.query(`SELECT * FROM positions WHERE portfolio_id = $1`, [portfolioId]);
            let unrealizedPnl = 0;
            for (const pos of positionsRes.rows) {
                const cPriceRes = await client.query(`SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`, [pos.asset_id]);
                const currPrice = cPriceRes.rows.length > 0 ? Number(cPriceRes.rows[0].price) : Number(pos.avg_entry_price);
                unrealizedPnl += (currPrice - Number(pos.avg_entry_price)) * Number(pos.size);
            }
            
            const allTrades = await client.query(`SELECT pnl FROM trades WHERE portfolio_id = $1 AND status = 'CLOSED' ORDER BY closed_at ASC`, [portfolioId]);
            let runningBalance = 100000; // Simulated initial capital
            let peakValue = 100000;
            for (const t of allTrades.rows) {
                runningBalance += Number(t.pnl);
                if (runningBalance > peakValue) peakValue = runningBalance;
            }
            
            const trueCurrentValue = runningBalance + unrealizedPnl;
            if (trueCurrentValue > peakValue) peakValue = trueCurrentValue;
            
            drawdown = peakValue > 0 ? (peakValue - trueCurrentValue) / peakValue : 0;
            if (drawdown < 0) drawdown = 0;

            // 3. Volatility Calculation (Rolling)
            const recentTicks = await client.query(`
                SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 50
            `, [assetId]);
            
            if (recentTicks.rows.length >= 10) {
                const prices = recentTicks.rows.map(r => Number(r.price));
                const maxPrice = Math.max(...prices);
                const minPrice = Math.min(...prices);
                const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                volatility = avgPrice > 0 ? (maxPrice - minPrice) / avgPrice : 0;
            }
            
            // 4. Correlation Spikes
            if (volatility > 0.05) {
                correlationSpike = true;
            }
            
            // LAYER 1: RISK STATE CLASSIFICATION
            let state: RiskState = 'NORMAL';
            
            // Auto-downgrades based on thresholds
            if (drawdown > 0.15 || lossStreak >= 5 || correlationSpike) {
                state = 'CRITICAL';
            } else if (drawdown > 0.05 || lossStreak >= 3 || volatility > 0.02) {
                state = 'ELEVATED';
            }
            
            // LAYER 5: SYSTEM SAFETY & SMOOTHING (No hard oscillations)
            // Use a continuous mathematical blend based on the severity of factors to gradually restore risk
            
            // Gradual penalty smoothing to avoid harsh binary cliffs
            const drawdownPenalty = Math.min(0.6, drawdown * 2); // 15% drawdown = 0.3 penalty
            const volPenalty = Math.min(0.3, volatility > 0.01 ? (volatility - 0.01) * 10 : 0);
            const streakPenalty = Math.min(0.5, lossStreak * 0.1);
            
            // Smooth multiplier applies continuous degradation
            let smoothedMultiplier = 1.0 - drawdownPenalty - volPenalty - streakPenalty;
            smoothedMultiplier = Math.max(0.1, Math.min(1.0, smoothedMultiplier)); // Floor at 0.1 to prevent full 0 unless critical manually blocked
            
            // Assign the riskMultiplier directly from smoothed value to prevent any hard state cliffs
            let riskMultiplier = smoothedMultiplier;

            // Pre-trade risk filter block (Critical can block if strictly defined, but rule says "never allow full shutdown unless critical persists")
            // Here, returning a multiplier handles capital throttling without breaking pipelines.

            return {
                state,
                drawdown,
                volatility,
                correlationSpike,
                lossStreak,
                riskMultiplier
            };
        } finally {
            client.release();
        }
    }
}

