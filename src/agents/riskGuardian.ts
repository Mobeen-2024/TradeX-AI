import { PositionRepository } from "../db/repositories/positions";
import { MemoryRepository } from "../db/repositories/memory";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { TradeRepository } from "../db/repositories/trades";
import { MarketTickRepository } from "../db/repositories/marketTicks";
import { aiService } from "../services/aiService";
import { EventDispatcher, EventType } from "../events";

export class RiskGuardian {
  static async evaluateRisk(
    portfolioId: string,
    userId: string,
    correlationId?: string,
  ) {
    const startTimestamp = new Date();
    try {
      // 1. Get portfolio positions
      const positions = await PositionRepository.findByPortfolioId(portfolioId);

      const MAX_POSITION_USD = 150000;
      const MAX_PORTFOLIO_USD = 500000;

      let totalExposureUsd = 0;
      let hasPositionLimitBreach = false;

      let positionsContext = "No active positions.";
      if (positions.length > 0) {
        positionsContext = positions
          .map((p) => {
            const posValue = Number(p.size) * Number(p.avg_entry_price);
            totalExposureUsd += posValue;
            if (posValue > MAX_POSITION_USD) hasPositionLimitBreach = true;
            return `- Asset: ${p.asset_id}, Size: ${p.size}, Value: $${posValue}, Unrealized/Realized PnL: ${p.pnl_realized}`;
          })
          .join("\n");
      }

      // 2. Get latest Quant Analysis
      const recentLogs = await MemoryRepository.getRecent(
        1,
        portfolioId,
        userId,
      );
      let quantContext = "No prior quantitative analysis available.";
      if (recentLogs.length > 0) {
        const log = recentLogs[0];
        quantContext = `Latest Market Regime: ${log.market_regime}\nLatest Quant Rationale: ${log.ai_rationale}`;
      }

      // 2b. Get recent Win/Loss
      let winLossContext = "No recent trades.";
      try {
        const pnls = await TradeRepository.getRecentClosedPnls(portfolioId, 3);
        if (pnls.length > 0) {
          const wins = pnls.filter((p) => p > 0).length;
          const losses = pnls.filter((p) => p < 0).length;
          winLossContext = `Recent closed trades: ${wins} wins, ${losses} losses. PnLs: ${pnls.join(", ")}`;
        }
      } catch (e) {}

      // 2c. Get Volatility Proxy
      let volatilityContext = "Unknown volatility.";
      try {
        const prices = await MarketTickRepository.getRecentPrices(20);
        if (prices.length >= 10) {
          const maxPrice = Math.max(...prices);
          const minPrice = Math.min(...prices);
          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const spreadPct =
            avgPrice > 0 ? ((maxPrice - minPrice) / avgPrice) * 100 : 0;
          volatilityContext = `Recent 20 tick volatility: ${spreadPct.toFixed(2)}% spread.`;
        }
      } catch (e) {}

      // 3. Evaluate exposure and risk using deterministic rules
      let riskLevel = "LOW";
      let marginRisk = "SAFE";
      let position_size = 1.0;

      if (hasPositionLimitBreach || totalExposureUsd > MAX_PORTFOLIO_USD) {
        riskLevel = "HIGH";
        marginRisk = "DANGER";
        position_size = 0.5;
      } else if (
        totalExposureUsd > MAX_PORTFOLIO_USD * 0.8 ||
        volatilityContext.includes("HIGH")
      ) {
        riskLevel = "MODERATE";
        marginRisk = "WARNING";
        position_size = 0.8;
      }

      const riskEvaluation = {
        riskLevel,
        marginRisk,
        position_size,
        aiRationale: `Rule-based risk assessment. Exposure: $${totalExposureUsd}. Position limit breach: ${hasPositionLimitBreach}.`,
      };
      const fallbackUsed = false;
      const apiErrorMessage = "";

      // HARD ENFORCEMENT OF LIMITS (Authoritative check)
      if (hasPositionLimitBreach || totalExposureUsd > MAX_PORTFOLIO_USD) {
        riskEvaluation.riskLevel = "HIGH";
        riskEvaluation.aiRationale =
          "[SYSTEM OVERRIDE] Hard risk limits breached. " +
          riskEvaluation.aiRationale;
      }

      // 4. Persist risk rationale into semantic_memory_logs
      const rationaleStr = `Risk Level: ${riskEvaluation.riskLevel} | Margin Risk: ${riskEvaluation.marginRisk} | Position Size: ${riskEvaluation.position_size || 1.0} | Rationale: ${riskEvaluation.aiRationale}`;
      const loggedMemory = await MemoryService.logMemory(
        `RISK_EVALUATION (${riskEvaluation.riskLevel})`, // using market regime for tags
        rationaleStr,
        userId,
        portfolioId,
        correlationId,
        "RiskGuardian",
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "RiskGuardian",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: !fallbackUsed,
        fallback_used: fallbackUsed,
        error_message: fallbackUsed ? apiErrorMessage : null,
        user_id: userId,
        portfolio_id: portfolioId,
      });

      await EventDispatcher.emit(EventType.RISK_VALIDATED, {
        portfolioId,
        riskLevel: riskEvaluation.riskLevel,
        correlationId,
      });

      return {
        newRiskEvaluation: loggedMemory,
        rawOutput: riskEvaluation,
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "RiskGuardian",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: false,
        error_message: error.message || "Unknown error",
        user_id: userId,
        portfolio_id: portfolioId,
      });
      throw error;
    }
  }
}
