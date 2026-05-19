import { PositionRepository } from "../db/repositories/positions";
import { MemoryRepository } from "../db/repositories/memory";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { GoogleGenAI } from "@google/genai";

export class RiskGuardian {
  static async evaluateRisk(portfolioId: string, userId: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for RiskGuardian.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // 1. Get portfolio positions
      const positions = await PositionRepository.findByPortfolioId(portfolioId);
      let positionsContext = "No active positions.";
      if (positions.length > 0) {
        positionsContext = positions.map(
          p => `- Asset: ${p.asset_id}, Size: ${p.size}, Entry Price: $${p.entry_price}, Unrealized/Realized PnL: ${p.pnl_realized}`
        ).join("\n");
      }

      // 2. Get latest Quant Analysis
      const recentLogs = await MemoryRepository.getRecent(1, portfolioId, userId);
      let quantContext = "No prior quantitative analysis available.";
      if (recentLogs.length > 0) {
        const log = recentLogs[0];
        quantContext = `Latest Market Regime: ${log.market_regime}\nLatest Quant Rationale: ${log.ai_rationale}`;
      }

      // 3. Evaluate exposure and risk using Gemini
      const prompt = `You are a Risk Guardian, an expert in portfolio risk management.
Evaluate the current position exposure and margin risk given the current market context provided by the Quant service.

Portfolio Positions:
${positionsContext}

Recent Quant Analysis context:
${quantContext}

Provide a JSON output evaluating the risk levels and your detailed rationale.
Format exactly as JSON:
{
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "marginRisk": "SAFE" | "WARNING" | "DANGER",
  "aiRationale": "Your detailed risk reasoning..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const text = response.text || "{}";
      let riskEvaluation;
      try {
        riskEvaluation = JSON.parse(text);
      } catch (e) {
        console.warn("RiskGuardian Gemini parsing failed, fallback");
        riskEvaluation = {
          riskLevel: "HIGH",
          marginRisk: "WARNING",
          aiRationale: "Failed to parse AI output. Raw: " + text
        };
      }

      // 4. Persist risk rationale into semantic_memory_logs
      const rationaleStr = `Risk Level: ${riskEvaluation.riskLevel} | Margin Risk: ${riskEvaluation.marginRisk} | Rationale: ${riskEvaluation.aiRationale}`;
      const loggedMemory = await MemoryService.logMemory(
        riskEvaluation.riskLevel, // Leveraging market_regime field for Risk Level temporarily or we just pass null? 
        // Wait, market_regime is string so we can pass risk level there, but maybe better to just use Risk: XXX
        `RISK_EVALUATION (${riskEvaluation.riskLevel})`, // using market regime for tags
        rationaleStr,
        userId,
        portfolioId
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "RiskGuardian",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: true,
        user_id: userId,
        portfolio_id: portfolioId
      });

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
