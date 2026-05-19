import { MarketSnapshotRepository } from "../db/repositories/marketSnapshots";
import { PositionRepository } from "../db/repositories/positions";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { GoogleGenAI } from "@google/genai";
import { EventDispatcher, EventType } from "../events";

export class QuantAgent {
  static async analyzeMarket(portfolioId: string, userId: string, correlationId?: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for QuantAgent.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // 1. Get latest market snapshots filtered by portfolio positions
      const positions = await PositionRepository.findByPortfolioId(portfolioId);
      const assetIds = Array.from(new Set(positions.map(p => p.asset_id)));
      
      let marketState = "No market snapshots available (no active positions measured).";
      if (assetIds.length > 0) {
        const latestSnapshots = await MarketSnapshotRepository.getLatest(assetIds);
        if (latestSnapshots.length > 0) {
          marketState = latestSnapshots.map(s => `${s.asset_id} [${s.source}]: $${s.price} (bid/ask: ${s.bid || '-'} / ${s.ask || '-'}, vol: ${s.volume || '-'})`).join('\n');
        }
      }

      // 2. Get recent semantic memories for the portfolio
      const relevantMemories = await MemoryService.searchMemory("market changes or recent trades", userId, portfolioId);
      let memoryContext = relevantMemories.map(m => `[${m.timestamp.toISOString()}] Regime: ${m.market_regime}, Rationale: ${m.ai_rationale}`).join('\n');

      if (!memoryContext) {
        memoryContext = "No prior memory for this portfolio.";
      }

      // 3. Prompt Gemini
      const prompt = `You are an expert quantitative trading agent.
Analyze the current market state and previous memories to provide a market regime assessment and a trading rationale.

Current Market Data:
${marketState}

Recent Semantic Memories:
${memoryContext}

Output your response as JSON in the exact format:
{
  "marketRegime": "BULL_TREND" | "BEAR_TREND" | "CHOPPY" | "VOLATILE",
  "aiRationale": "Your detailed reasoning..."
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
        console.warn("QuantAgent Gemini API failed, fallback", apiError.message);
        fallbackUsed = true;
        apiErrorMessage = apiError.message;
        responseText = JSON.stringify({
          marketRegime: "CHOPPY",
          aiRationale: "API Error, fallback to CHOPPY. " + apiError.message
        });
      }

      const text = responseText;
      let analysisResult;
      try {
        analysisResult = JSON.parse(text);
      } catch (e) {
        console.warn("QuantAgent Gemini parsing failed, fallback");
        fallbackUsed = true;
        apiErrorMessage = apiErrorMessage || "Failed to parse AI output.";
        analysisResult = {
          marketRegime: "CHOPPY",
          aiRationale: "Failed to parse AI output. Raw: " + text
        };
      }

      // 4. Persist result logic
      const loggedMemory = await MemoryService.logMemory(
        analysisResult.marketRegime,
        analysisResult.aiRationale,
        userId,
        portfolioId
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "QuantAgent",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: !fallbackUsed,
        fallback_used: fallbackUsed,
        error_message: fallbackUsed ? apiErrorMessage : null,
        user_id: userId,
        portfolio_id: portfolioId
      });

      await EventDispatcher.emit(EventType.QUANT_ANALYSIS_COMPLETED, { 
        portfolioId, 
        marketRegime: analysisResult.marketRegime,
        correlationId,
        rawOutput: analysisResult
      });

      return {
        newAnalysis: loggedMemory,
        rawOutput: analysisResult
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "QuantAgent",
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
