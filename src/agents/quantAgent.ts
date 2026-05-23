import { MarketSnapshotRepository } from "../db/repositories/marketSnapshots";
import { PositionRepository } from "../db/repositories/positions";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { TradeOutcomesRepository } from "../db/repositories/tradeOutcomes";
import { MarketTickRepository } from "../db/repositories/marketTicks";
import { MemoryService } from "../services/memoryService";
import { aiService } from "../services/aiService";
import { EventDispatcher, EventType } from "../events";
import { getPool } from "../db/connection";
import { StrategyPerformanceService } from "../services/strategyPerformanceService";

export class QuantAgent {
  static async analyzeMarket(
    portfolioId: string,
    userId: string,
    correlationId?: string,
  ) {
    const startTimestamp = new Date();
    try {
      // 1. Get latest market snapshots filtered by portfolio positions
      const positions = await PositionRepository.findByPortfolioId(portfolioId);
      const assetIds = Array.from(new Set(positions.map((p) => p.asset_id)));

      let marketState =
        "No market snapshots available (no active positions measured).";
      if (assetIds.length > 0) {
        const latestSnapshots =
          await MarketSnapshotRepository.getLatest(assetIds);
        if (latestSnapshots.length > 0) {
          marketState = latestSnapshots
            .map(
              (s) =>
                `${s.asset_id} [${s.source}]: $${s.price} (bid/ask: ${s.bid || "-"} / ${s.ask || "-"}, vol: ${s.volume || "-"})`,
            )
            .join("\n");
        }
      }

      // Fetch the last 50 price ticks from MarketTickRepository (use existing getRecentPrices(50) method).
      const rawPrices = await MarketTickRepository.getRecentPrices(50);
      const prices = rawPrices.slice().reverse(); // reverse so that prices[prices.length-1] is the current price

      const currentPrice = prices.length > 0 ? prices[prices.length - 1] : 0;

      // a) RSI(14)
      let rsiPart = "Insufficient data for RSI(14)";
      if (prices.length >= 15) {
        let gains = 0;
        let losses = 0;
        const rsiPeriod = 14;
        const startingIdx = prices.length - 1 - rsiPeriod;
        for (let i = startingIdx; i < prices.length - 1; i++) {
          const change = prices[i + 1] - prices[i];
          if (change > 0) {
            gains += change;
          } else {
            losses += Math.abs(change);
          }
        }
        const avgGain = gains / rsiPeriod;
        const avgLoss = losses / rsiPeriod;
        let rsi = 50;
        if (avgLoss === 0) {
          rsi = avgGain > 0 ? 100 : 50;
        } else {
          const rs = avgGain / avgLoss;
          rsi = 100 - (100 / (1 + rs));
        }
        const state = rsi > 70 ? "OVERBOUGHT" : rsi < 30 ? "OVERSOLD" : "NEUTRAL";
        rsiPart = `${rsi.toFixed(2)} → ${state}`;
      }

      // b) SMA Trend: "BULLISH" if price > SMA20 > SMA50, "BEARISH" if price < SMA20 < SMA50, else "NEUTRAL"
      let smaTrendPart = "Insufficient data for SMA Trend";
      if (prices.length >= 20) {
        const sma20 = prices.slice(-20).reduce((sum, p) => sum + p, 0) / 20;
        const sma50 = prices.length >= 50 ? prices.reduce((sum, p) => sum + p, 0) / 50 : null;
        let trendSignal = "NEUTRAL";
        if (sma50 !== null) {
          if (currentPrice > sma20 && sma20 > sma50) {
            trendSignal = "BULLISH";
          } else if (currentPrice < sma20 && sma20 < sma50) {
            trendSignal = "BEARISH";
          }
        }
        const sma50Str = sma50 !== null ? sma50.toFixed(2) : "N/A";
        smaTrendPart = `${trendSignal} (Price: ${currentPrice.toFixed(2)}, SMA20: ${sma20.toFixed(2)}, SMA50: ${sma50Str})`;
      }

      // c) Bollinger Bands (20-period, 2 std dev)
      let bollingerPart = "Insufficient data for Bollinger Position";
      if (prices.length >= 20) {
        const last20 = prices.slice(-20);
        const sma20 = last20.reduce((sum, p) => sum + p, 0) / 20;
        const sumSqDiff = last20.reduce((sum, p) => sum + Math.pow(p - sma20, 2), 0);
        const stdDev = Math.sqrt(sumSqDiff / 20);
        const upperBand = sma20 + (2 * stdDev);
        const lowerBand = sma20 - (2 * stdDev);
        let bandPosition = 0.5;
        if (upperBand !== lowerBand) {
          bandPosition = (currentPrice - lowerBand) / (upperBand - lowerBand);
        }
        bollingerPart = `${bandPosition.toFixed(2)} (0=lower, 1=upper band)`;
      }

      // d) ATR proxy (Average True Range, simplified)
      let atrPart = "Insufficient data for ATR(14) Volatility";
      if (prices.length >= 15) {
        const changes = [];
        for (let i = prices.length - 14; i < prices.length; i++) {
          changes.push(Math.abs(prices[i] - prices[i - 1]));
        }
        const atr14 = changes.reduce((sum, c) => sum + c, 0) / 14;
        let atrPct = 0;
        if (currentPrice > 0) {
          atrPct = (atr14 / currentPrice) * 100;
        }
        atrPart = `${atrPct.toFixed(2)}% of price`;
      }

      // 3. Build an indicatorsContext string
      const indicatorsContext = `Technical Indicators:

RSI(14): ${rsiPart}
SMA Trend: ${smaTrendPart}
Bollinger Position: ${bollingerPart}
ATR(14) Volatility: ${atrPart}`;

      // 2. Get recent semantic memories for the portfolio
      const relevantMemories = await MemoryService.searchMemory(
        "market changes or recent trades",
        userId,
        portfolioId,
      );
      let memoryContext = relevantMemories
        .map(
          (m) =>
            `[${m.timestamp.toISOString()}] Regime: ${m.market_regime}, Rationale: ${m.ai_rationale}`,
        )
        .join("\n");

      if (!memoryContext) {
        memoryContext = "No prior memory for this portfolio.";
      }

      // 2b. Add Decision Feedback Loop via past evaluations
      const pastEvaluations = await MemoryService.getPastEvaluations(
        portfolioId,
        undefined,
        undefined,
        50,
      );
      let recentFailuresContext = "None recorded.";
      let recentSuccessContext = "None recorded.";

      const failures = [];
      const successes = [];
      const now = Date.now();

      for (const m of pastEvaluations) {
        let pnl = 0,
          asset = "N/A",
          outcome = "N/A",
          score = 0,
          regime = m.market_regime || "UNKNOWN";
        const md = m.metadata || {};
        try {
          const rationaleData = JSON.parse(m.ai_rationale || "{}");
          pnl = rationaleData.pnl ?? 0;
          outcome = rationaleData.outcome || "N/A";
          asset = md.asset_id || "N/A";
          score =
            md.score !== undefined ? md.score : pnl > 0 ? 1 : pnl < 0 ? -1 : 0;
        } catch (e) {}

        const accuracyScore =
          md.accuracy_score !== undefined ? md.accuracy_score : 0.5;
        const strategyTag = md.strategy_tag || "default";

        // Weighting: Recency (closer to 1.0 is more recent), Profitability (magnitude of PnL)
        const daysOld = Math.max(
          1,
          (now - m.timestamp.getTime()) / (1000 * 60 * 60 * 24),
        );
        const recencyWeight = 1 / daysOld;
        const profitabilityWeight = Math.min(10, Math.abs(pnl) / 100); // Normalize somewhat
        const finalWeight =
          recencyWeight * accuracyScore * (1 + profitabilityWeight);

        const evalRecord = {
          line: `- Asset: ${asset} | Regime: ${regime} | Strategy: ${strategyTag} | Accuracy: ${accuracyScore.toFixed(2)} | PnL: ${pnl} | Score: ${score} | Weight: ${finalWeight.toFixed(2)}`,
          weight: finalWeight,
        };

        if (score < 0) failures.push(evalRecord);
        if (score > 0) successes.push(evalRecord);
      }

      // Sort by combined weight
      failures.sort((a, b) => b.weight - a.weight);
      successes.sort((a, b) => b.weight - a.weight);

      if (failures.length > 0)
        recentFailuresContext = failures
          .slice(0, 5)
          .map((f) => f.line)
          .join("\n");
      if (successes.length > 0)
        recentSuccessContext = successes
          .slice(0, 5)
          .map((s) => s.line)
          .join("\n");

      // 2c. Deep Learning Loop (Win Rate, Best Assets, Loss Patterns)
      let vectorContext = "No similar past outcomes.";
      let recentOutcomesContext = "No recent trades for this portfolio.";
      let evolutionContext = "No meta-learning evolution insights yet.";
      try {
        const { StrategyEvolutionService } =
          await import("../services/strategyEvolutionService");
        const evolutionInsights =
          await StrategyEvolutionService.getRecentInsights(portfolioId, 3);
        if (evolutionInsights.length > 0) {
          evolutionContext = evolutionInsights
            .map(
              (e: any) =>
                `- EVOLUTION SIGNAL: ${e.adjustmentSignal} | Failure Pattern: ${e.failureType} | Confidence Adjustment: ${e.confidenceDelta}`,
            )
            .join("\n");
        }

        const recentOutcomes = await TradeOutcomesRepository.getRecentOutcomes(
          portfolioId,
          5,
        );
        if (recentOutcomes.length > 0) {
          recentOutcomesContext = recentOutcomes
            .map(
              (r) =>
                `- Expected +${Number(r.predicted_alpha).toFixed(2)}% | Actual: ${Number(r.actual_alpha).toFixed(2)}% | Expectancy Score: ${Number(r.expectancy_contribution).toFixed(4)} | Context: ${JSON.stringify(r.decision_context)}`,
            )
            .join("\n");
        }

        // fetch last 5 similar outcomes using semantic match on marketState
        const { getEmbeddingProvider } = await import("../services/embeddings");
        const stateEmbedding = await getEmbeddingProvider()
          .embedText(marketState)
          .catch(() => new Array(1536).fill(0));

        const similarOutcomesInfo =
          await TradeOutcomesRepository.getSimilarOutcomes(stateEmbedding, 5);

        if (similarOutcomesInfo.length > 0) {
          vectorContext = similarOutcomesInfo
            .map(
              (r) =>
                `- Expected +${Number(r.predicted_alpha).toFixed(2)}% | Actual: ${Number(r.actual_alpha).toFixed(2)}% | Context: ${JSON.stringify(r.decision_context)}`,
            )
            .join("\n");
        }
      } catch (e) {
        console.error("Failed to query similar outcomes", e);
      }

      // Incorporate Strategy Performance Edge
      const topStrategies =
        await StrategyPerformanceService.getTopPerformingStrategies(
          portfolioId,
        );
      const worstStrategies =
        await StrategyPerformanceService.getWorstPerformingStrategies(
          portfolioId,
        );

      let edgeContext = "No explicit strategy edges calculated yet.";
      if (topStrategies.length > 0 || worstStrategies.length > 0) {
        edgeContext =
          `**Top Performing Strategies:**\n` +
          topStrategies
            .map(
              (s) =>
                `- ${s.strategy_tag} during ${s.market_regime} for ${s.asset_id} (Win Rate: ${(s.win_rate * 100).toFixed(1)}%, Avg PnL: ${s.avg_pnl.toFixed(2)})`,
            )
            .join("\n") +
          `\n\n` +
          `**Worst Performing Strategies (AVOID):**\n` +
          worstStrategies
            .map(
              (s) =>
                `- ${s.strategy_tag} during ${s.market_regime} for ${s.asset_id} (Win Rate: ${(s.win_rate * 100).toFixed(1)}%, Avg PnL: ${s.avg_pnl.toFixed(2)})`,
            )
            .join("\n");
      }

      // Explore vs Exploit logic
      const isExploration = Math.random() < 0.2;
      const explorationPrompt = isExploration
        ? "CRITICAL INSTRUCTION [EXPLORATION MODE]: Instead of exploiting the known best strategies, you MUST explore a NEW or uncommon strategy variant to discover new alpha. Generate a novel strategyTag."
        : "CRITICAL INSTRUCTION [EXPLOITATION MODE]: Rely heavily on the 'Top Performing Strategies' and historically successful patterns. Maximize expected PNL based on known edge.";

      // 3b. Construct prompt and analyze with Gemini
      const prompt = `You are a QuantAgent, an expert in market regime detection and trading strategy matching.
Analyze the current market state, technical indicators, and historical performance context to classify the market regime and select the best strategy profile to maximize PnL.

Technical Signal Analysis (Pre-Computed):
${indicatorsContext}

Current Market State:
${marketState}

Recent Semantic Memories:
${memoryContext}

Recent Successes:
${recentSuccessContext}

Recent Failures:
${recentFailuresContext}

Recent Trade Outcomes (Expectancy contribution):
${recentOutcomesContext}

Similar Outperformance Context (Vector Database):
${vectorContext}

Strategy Edge Performance:
${edgeContext}

${explorationPrompt}

Provide a JSON output evaluating the market regime and strategy.
Format exactly as JSON:
{
  "marketRegime": "BULL_TREND" | "BEAR_TREND" | "CHOPPY" | "BREAKOUT" | "MEAN_REVERSION",
  "volatilityLevel": "LOW" | "NORMAL" | "HIGH",
  "strategyTag": "trend_following" | "mean_reversion" | "breakout" | "scalping" | "default",
  "confidenceScore": <float between 0 and 1>,
  "aiRationale": "Your detailed quantitative reasoning..."
}`;

      let responseText = "{}";
      let fallbackUsed = false;
      let apiErrorMessage = "";
      let analysisResult = {
        marketRegime: "CHOPPY",
        volatilityLevel: "NORMAL",
        strategyTag: "default",
        confidenceScore: 0.8,
        aiRationale: "Rule-based quant assessment: Relying on recent outcome data to select regime and strategy.",
      };

      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("GEMINI_API_KEY is not configured.");
        }
        const textResponse = await aiService.generateContent(
          prompt,
          "gemini-2.0-flash"
        );
        responseText =
          textResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim() || "{}";

        const parsed = JSON.parse(responseText);
        if (parsed.marketRegime && parsed.strategyTag) {
          analysisResult = {
            marketRegime: parsed.marketRegime,
            volatilityLevel: parsed.volatilityLevel || "NORMAL",
            strategyTag: parsed.strategyTag,
            confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 0.8,
            aiRationale: parsed.aiRationale || "Gemini-generated regime evaluation.",
          };
        } else {
          throw new Error("Invalid schema from Gemini model");
        }
      } catch (apiError: any) {
        fallbackUsed = true;
        apiErrorMessage = apiError.message || "Unknown API error";
        console.warn("[QuantAgent] Gemini API failed, using rule-based fallback", apiErrorMessage);

        let regime = "CHOPPY";
        let strategy = "default";
        if (edgeContext.includes("BULL_TREND")) regime = "BULL_TREND";
        if (edgeContext.includes("trend_following")) strategy = "trend_following";

        analysisResult = {
          marketRegime: regime,
          volatilityLevel: "NORMAL",
          strategyTag: strategy,
          confidenceScore: 0.8,
          aiRationale: `Rule-based fallback (Gemini error: ${apiErrorMessage}).`,
        };
      }

      // 4. Persist result logic
      const loggedMemory = await MemoryService.logMemory(
        analysisResult.marketRegime,
        analysisResult.aiRationale,
        userId,
        portfolioId,
        correlationId,
        "QuantAgent",
        {
          strategy_tag: analysisResult.strategyTag,
          confidence_score: analysisResult.confidenceScore,
          volatility_level: analysisResult.volatilityLevel,
        },
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
        portfolio_id: portfolioId,
      });

      await EventDispatcher.emit(EventType.QUANT_ANALYSIS_COMPLETED, {
        portfolioId,
        marketRegime: analysisResult.marketRegime,
        correlationId,
        rawOutput: analysisResult,
      });

      return {
        newAnalysis: loggedMemory,
        rawOutput: analysisResult,
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
        portfolio_id: portfolioId,
      });
      throw error;
    }
  }
}
