import { QuantAgent } from "./quantAgent";
import { RiskGuardian } from "./riskGuardian";
import { NewsOracle } from "./newsOracle";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { GoogleGenAI } from "@google/genai";
import { EventListener, EventType, EventDispatcher } from "../events";

export class Coordinator {
  static initialize() {
    EventListener.subscribe(EventType.MARKET_TICK_RECEIVED, (payload) => {
      console.log(`[Coordinator] Received MARKET_TICK_RECEIVED:`, payload);
    });
    EventListener.subscribe(EventType.QUANT_ANALYSIS_COMPLETED, (payload) => {
      console.log(`[Coordinator] Received QUANT_ANALYSIS_COMPLETED:`, payload);
    });
    EventListener.subscribe(EventType.RISK_VALIDATED, (payload) => {
      console.log(`[Coordinator] Received RISK_VALIDATED:`, payload);
    });
    EventListener.subscribe(EventType.NEWS_PROCESSED, (payload) => {
      console.log(`[Coordinator] Received NEWS_PROCESSED:`, payload);
    });
    EventListener.subscribe(EventType.COORDINATOR_DECISION_REQUESTED, async (payload) => {
      console.log(`[Coordinator] Received COORDINATOR_DECISION_REQUESTED:`, payload);
      try {
        await this.makeDecision(payload.portfolioId, payload.userId, payload.correlationId);
      } catch (err) {
        console.error(`[Coordinator] error:`, err);
        throw err;
      }
    });
  }

  static async makeDecision(portfolioId: string, userId: string, correlationId: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for Coordinator.");
      }

      // 1. Fetch results using correlationId
      const quantMemory = await MemoryService.getByCorrelation(correlationId, "QuantAgent");
      const riskMemory = await MemoryService.getByCorrelation(correlationId, "RiskGuardian");
      const newsMemory = await MemoryService.getByCorrelation(correlationId, "NewsOracle");

      if (!quantMemory || !riskMemory || !newsMemory) {
        throw new Error("Missing prerequisite agent memories for correlationId: " + correlationId);
      }

      // 2. Aggregate Decision
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are the Chief Investment Officer (Coordinator).
Synthesize the analysis from your three specialized agents and produce a final aggregated trading decision.

1. Quant Analysis:
${JSON.stringify({ marketRegime: quantMemory.market_regime, rationale: quantMemory.ai_rationale }, null, 2)}

2. Risk Analysis:
${JSON.stringify({ riskLevel: riskMemory.market_regime, rationale: riskMemory.ai_rationale }, null, 2)}

3. News Sentiment:
${JSON.stringify({ sentiment: newsMemory.market_regime, rationale: newsMemory.ai_rationale }, null, 2)}

Provide a JSON output with the final aggregate decision.
Format exactly as JSON:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "rationale": "Your detailed synthesis and final decision reasoning..."
}`;

      let responseText = "{}";
      let fallbackUsed = false;
      let apiErrorMessage = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        responseText = response.text || "{}";
      } catch (apiError: any) {
        console.warn("Coordinator Gemini API failed, fallback", apiError.message);
        fallbackUsed = true;
        apiErrorMessage = apiError.message;
        responseText = JSON.stringify({
          action: "HOLD",
          confidence: "MEDIUM",
          rationale: "API Error, fallback to HOLD. " + apiError.message
        });
      }

      const text = responseText;
      let aggregateDecision;
      try {
        aggregateDecision = JSON.parse(text);
      } catch (e) {
        console.warn("Coordinator Gemini parsing failed, fallback");
        fallbackUsed = true;
        apiErrorMessage = apiErrorMessage || "Failed to parse AI output.";
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
        portfolioId,
        correlationId,
        "Coordinator" // Uses "Coordinator" preserving idempotency
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "Coordinator",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: !fallbackUsed,
        fallback_used: fallbackUsed,
        error_message: fallbackUsed ? apiErrorMessage : null,
        user_id: userId,
        portfolio_id: portfolioId
      });

      await EventDispatcher.emit(EventType.COORDINATOR_DECISION_COMPLETED, {
        portfolioId,
        correlationId,
        decision: aggregateDecision
      });

      return {
        aggregateDecision,
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

  static async runCycle(portfolioId: string, userId: string, correlationId?: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for Coordinator.");
      }

      // 1. Run Quant
      const quantResult = await QuantAgent.analyzeMarket(portfolioId, userId, correlationId);

      // 2. Run Risk (RiskGuardian uses latest memory, which is now quantResult)
      const riskResult = await RiskGuardian.evaluateRisk(portfolioId, userId, correlationId);

      // 3. Run News
      const newsResult = await NewsOracle.analyzeSentiment(portfolioId, userId, correlationId);

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

      let responseText = "{}";
      let fallbackUsed = false;
      let apiErrorMessage = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        responseText = response.text || "{}";
      } catch (apiError: any) {
        console.warn("Coordinator Gemini API failed, fallback", apiError.message);
        fallbackUsed = true;
        apiErrorMessage = apiError.message;
        responseText = JSON.stringify({
          action: "HOLD",
          confidence: "MEDIUM",
          rationale: "API Error, fallback to HOLD. " + apiError.message
        });
      }

      const text = responseText;
      let aggregateDecision;
      try {
        aggregateDecision = JSON.parse(text);
      } catch (e) {
        console.warn("Coordinator Gemini parsing failed, fallback");
        fallbackUsed = true;
        apiErrorMessage = apiErrorMessage || "Failed to parse AI output.";
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
        portfolioId,
        correlationId,
        "Coordinator"
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "Coordinator",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: !fallbackUsed,
        fallback_used: fallbackUsed,
        error_message: fallbackUsed ? apiErrorMessage : null,
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
