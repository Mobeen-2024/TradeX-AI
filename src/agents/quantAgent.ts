import { MarketSnapshotRepository } from "../db/repositories/marketSnapshots";
import { MemoryService } from "../services/memoryService";
import { GoogleGenAI } from "@google/genai";

export class QuantAgent {
  static async analyzeMarket(portfolioId: string, userId: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured for QuantAgent.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Get latest market snapshots
    const latestSnapshots = await MarketSnapshotRepository.getLatest();
    const marketState = latestSnapshots.length > 0
      ? latestSnapshots.map(s => `${s.asset_id} [${s.source}]: $${s.price} (bid/ask: ${s.bid || '-'} / ${s.ask || '-'}, vol: ${s.volume || '-'})`).join('\n')
      : "No market snapshots available.";

    // 2. Get recent semantic memories for the portfolio
    // (using our newly added getRecent function, wait, MemoryService doesn't have it exposed yet)
    // Actually we can implement `MemoryService.getRecent(portfolioId, userId)`. 
    // For now I'll just use MemoryService.searchMemory("recent market regime", userId, portfolioId)
    // which will generate an embedding for "recent market regime" and get similar. 
    // Or let's use the DB repo directly if we want time-based recent. 
    // Let's use searchSimilarity with "current state"
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

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const text = response.text || "{}";
    let analysisResult;
    try {
      analysisResult = JSON.parse(text);
    } catch (e) {
      console.warn("QuantAgent Gemini parsing failed, fallback");
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

    return {
      newAnalysis: loggedMemory,
      rawOutput: analysisResult
    };
  }
}
