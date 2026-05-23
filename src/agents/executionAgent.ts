import { EventListener, EventType, EventDispatcher } from "../events";
import { ExecutionService } from "../services/executionService";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { PortfolioRepository } from "../db/repositories/portfolios";
import { AgentDecisionsRepository } from "../db/repositories/agentDecisions";
import { DecisionOverridesRepository } from "../db/repositories/decisionOverrides";
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

    let executionMode = "AUTO";
    try {
      const portfolio = await PortfolioRepository.findById(portfolioId);
      if (portfolio) {
        userId = userId || portfolio.user_id;
        executionMode = portfolio.execution_mode || "AUTO";
      } else {
        console.error("[ExecutionAgent] Portfolio not found: " + portfolioId);
        return;
      }
    } catch (err) {
      console.error("[ExecutionAgent] Error fetching portfolio: ", err);
      return;
    }

    if (!userId) {
      console.error("[ExecutionAgent] Missing userId after portfolio fetch");
      return;
    }

    const { PositionRepository } = require("../db/repositories/positions");
    const positions = await PositionRepository.findByPortfolioId(portfolioId);

    const currentDecision = decision || payload.decision;
    const decisionsList =
      payload.decisions ||
      currentDecision?.decisions ||
      (currentDecision ? [currentDecision] : []);

    if (!decisionsList || decisionsList.length === 0) {
      console.warn("[ExecutionAgent] No decisions available to execute");
      return;
    }

    for (const dec of decisionsList) {
      const assetId = dec.assetId || "XAUUSD";
      const action = dec.action || "HOLD";
      const confidenceScore =
        dec.confidenceScore !== undefined
          ? dec.confidenceScore
          : dec.confidence || 0;
      const rationale = dec.rationale || "No rationale";

      try {
        if (action === "BUY" || action === "SELL") {
          // Kill-switch: check risk level before execution
          const riskMemory = await MemoryService.getByCorrelation(
            correlationId,
            "RiskGuardian",
          );
          const isCriticalRiskState =
            riskMemory?.metadata?.risk_state === "CRITICAL";
          if (
            (riskMemory &&
              riskMemory.market_regime &&
              riskMemory.market_regime.includes("HIGH")) ||
            isCriticalRiskState
          ) {
            console.warn(
              `[ExecutionAgent] Blocking execution for ${assetId} due to HIGH risk/CRITICAL risk state for correlation ${correlationId}`,
            );

            await MemoryService.logMemory(
              `SKIPPED_EXECUTION`,
              `Execution blocked for ${assetId} by RiskGuardian (Risk=HIGH/CRITICAL). Rationale: ${riskMemory ? riskMemory.ai_rationale : "No risk assessment available"}`,
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
              error_message: `Blocked by RiskGuardian for ${assetId}`,
              user_id: userId,
              portfolio_id: portfolioId,
            });

            await EventDispatcher.emit(EventType.ORDER_EXECUTED, {
              orderId:
                "blocked-" +
                (correlationId ? correlationId.substring(0, 6) : "default"),
              portfolioId,
              userId,
              correlationId,
              action: "BLOCKED",
            });
            continue; // Abort execution for this asset
          }

          // Compute adaptive position size using advanced mathematical engine scaling
          // FinalSize = BaseSize * StrategyWeight * RiskMultiplier * GlobalPortfolioWeight
          const baseSize = 1.0;
          const strategyWeight =
            currentDecision?.strategyWeight !== undefined
              ? Number(currentDecision.strategyWeight)
              : 1.0;
          const riskMultiplier =
            currentDecision?.riskMultiplier !== undefined
              ? Number(currentDecision.riskMultiplier)
              : 1.0;
          const globalPortfolioWeight =
            currentDecision?.globalPortfolioWeight !== undefined
              ? Number(currentDecision.globalPortfolioWeight)
              : 1.0;

          let adaptiveSize =
            baseSize * strategyWeight * riskMultiplier * globalPortfolioWeight;
          // Bound the size to safe, logical limits [0.05, 3.0] to prevent zero or excessively leveraged sizing
          adaptiveSize = Number(
            Math.max(0.05, Math.min(3.0, adaptiveSize)).toFixed(4),
          );

          console.log(
            `[ExecutionAgent] Mathematically scaled position size for ${assetId}: ${adaptiveSize} (Base: ${baseSize}, StrategyWeight: ${strategyWeight}, RiskMultiplier: ${riskMultiplier}, GlobalWeight: ${globalPortfolioWeight})`,
          );

          if (executionMode === "SEMI_AUTO") {
            console.log(
              `[ExecutionAgent] Pipeline PAUSED (SEMI_AUTO mode) for ${assetId} under correlation ${correlationId}. Waiting for user override.`,
            );

            const overrideId = await DecisionOverridesRepository.insertOverride(
              portfolioId,
              correlationId || uuidv4(),
              assetId,
              action,
              adaptiveSize,
              rationale,
            );

            await MemoryService.logMemory(
              `SKIPPED_EXECUTION`,
              `Execution paused for manual review (SEMI_AUTO) on ${assetId}. Original Decision: ${action} ${adaptiveSize} units. Rationale: ${rationale}`,
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
              error_message: `Paused for User Override (SEMI_AUTO) on ${assetId}`,
              user_id: userId,
              portfolio_id: portfolioId,
            });

            await EventDispatcher.emit(EventType.EXECUTION_PAUSED, {
              overrideId,
              portfolioId,
              userId,
              correlationId,
              action: action,
              size: adaptiveSize,
              rationale: rationale,
            });
            continue; // Pause and do not place the order for this asset
          }

          const isSimulation = executionMode === "SIMULATION";
          const orderRequest = {
            portfolioId,
            userId,
            assetId: assetId,
            action: action,
            size: adaptiveSize,
            correlationId: correlationId || uuidv4(),
            strategyId: payload.strategyId,
            isBacktest: payload.isBacktest || isSimulation,
          };

          const { orderId, price } =
            await ExecutionService.placeOrder(orderRequest);

          // Log to agent_decisions
          await AgentDecisionsRepository.insertDecision(
            "QuantAgent",
            portfolioId,
            assetId,
            action,
            price,
            rationale,
          );

          // Track execution in memory
          await MemoryService.logMemory(
            `EXECUTED_ORDER`,
            `Executed ${action} order on ${assetId}. Order ID: ${orderId}. ConfidenceScore: ${confidenceScore}. Rationale: ${rationale}`,
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
            action: action,
          });
        } else {
          // HOLD or unknown action, log it but don't place order
          await MemoryService.logMemory(
            `SKIPPED_EXECUTION`,
            `Decision for ${assetId} was ${action}, no order placed. ConfidenceScore: ${confidenceScore}. Rationale: ${rationale}`,
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
            orderId:
              "skipped-" +
              (correlationId ? correlationId.substring(0, 6) : "default"),
            portfolioId,
            userId,
            correlationId,
            action: action,
          });
        }
      } catch (error: any) {
        const durationMs = Date.now() - startTimestamp.getTime();
        await ExecutionLogRepository.insertLog({
          agent_name: "ExecutionAgent",
          start_timestamp: startTimestamp,
          duration_ms: durationMs,
          success: false,
          error_message: `Failed executing order for ${assetId}: ${error.message || "Unknown error"}`,
          user_id: userId,
          portfolio_id: portfolioId,
        });

        // Emit order executed with FAILED status to close telemetry loop safely
        try {
          await EventDispatcher.emit(EventType.ORDER_EXECUTED, {
            orderId:
              "failed-" +
              (correlationId ? correlationId.substring(0, 6) : "default"),
            portfolioId,
            userId,
            correlationId,
            action: "FAILED",
          });
        } catch (evtErr) {
          console.error(
            "[ExecutionAgent] Failed emitting ORDER_EXECUTED fallback event:",
            evtErr,
          );
        }
      }
    }
  }
}
