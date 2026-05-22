import { getPool } from "../db/connection";
import { MemoryRepository } from "../db/repositories/memory";
import { v4 as uuidv4 } from "uuid";
import { getEmbeddingProvider } from "./embeddings";
import { MemoryService } from "./memoryService";
import { StrategyProfileRepository } from "../db/repositories/strategyProfiles";

export class EvaluationService {
  static async evaluateTrade(
    tradeId: string, 
    userId: string, 
    portfolioId: string,
    correlationId?: string
  ) {
    const pool = getPool();
    const tradeResult = await pool.query(
      `SELECT * FROM trades WHERE id = $1`,
      [tradeId]
    );

    if (tradeResult.rows.length === 0) return;
    const trade = tradeResult.rows[0];

    // Simple evaluation summary
    const pnl = Number(trade.pnl || 0);
    const isWin = pnl > 0;
    const outcomeStr = isWin ? "Profitable trade" : (pnl < 0 ? "Loss-making trade" : "Breakeven trade");

    const durationMs = new Date(trade.closed_at).getTime() - new Date(trade.opened_at).getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    let strategyTag = "default";
    let confidenceScore = 0.5;
    let expectedGainPercentage = 2.0;
    let marketRegime = "UNKNOWN";
    let volatilityLevel = "NORMAL";

    if (correlationId) {
        const quantMemory = await MemoryService.getByCorrelation(correlationId, "QuantAgent");
        if (quantMemory && quantMemory.metadata) {
             strategyTag = quantMemory.metadata.strategy_tag || "default";
             confidenceScore = quantMemory.metadata.confidence_score || 0.5;
             marketRegime = quantMemory.market_regime || "UNKNOWN";
             volatilityLevel = quantMemory.metadata.volatility_level || "NORMAL";
             if (quantMemory.metadata.expected_return_pct) {
                 expectedGainPercentage = Number(quantMemory.metadata.expected_return_pct);
             } else {
                 expectedGainPercentage = confidenceScore * 5.0; // simple fallback
             }
        }
    }

    const predictedAlpha = expectedGainPercentage;

    const entry = Number(trade.entry_price);
    const actualReturnPercentage = entry > 0 ? (pnl / (entry * Number(trade.size))) * 100 : 0;
    
    // Normalize return by duration to calculate annualized or simple hourly alpha
    const timeScaledReturn = durationHours > 0 ? actualReturnPercentage / Math.max(1, durationHours / 24) : actualReturnPercentage;
    const actualAlpha = timeScaledReturn;
    
    // Duration Impact: if the trade was held a very short time and profited, high impact
    const durationImpact = actualReturnPercentage > 0 
        ? Math.max(0.1, 24 / Math.max(0.5, durationHours))
        : (actualReturnPercentage < 0 ? -Math.max(0.1, 24 / Math.max(0.5, durationHours)) : 0);

    // Expectancy Score
    const winRateAssumed = confidenceScore;
    const lossRateAssumed = 1 - confidenceScore;
    // rough Kelly-like expectancy
    const expectancyScore = (winRateAssumed * Math.max(0.1, actualAlpha)) - (lossRateAssumed * Math.abs(Math.min(-0.1, actualAlpha)));
    
    const rationale = JSON.stringify({
      context: "Post-trade evaluation",
      decision: `Closed trade for asset ${trade.asset_id}`,
      outcome: outcomeStr,
      pnl: pnl,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      size: trade.size,
      duration_hours: durationHours,
      duration_impact: durationImpact
    });

    const embedding = await getEmbeddingProvider().embedText(rationale).catch(() => new Array(768).fill(0));
    const score = pnl > 0 ? 1 : (pnl < 0 ? -1 : 0);

    // Accuracy Score logic
    let accuracyScore = 0.5; 
    if (isWin) {
        accuracyScore = 0.5 + (confidenceScore * 0.5);
    } else if (pnl < 0) {
        accuracyScore = 0.5 - (confidenceScore * 0.5);
    }

    await pool.query(
        `INSERT INTO trade_outcomes (trade_id, correlation_id, decision_context, predicted_alpha, actual_alpha, expectancy_contribution, feedback_vector, market_regime, volatility_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [tradeId, correlationId || null, rationale, predictedAlpha, actualAlpha, expectancyScore, `[${embedding.join(',')}]`, marketRegime, volatilityLevel]
    ).catch(err => { console.error("[Evaluation] Failed to save trade_outcome:", err) });

    await MemoryRepository.create(
      "POST_TRADE",
      rationale,
      embedding,
      userId,
      portfolioId,
      correlationId ? `${correlationId}-eval` : undefined,
      "EvaluationCoordinator",
      { asset_id: trade.asset_id, score, pnl, strategy_tag: strategyTag, accuracy_score: accuracyScore }
    );

    // Performance Aggregation logic for Strategy
    try {
        if (trade.strategy_id) {
            const { StrategyPerformanceService } = require('./strategyPerformanceService');
            await StrategyPerformanceService.trackStrategyPerformance(trade.strategy_id);
        }
    } catch (err) {
        console.error("[Evaluation] Failed to update strategy performance", err);
    }
  }
}


