import { EventListener, EventType, EventDispatcher } from "../events";
import { ExecutionService } from "../services/executionService";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { PortfolioRepository } from "../db/repositories/portfolios";
import { AgentDecisionsRepository } from "../db/repositories/agentDecisions";
import { MemoryService } from "../services/memoryService";
import { getPool } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

export class ExecutionAgent {
  static initialize() {
    EventListener.subscribe(
      EventType.COORDINATOR_DECISION_COMPLETED,
      async (payload) => {
        console.log(
          `[ExecutionAgent] Received COORDINATOR_DECISION_COMPLETED:`,
          payload,
        );
        try {
          await this.executeDecision(payload);
        } catch (err) {
          console.error(`[ExecutionAgent] error:`, err);
          throw err;
        }
      },
    );
  }

  static async executeDecision(payload: any) {
    if (!payload) {
      console.error("[ExecutionAgent] Payload is undefined");
      return;
    }

    const startTimestamp = new Date();
    const { portfolioId, correlationId, decision } = payload;

    let userId = payload.userId;

    if (!portfolioId) {
      console.error("[ExecutionAgent] Missing portfolioId");
      return;
    }

    if (!userId) {
      try {
        const portfolio = await PortfolioRepository.findById(portfolioId);
        if (portfolio) {
          userId = portfolio.user_id;
        } else {
          console.error(
            "[ExecutionAgent] Portfolio not found, missing userId: " +
              portfolioId,
          );
          return;
        }
      } catch (err) {
        console.error("[ExecutionAgent] Error fetching portfolio: ", err);
        return;
      }
    }

    let currentDecision = decision || payload.decision;
    if (!currentDecision || !currentDecision.action) {
      console.warn(
        "[ExecutionAgent] Invalid decision or action missing, defaulting to HOLD",
      );
      currentDecision = {
        action: "HOLD",
        rationale: "Fallback: Missing decision",
        confidenceScore: 0,
      };
    }

    try {
      if (currentDecision.action === "BUY" || currentDecision.action === "SELL") {
        // Kill-switch: check risk level before execution
        const riskMemory = await MemoryService.getByCorrelation(
          correlationId,
          "RiskGuardian",
        );
        const isCriticalRiskState = riskMemory?.metadata?.risk_state === "CRITICAL";
        if ((riskMemory && riskMemory.market_regime && riskMemory.market_regime.includes("HIGH")) || isCriticalRiskState) {
          console.warn(
            `[ExecutionAgent] Blocking execution due to HIGH risk/CRITICAL risk state for correlation ${correlationId}`,
          );

          await MemoryService.logMemory(
            `SKIPPED_EXECUTION`,
            `Execution blocked by RiskGuardian (Risk=HIGH/CRITICAL). Rationale: ${riskMemory ? riskMemory.ai_rationale : "No risk assessment available"}`,
            userId,
            portfolioId,
            correlationId,
            "ExecutionAgent",
          );

          const durationMs = Date.now() - startTimestamp.getTime();
          await ExecutionLogRepository.insertLog({
            agent_name: "ExecutionAgent",
            start_timestamp: startTimestamp,
            duration_ms: durationMs,
            success: true,
            error_message: "Blocked by RiskGuardian",
            user_id: userId,
            portfolio_id: portfolioId,
          });

          await EventDispatcher.emit(EventType.ORDER_EXECUTED, {
            orderId: "blocked-" + (correlationId ? correlationId.substring(0, 6) : "default"),
            portfolioId,
            userId,
            correlationId,
            action: "BLOCKED",
          });
          return; // Abort execution
        }

        // Compute adaptive position size using advanced mathematical engine scaling
        // FinalSize = BaseSize * StrategyWeight * RiskMultiplier * GlobalPortfolioWeight
        const baseSize = 1.0;
        const strategyWeight = currentDecision.strategyWeight !== undefined ? Number(currentDecision.strategyWeight) : 1.0;
        const riskMultiplier = currentDecision.riskMultiplier !== undefined ? Number(currentDecision.riskMultiplier) : 1.0;
        const globalPortfolioWeight = currentDecision.globalPortfolioWeight !== undefined ? Number(currentDecision.globalPortfolioWeight) : 1.0;

        let adaptiveSize = baseSize * strategyWeight * riskMultiplier * globalPortfolioWeight;
        // Bound the size to safe, logical limits [0.05, 3.0] to prevent zero or excessively leveraged sizing
        adaptiveSize = Number(Math.max(0.05, Math.min(3.0, adaptiveSize)).toFixed(4));

        console.log(
          `[ExecutionAgent] Mathematically scaled position size: ${adaptiveSize} (Base: ${baseSize}, StrategyWeight: ${strategyWeight}, RiskMultiplier: ${riskMultiplier}, GlobalWeight: ${globalPortfolioWeight})`
        );

        const orderRequest = {
          portfolioId,
          userId,
          assetId: currentDecision.assetId || "BTC", // Default to BTC if unspecified
          action: currentDecision.action,
          size: adaptiveSize,
          correlationId: correlationId || uuidv4(),
          strategyId: payload.strategyId,
          isBacktest: payload.isBacktest,
        };

        const { orderId, price } =
          await ExecutionService.placeOrder(orderRequest);

        // Log to agent_decisions
        await AgentDecisionsRepository.insertDecision(
          "QuantAgent",
          portfolioId,
          currentDecision.assetId || "BTC",
          currentDecision.action,
          price,
          currentDecision.rationale,
        );

        // Track execution in memory
        await MemoryService.logMemory(
          `EXECUTED_ORDER`,
          `Executed ${currentDecision.action} order. Order ID: ${orderId}. ConfidenceScore: ${currentDecision.confidenceScore || currentDecision.confidence || 0}. Rationale: ${currentDecision.rationale}`,
          userId,
          portfolioId,
          correlationId,
          "ExecutionAgent",
        );

        const durationMs = Date.now() - startTimestamp.getTime();
        await ExecutionLogRepository.insertLog({
          agent_name: "ExecutionAgent",
          start_timestamp: startTimestamp,
          duration_ms: durationMs,
          success: true,
          error_message: null,
          user_id: userId,
          portfolio_id: portfolioId,
        });

        await EventDispatcher.emit(EventType.ORDER_EXECUTED, {
          orderId,
          portfolioId,
          userId,
          correlationId,
          action: currentDecision.action,
        });
      } else {
        // HOLD or unknown action, log it but don't place order
        await MemoryService.logMemory(
          `SKIPPED_EXECUTION`,
          `Decision was ${currentDecision.action}, no order placed. ConfidenceScore: ${currentDecision.confidenceScore || currentDecision.confidence || 0}. Rationale: ${currentDecision.rationale}`,
          userId,
          portfolioId,
          correlationId,
          "ExecutionAgent",
        );

        const durationMs = Date.now() - startTimestamp.getTime();
        await ExecutionLogRepository.insertLog({
          agent_name: "ExecutionAgent",
          start_timestamp: startTimestamp,
          duration_ms: durationMs,
          success: true,
          error_message: null,
          user_id: userId,
          portfolio_id: portfolioId,
        });

        await EventDispatcher.emit(EventType.ORDER_EXECUTED, {
          orderId: "skipped-" + (correlationId ? correlationId.substring(0, 6) : "default"),
          portfolioId,
          userId,
          correlationId,
          action: currentDecision.action,
        });
      }
    } catch (error: any) {
      const durationMs = Date.now() - startTimestamp.getTime();
      await ExecutionLogRepository.insertLog({
        agent_name: "ExecutionAgent",
        start_timestamp: startTimestamp,
        duration_ms: durationMs,
        success: false,
        error_message: error.message || "Unknown error",
        user_id: userId,
        portfolio_id: portfolioId,
      });

      // Emit order executed with FAILED status to close telemetry loop safely
      try {
        await EventDispatcher.emit(EventType.ORDER_EXECUTED, {
          orderId: "failed-" + (correlationId ? correlationId.substring(0, 6) : "default"),
          portfolioId,
          userId,
          correlationId,
          action: "FAILED",
        });
      } catch (evtErr) {
        console.error("[ExecutionAgent] Failed emitting ORDER_EXECUTED fallback event:", evtErr);
      }
      throw error;
    }
  }
}
