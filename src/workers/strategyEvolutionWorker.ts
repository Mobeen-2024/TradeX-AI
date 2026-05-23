import { aiService } from "../services/aiService";
import { StrategyService } from "../services/strategyService";

export class StrategyEvolutionWorker {
  static isRunning = false;

  static initialize() {
    console.log("[StrategyEvolutionWorker] Initializing...");

    // We could listen to trades completing or interval
    setInterval(
      () => {
        this.runPeriodicEvolution().catch((err) => {
          console.error(
            "[StrategyEvolutionWorker] Periodic evolution failed:",
            err,
          );
        });
      },
      1000 * 60 * 60,
    ); // Every 1 hour
  }

  static async runPeriodicEvolution() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const portfolioIds = await StrategyService.getActivePortfolioIds();

      for (const portfolioId of portfolioIds) {
        await this.evolveStrategy(portfolioId);
      }
    } finally {
      this.isRunning = false;
    }
  }

  static async evolveStrategy(portfolioId: string) {
    console.log(
      `[StrategyEvolutionWorker] Evolving strategy for portfolio: ${portfolioId}`,
    );
    try {
      // Phase 7 limit safety
      await StrategyService.enforceStrategyLimit(portfolioId, 10);

      const topStrategies = await StrategyService.getTopStrategies(
        portfolioId,
        1,
      );
      const worstStrategies = await StrategyService.getWorstStrategies(
        portfolioId,
        1,
      );

      if (topStrategies.length === 0) {
        await StrategyService.createDefaultStrategy(portfolioId);
        return;
      }

      const best = topStrategies[0];
      const worst = worstStrategies[0];

      // Mutate the best performing strategy slightly to explore improvements
      const prompt = `You are a Quantitative Strategy Evolution Engine.
Generate a new, slightly mutated strategy profile based on the current best.

Top Performing Strategy Name: ${best.name}
Top Parameters: ${JSON.stringify(best.parameters)}

${worst ? `Avoid similarities to Worst Strategy: ${JSON.stringify(worst.parameters)}` : ""}

Generate a new variation that explores a slightly different edge. Keep mutations safe and small.
Return ONLY valid JSON in the exact format:
{
  "name": "Variation generated name",
  "parameters": {
    "confidence_threshold": 0.7,
    "max_risk": 0.03,
    "preferred_regime": "TRENDING",
    "momentum_factor": 1.2,
    "mean_reversion_factor": 0.8
  }
}`;

      let mutatedStrategy: any = null;
      try {
        const textResponse = await aiService.generateContent(
          prompt,
          "gemini-3.5-flash",
        );
        const responseText = textResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        mutatedStrategy = JSON.parse(responseText);
      } catch (e) {
        console.error("Mutation failed using LLM", e);
        mutatedStrategy = {
          name: best.name + " (Auto-Mutated)",
          parameters: {
            ...best.parameters,
            confidence_threshold: Math.min(
              0.9,
              Math.max(
                0.4,
                (best.parameters.confidence_threshold || 0.6) +
                  (Math.random() * 0.1 - 0.05),
              ),
            ),
          },
        };
      }

      await StrategyService.mutateStrategy(portfolioId, mutatedStrategy);
      console.log(
        `[StrategyEvolutionWorker] Mutated strategy ${mutatedStrategy.name} added to profile list.`,
      );
    } catch (err) {
      console.error(
        `[StrategyEvolutionWorker] Error evolving strategy for params ${portfolioId}`,
        err,
      );
    }
  }
}
