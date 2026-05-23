import { DecisionOverridesRepository, DecisionOverride } from "../db/repositories/decisionOverrides";
import { ExecutionService } from "./executionService";
import { PortfolioRepository } from "../db/repositories/portfolios";

export class OverrideService {
  static async getPending(portfolioId: string): Promise<DecisionOverride[]> {
    return await DecisionOverridesRepository.getPendingByPortfolio(portfolioId);
  }

  static async execute(
    overrideId: string,
    action: "BUY" | "SELL" | "DISCARD",
    size: number
  ): Promise<{ success: boolean; orderId?: string; price?: number; message?: string }> {
    const override = await DecisionOverridesRepository.findById(overrideId);
    if (!override) {
      throw new Error(`Override not found: ${overrideId}`);
    }

    if (override.status !== "PENDING") {
      throw new Error(`Override ${overrideId} is already ${override.status}`);
    }

    if (action === "DISCARD") {
      await DecisionOverridesRepository.discardOverride(overrideId);
      return { success: true, message: "Override discarded successfully." };
    }

    // Retrieve portfolio to ensure user exists
    const portfolio = await PortfolioRepository.findById(override.portfolio_id);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${override.portfolio_id}`);
    }

    // Update the override to EXECUTED in the DB
    await DecisionOverridesRepository.updateExecuted(overrideId, action, size);

    // Call ExecutionService to execute the overridden order request
    const orderRequest = {
      portfolioId: override.portfolio_id,
      userId: portfolio.user_id,
      assetId: override.asset_id,
      action: action as "BUY" | "SELL",
      size: size,
      correlationId: override.correlation_id,
      overrideId: override.id, // Pass overrideId to link the trade/order
    };

    console.log(`[OverrideService] Placing overridden order request:`, orderRequest);
    const { orderId, price } = await ExecutionService.placeOrder(orderRequest);

    return {
      success: true,
      orderId,
      price,
      message: `Successfully executed user override ${action} for ${size} units.`
    };
  }
}
