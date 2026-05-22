import { PositionRepository } from "../db/repositories/positions";
import { MemoryService } from "../services/memoryService";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { getNewsProvider } from "../services/news";
import { aiService } from "../services/aiService";
import { EventDispatcher, EventType } from "../events";

export class NewsOracle {
  static async analyzeSentiment(portfolioId: string, userId: string, correlationId?: string) {
    const startTimestamp = new Date();
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for NewsOracle.");
      }

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

      let responseText = "{}";
      let fallbackUsed = false;
      let apiErrorMessage = "";
      try {
        const textResponse = await aiService.generateContent(prompt, "gemini-3.1-pro-preview");
        responseText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim() || "{}";
      } catch (apiError: any) {
        console.warn("NewsOracle Gemini API failed, fallback", apiError.message);
        fallbackUsed = true;
        apiErrorMessage = apiError.message;
        responseText = JSON.stringify({
          sentiment: "MIXED",
          aiRationale: "API Error, fallback to MIXED sentiment. " + apiError.message
        });
      }

      const text = responseText;
      let sentimentEvaluation;
      try {
        sentimentEvaluation = JSON.parse(text);
      } catch (e) {
        console.warn("NewsOracle Gemini parsing failed, fallback");
        fallbackUsed = true;
        apiErrorMessage = apiErrorMessage || "Failed to parse AI output.";
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
        portfolioId,
        correlationId,
        "NewsOracle"
      );

      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "NewsOracle",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: !fallbackUsed,
        fallback_used: fallbackUsed,
        error_message: fallbackUsed ? apiErrorMessage : null,
        user_id: userId,
        portfolio_id: portfolioId
      });

      await EventDispatcher.emit(EventType.NEWS_PROCESSED, { portfolioId, sentiment: sentimentEvaluation.sentiment, correlationId });

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
