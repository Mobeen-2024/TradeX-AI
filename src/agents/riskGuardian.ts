import { PositionRepository } from "../db/repositories/positions";
import { MemoryRepository } from "../db/repositories/memory";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { TradeRepository } from "../db/repositories/trades";
import { MarketTickRepository } from "../db/repositories/marketTicks";
import { aiService } from "../services/aiService";
import { EventDispatcher, EventType } from "../events";
import { RiskStateService } from "../services/riskStateService";
import { GlobalPortfolioService } from "../services/globalPortfolioService";

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

      // 3. Evaluate exposure and risk using advanced mathematical engines
      const assetId = positions.length > 0 ? positions[0].asset_id : "BTC";
      const riskAssessment = await RiskStateService.assessRiskState(portfolioId, assetId);
      const globalWeight = await GlobalPortfolioService.getPortfolioWeight(portfolioId);

      let riskLevel = "LOW";
      let marginRisk = "SAFE";

      if (riskAssessment.state === "CRITICAL" || hasPositionLimitBreach || totalExposureUsd > MAX_PORTFOLIO_USD) {
        riskLevel = "HIGH";
        marginRisk = "DANGER";
      } else if (riskAssessment.state === "ELEVATED" || totalExposureUsd > MAX_PORTFOLIO_USD * 0.8) {
        riskLevel = "MODERATE";
        marginRisk = "WARNING";
      }

      const riskEvaluation = {
        riskLevel,
        marginRisk,
        position_size: riskAssessment.riskMultiplier, // Continuous multiplier
        globalWeight,
        aiRationale: `Continuous mathematical risk assessment. RiskState: ${riskAssessment.state}, Multiplier: ${riskAssessment.riskMultiplier.toFixed(4)}, GlobalWeight: ${globalWeight.toFixed(4)}. Drawdown: ${(riskAssessment.drawdown * 100).toFixed(2)}%, Loss Streak: ${riskAssessment.lossStreak}, Volatility: ${(riskAssessment.volatility * 100).toFixed(2)}%. Exposure: $${totalExposureUsd}. Position limit breach: ${hasPositionLimitBreach}.`,
      };
      const fallbackUsed = false;
      const apiErrorMessage = "";

      // HARD ENFORCEMENT OF LIMITS (Authoritative check)
      if (hasPositionLimitBreach || totalExposureUsd > MAX_PORTFOLIO_USD || riskAssessment.state === "CRITICAL") {
        riskEvaluation.riskLevel = "HIGH";
        riskEvaluation.aiRationale =
          "[SYSTEM OVERRIDE] Hard risk limits breached / CRITICAL risk state. " +
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
        {
          risk_multiplier: riskEvaluation.position_size,
          global_weight: riskEvaluation.globalWeight,
          drawdown: riskAssessment.drawdown,
          volatility: riskAssessment.volatility,
          loss_streak: riskAssessment.lossStreak,
          risk_state: riskAssessment.state,
          correlation_spike: riskAssessment.correlationSpike,
        }
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
        rawOutput: riskEvaluation,
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
