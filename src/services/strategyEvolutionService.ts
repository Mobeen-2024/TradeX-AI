import { getPool } from "../db/connection";
import { TradeOutcomesRepository } from "../db/repositories/tradeOutcomes";

export interface EvolutionInsight {
    failureType: string;
    adjustmentSignal: string;
    confidenceDelta: number;
    metadata: any;
    createdAt: string;
}

export class StrategyEvolutionService {
    static async processClosedTrade(tradeId: string, portfolioId: string): Promise<void> {
        const pool = getPool();
        const client = await pool.connect();

        try {
            // LAYER 1: FAILURE ANALYSIS ENGINE
            const tradeRes = await client.query(`
                SELECT t.pnl, t.asset_id, t.opened_at, t.closed_at, a.market_regime, a.confidence_score, a.rationale
                FROM trades t
                LEFT JOIN agent_decisions a ON a.portfolio_id = t.portfolio_id AND a.asset_id = t.asset_id 
                   AND a.created_at >= t.opened_at AND a.created_at <= t.closed_at
                WHERE t.id = $1
            `, [tradeId]);

            if (tradeRes.rows.length === 0) return;

            const trade = tradeRes.rows[0];
            const pnl = Number(trade.pnl);

            if (pnl >= 0) {
                // Not a failure, skip for now. We mostly focus on failure analysis.
                return;
            }

            // Extract context
            const marketRegime = trade.market_regime || 'UNKNOWN';
            const confidenceScore = trade.confidence_score ? Number(trade.confidence_score) : 1.0;
            const rationale = trade.rationale || '';

            // Heuristic to measure volatility during trade
            const tickRes = await client.query(`
                SELECT MIN(price) as min_p, MAX(price) as max_p
                FROM market_ticks
                WHERE symbol = $1 AND timestamp >= $2 AND timestamp <= $3
            `, [trade.asset_id, trade.opened_at, trade.closed_at]);

            let volatility = 0;
            if (tickRes.rows.length > 0) {
                const min_p = Number(tickRes.rows[0].min_p);
                const max_p = Number(tickRes.rows[0].max_p);
                if (min_p > 0) volatility = (max_p - min_p) / min_p;
            }

            // Classify failure
            let failureType = 'UNKNOWN';
            let adjustmentSignal = 'NO_ACTION';
            let confidenceDelta = 0;

            const openTime = new Date(trade.opened_at).getTime();
            const closeTime = new Date(trade.closed_at).getTime();
            const holdDurationMs = closeTime - openTime;

            if (pnl < 0 && volatility > 0.05) {
                failureType = 'VOLATILITY_WHIPSAW';
                adjustmentSignal = 'REDUCE_EXPOSURE_IN_HIGH_VOLATILITY';
                confidenceDelta = -0.15;
            } else if (pnl < 0 && holdDurationMs < 600000) { // less than 10 mins
                failureType = 'BAD_TIMING_RUSHED_ENTRY';
                adjustmentSignal = 'INCREASE_CONFIRMATION_TIME';
                confidenceDelta = -0.10;
            } else if (pnl < 0 && confidenceScore > 0.8) {
                failureType = 'OVERCONFIDENCE';
                adjustmentSignal = 'PENALIZE_HIGH_CONFIDENCE_IN_CURRENT_REGIME';
                confidenceDelta = -0.20;
            } else if (pnl < 0 && marketRegime !== 'TRENDING') {
                failureType = 'REGIME_MISMATCH';
                adjustmentSignal = `SHIFT_BIAS_AWAY_FROM_${marketRegime}`;
                confidenceDelta = -0.10;
            } else {
                failureType = 'WRONG_DIRECTION';
                adjustmentSignal = 'REASSESS_DIRECTIONAL_EDGE';
                confidenceDelta = -0.05;
            }

            // LAYER 4: MEMORY WRITING
            const metadata = {
                marketRegime,
                volatility,
                rationale,
                originalConfidence: confidenceScore,
                holdDurationMs
            };

            await client.query(`
                INSERT INTO strategy_evolution_logs (portfolio_id, trade_id, failure_type, adjustment_signal, confidence_delta, contextual_metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [portfolioId, tradeId, failureType, adjustmentSignal, confidenceDelta, JSON.stringify(metadata)]);

        } finally {
            client.release();
        }
    }

    static async getRecentInsights(portfolioId: string, limit: number = 5): Promise<EvolutionInsight[]> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            const res = await client.query(`
                SELECT failure_type, adjustment_signal, confidence_delta, contextual_metadata, created_at
                FROM strategy_evolution_logs
                WHERE portfolio_id = $1
                ORDER BY created_at DESC
                LIMIT $2
            `, [portfolioId, limit]);

            return res.rows.map(row => ({
                failureType: row.failure_type,
                adjustmentSignal: row.adjustment_signal,
                confidenceDelta: Number(row.confidence_delta),
                metadata: row.contextual_metadata,
                createdAt: row.created_at
            }));
        } finally {
            client.release();
        }
    }

    static async getFeedbackMetrics(portfolioId: string) {
        const aggregated = await TradeOutcomesRepository.getAggregatedMetrics(portfolioId);
        const byRegime = await TradeOutcomesRepository.getMetricsByRegime(portfolioId);
        return {
            overall: aggregated || { winRate: 0, avgAlpha: 0, expectancy: 0, totalTrades: 0 },
            byRegime
        };
    }
}

