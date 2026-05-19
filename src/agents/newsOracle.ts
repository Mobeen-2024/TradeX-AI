import { PositionRepository } from "../db/repositories/positions";
import { MemoryService } from "../services/memoryService";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { getNewsProvider } from "../services/news";
import { GoogleGenAI } from "@google/genai";

export class NewsOracle {
  static async analyzeSentiment(portfolioId: string, userId: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for NewsOracle.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // 1. Get unique assets from portfolio
      const positions = await PositionRepository.findByPortfolioId(portfolioId);
      const assetIds = Array.from(new Set(positions.map(p => p.asset_id)));

      if (assetIds.length === 0) {
        const durationMs = Date.now() - startTimestamp.getTime();
        await ExecutionLogRepository.insertLog({
          agent_name: "NewsOracle",
          start_timestamp: startTimestamp,
          duration_ms: durationMs,
          success: true,
          user_id: userId,
          portfolio_id: portfolioId
        });
        return {
           newAnalysis: null,
           rawOutput: { sentiment: "NEUTRAL", aiRationale: "No active positions to analyze news for." }
        };
      }

      // 2. Fetch news
      const newsProvider = getNewsProvider();
      const headlines = await newsProvider.getTopHeadlines(assetIds);
      const newsContext = headlines.map(h => `[${h.source}] ${h.timestamp.toISOString()}: ${h.headline}`).join("\n");

      // 3. Prompt Gemini
      const prompt = `You are a News Oracle, an expert in market sentiment analysis.
Analyze the following recent headlines for the assets in the portfolio and determine the overall sentiment.

Portfolio Assets: ${assetIds.join(", ")}

Recent Headlines:
${newsContext}

Provide a JSON output evaluating the sentiment and your detailed rationale.
Format exactly as JSON:
{
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL" | "MIXED",
  "aiRationale": "Your detailed sentiment reasoning..."
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
      let sentimentEvaluation;
      try {
        sentimentEvaluation = JSON.parse(text);
      } catch (e) {
        console.warn("NewsOracle Gemini parsing failed, fallback");
        sentimentEvaluation = {
          sentiment: "MIXED",
          aiRationale: "Failed to parse AI output. Raw: " + text
        };
      }

      // 4. Persist result logic
      const rationaleStr = `Sentiment: ${sentimentEvaluation.sentiment} | Rationale: ${sentimentEvaluation.aiRationale}`;
      const loggedMemory = await MemoryService.logMemory(
        `NEWS_SENTIMENT (${sentimentEvaluation.sentiment})`,
        rationaleStr,
        userId,
        portfolioId
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "NewsOracle",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: true,
        user_id: userId,
        portfolio_id: portfolioId
      });

      return {
        newAnalysis: loggedMemory,
        rawOutput: sentimentEvaluation
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "NewsOracle",
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
