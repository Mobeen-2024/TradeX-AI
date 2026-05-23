import { DecisionOverridesRepository, DecisionOverride } from "../db/repositories/decisionOverrides";
import { ExecutionService } from "./executionService";
import { PortfolioRepository } from "../db/repositories/portfolios";
import { SystemService } from "./systemService";

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
      await SystemService.logAuditEvent('OVERRIDE_DISCARDED', { overrideId, asset: override.asset_id }, 'INFO', 'USER', undefined, override.portfolio_id);
      return { success: true, message: "Override discarded successfully." };
    }

    // Retrieve portfolio to ensure user exists
    const portfolio = await PortfolioRepository.findById(override.portfolio_id);
    if (!portfolio) {
      throw new Error(`Portfolio not found: ${override.portfolio_id}`);
    }

    // Update the override to EXECUTED in the DB
    await DecisionOverridesRepository.updateExecuted(overrideId, action, size);
    
    await SystemService.logAuditEvent('OVERRIDE_EXECUTED', { 
      overrideId, 
      originalAction: override.original_action,
      overrideAction: action,
      overrideSize: size,
      asset: override.asset_id
    }, 'WARNING', 'USER', portfolio.user_id, portfolio.id);

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
