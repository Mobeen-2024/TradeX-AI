import { QuantAgent } from "./quantAgent";
import { RiskGuardian } from "./riskGuardian";
import { NewsOracle } from "./newsOracle";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { GoogleGenAI } from "@google/genai";

export class Coordinator {
  static async runCycle(portfolioId: string, userId: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for Coordinator.");
      }

      // 1. Run Quant
      const quantResult = await QuantAgent.analyzeMarket(portfolioId, userId);

      // 2. Run Risk (RiskGuardian uses latest memory, which is now quantResult)
      const riskResult = await RiskGuardian.evaluateRisk(portfolioId, userId);

      // 3. Run News
      const newsResult = await NewsOracle.analyzeSentiment(portfolioId, userId);

      // 4. Aggregate Decision
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are the Chief Investment Officer (Coordinator).
Synthesize the analysis from your three specialized agents and produce a final aggregated trading decision.

1. Quant Analysis:
${JSON.stringify(quantResult.rawOutput, null, 2)}

2. Risk Analysis:
${JSON.stringify(riskResult.rawOutput, null, 2)}

3. News Sentiment:
${JSON.stringify(newsResult.rawOutput, null, 2)}

Provide a JSON output with the final aggregate decision.
Format exactly as JSON:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "rationale": "Your detailed synthesis and final decision reasoning..."
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
      let aggregateDecision;
      try {
        aggregateDecision = JSON.parse(text);
      } catch (e) {
        console.warn("Coordinator Gemini parsing failed, fallback");
        aggregateDecision = {
          action: "HOLD",
          confidence: "LOW",
          rationale: "Failed to parse AI output. Raw: " + text
        };
      }

      // Log the final decision memory
      const loggedMemory = await MemoryService.logMemory(
        `AGGREGATE_DECISION (${aggregateDecision.action})`,
        `Confidence: ${aggregateDecision.confidence} | Rationale: ${aggregateDecision.rationale}`,
        userId,
        portfolioId
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "Coordinator",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: true,
        user_id: userId,
        portfolio_id: portfolioId
      });

      return {
        quantResult: quantResult.rawOutput,
        riskResult: riskResult.rawOutput,
        newsResult: newsResult.rawOutput,
        aggregateDecision: aggregateDecision,
        coordinatorMemory: loggedMemory
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "Coordinator",
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
