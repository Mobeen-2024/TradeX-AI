import { PositionRepository } from "../db/repositories/positions";
import { MemoryRepository } from "../db/repositories/memory";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { TradeRepository } from "../db/repositories/trades";
import { MarketTickRepository } from "../db/repositories/marketTicks";
import { aiService } from "../services/aiService";
import { EventDispatcher, EventType } from "../events";

export class RiskGuardian {
  static async evaluateRisk(portfolioId: string, userId: string, correlationId?: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for RiskGuardian.");
      }

      // 1. Get portfolio positions
      const positions = await PositionRepository.findByPortfolioId(portfolioId);

      const MAX_POSITION_USD = 150000;
      const MAX_PORTFOLIO_USD = 500000;

      let totalExposureUsd = 0;
      let hasPositionLimitBreach = false;

      let positionsContext = "No active positions.";
      if (positions.length > 0) {
        positionsContext = positions.map(p => {
          const posValue = Number(p.size) * Number(p.avg_entry_price);
          totalExposureUsd += posValue;
          if (posValue > MAX_POSITION_USD) hasPositionLimitBreach = true;
          return `- Asset: ${p.asset_id}, Size: ${p.size}, Value: $${posValue}, Unrealized/Realized PnL: ${p.pnl_realized}`;
        }).join("\n");
      }

      // 2. Get latest Quant Analysis
      const recentLogs = await MemoryRepository.getRecent(1, portfolioId, userId);
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
              const wins = pnls.filter(p => p > 0).length;
              const losses = pnls.filter(p => p < 0).length;
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
              const spreadPct = avgPrice > 0 ? ((maxPrice - minPrice) / avgPrice) * 100 : 0;
              volatilityContext = `Recent 20 tick volatility: ${spreadPct.toFixed(2)}% spread.`;
          }
      } catch (e) {}

      // 3. Evaluate exposure and risk using Gemini
      const prompt = `You are a Risk Guardian, an expert in portfolio risk management.
Evaluate the current position exposure and margin risk given the current market context.
Determine an optimal adaptive 'position_size' (0.01 to 2.00) based on recent win/loss streaks and market volatility.

Portfolio Positions:
${positionsContext}
Total Portfolio Exposure: $${totalExposureUsd}

Recent Trade Outcomes (for sizing streaks):
${winLossContext}

Market Volatility (for sizing defensively):
${volatilityContext}

Rules:
- Max Position Size: $${MAX_POSITION_USD}
- Max Portfolio Exposure: $${MAX_PORTFOLIO_USD}
If any rule is breached, you MUST set riskLevel to "HIGH".
If recent trades are heavily losing or volatility is extremely high, reduce position_size.
If winning streak and low volatility, increase position_size.

Recent Quant Analysis context:
${quantContext}

Provide a JSON output evaluating the risk levels, your planned position size allocation, and detailed rationale.
Format exactly as JSON:
{
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "marginRisk": "SAFE" | "WARNING" | "DANGER",
  "position_size": 1.0,
  "aiRationale": "Your detailed risk reasoning..."
}`;

      let responseText = "{}";
      let fallbackUsed = false;
      let apiErrorMessage = "";
      try {
        const textResponse = await aiService.generateContent(prompt, "gemini-3.1-pro-preview");
        responseText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim() || "{}";
      } catch (apiError: any) {
        console.warn("RiskGuardian Gemini API failed, fallback", apiError.message);
        fallbackUsed = true;
        apiErrorMessage = apiError.message;
        responseText = JSON.stringify({
          riskLevel: "HIGH",
          marginRisk: "WARNING",
          position_size: 1.0,
          aiRationale: "API Error, fallback to HIGH risk. " + apiError.message
        });
      }

      const text = responseText;
      let riskEvaluation;
      try {
        riskEvaluation = JSON.parse(text);
      } catch (e) {
        console.warn("RiskGuardian Gemini parsing failed, fallback");
        fallbackUsed = true;
        apiErrorMessage = apiErrorMessage || "Failed to parse AI output.";
        riskEvaluation = {
          riskLevel: "HIGH",
          marginRisk: "WARNING",
          position_size: 1.0,
          aiRationale: "Failed to parse AI output. Raw: " + text
        };
      }

      // HARD ENFORCEMENT OF LIMITS (Authoritative check)
      if (hasPositionLimitBreach || totalExposureUsd > MAX_PORTFOLIO_USD) {
        riskEvaluation.riskLevel = "HIGH";
        riskEvaluation.aiRationale = "[SYSTEM OVERRIDE] Hard risk limits breached. " + riskEvaluation.aiRationale;
      }

      // 4. Persist risk rationale into semantic_memory_logs
      const rationaleStr = `Risk Level: ${riskEvaluation.riskLevel} | Margin Risk: ${riskEvaluation.marginRisk} | Position Size: ${riskEvaluation.position_size || 1.0} | Rationale: ${riskEvaluation.aiRationale}`;
      const loggedMemory = await MemoryService.logMemory(
        `RISK_EVALUATION (${riskEvaluation.riskLevel})`, // using market regime for tags
        rationaleStr,
        userId,
        portfolioId,
        correlationId,
        "RiskGuardian"
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
        portfolio_id: portfolioId
      });

      await EventDispatcher.emit(EventType.RISK_VALIDATED, { portfolioId, riskLevel: riskEvaluation.riskLevel, correlationId });

      return {
        newRiskEvaluation: loggedMemory,
        rawOutput: riskEvaluation
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
        portfolio_id: portfolioId
      });
      throw error;
    }
  }
}
