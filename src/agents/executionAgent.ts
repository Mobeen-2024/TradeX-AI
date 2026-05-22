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
        EventListener.subscribe(EventType.COORDINATOR_DECISION_COMPLETED, async (payload) => {
            console.log(`[ExecutionAgent] Received COORDINATOR_DECISION_COMPLETED:`, payload);
            try {
                await this.executeDecision(payload);
            } catch (err) {
                console.error(`[ExecutionAgent] error:`, err);
                throw err;
            }
        });
    }

    static async executeDecision(payload: any) {
        const startTimestamp = new Date();
        const { portfolioId, correlationId, decision } = payload;

        let userId = payload.userId;

        if (!userId) {
            const portfolio = await PortfolioRepository.findById(portfolioId);
            if (portfolio) {
                userId = portfolio.user_id;
            } else {
                throw new Error("Portfolio not found: " + portfolioId);
            }
        }

        try {
            if (decision.action === "BUY" || decision.action === "SELL") {
                // Kill-switch: check risk level before execution
                const riskMemory = await MemoryService.getByCorrelation(correlationId, "RiskGuardian");
                if (riskMemory && riskMemory.market_regime.includes("HIGH")) {
                    console.warn(`[ExecutionAgent] Blocking execution due to HIGH risk for correlation ${correlationId}`);

                    await MemoryService.logMemory(
                        `SKIPPED_EXECUTION`,
                        `Execution blocked by RiskGuardian (Risk=HIGH). Rationale: ${riskMemory.ai_rationale}`,
                        userId,
                        portfolioId,
                        correlationId,
                        "ExecutionAgent"
                    );

                    const durationMs = Date.now() - startTimestamp.getTime();
                    await ExecutionLogRepository.insertLog({
                        agent_name: "ExecutionAgent",
                        start_timestamp: startTimestamp,
                        duration_ms: durationMs,
                        success: true,
                        error_message: "Blocked by RiskGuardian",
                        user_id: userId,
                        portfolio_id: portfolioId
                    });
                    return; // Abort execution
                }

                // Extract adaptive position size from RiskGuardian
                let adaptiveSize = 1; // Default
                if (riskMemory && riskMemory.ai_rationale) {
                    const match = riskMemory.ai_rationale.match(/Position Size: ([\d.]+)/);
                    if (match && match[1]) {
                        adaptiveSize = parseFloat(match[1]);
                        console.log(`[ExecutionAgent] Using adaptive position size from RiskGuardian: ${adaptiveSize}`);
                    }
                }

                const orderRequest = {
                    portfolioId,
                    userId,
                    assetId: decision.assetId || "BTC", // Default to BTC if unspecified
                    action: decision.action,
                    size: adaptiveSize,
                    correlationId: correlationId || uuidv4(),
                    strategyId: payload.strategyId,
                    isBacktest: payload.isBacktest
                };

                const { orderId, price } = await ExecutionService.placeOrder(orderRequest);

                // Log to agent_decisions
                await AgentDecisionsRepository.insertDecision('QuantAgent', portfolioId, decision.assetId || "BTC", decision.action, price, decision.rationale);

                // Track execution in memory
                await MemoryService.logMemory(
                    `EXECUTED_ORDER`,
                    `Executed ${decision.action} order. Order ID: ${orderId}. Confidence: ${decision.confidence}. Rationale: ${decision.rationale}`,
                    userId,
                    portfolioId,
                    correlationId,
                    "ExecutionAgent"
                );

                const durationMs = Date.now() - startTimestamp.getTime();
                await ExecutionLogRepository.insertLog({
                    agent_name: "ExecutionAgent",
                    start_timestamp: startTimestamp,
                    duration_ms: durationMs,
                    success: true,
                    error_message: null,
                    user_id: userId,
                    portfolio_id: portfolioId
                });

                await EventDispatcher.emit(EventType.ORDER_EXECUTED, {
                    orderId,
                    portfolioId,
                    userId,
                    correlationId,
                    action: decision.action
                });
            } else {
                // HOLD or unknown action, log it but don't place order
                await MemoryService.logMemory(
                    `SKIPPED_EXECUTION`,
                    `Decision was ${decision.action}, no order placed. Confidence: ${decision.confidence}. Rationale: ${decision.rationale}`,
                    userId,
                    portfolioId,
                    correlationId,
                    "ExecutionAgent"
                );

                const durationMs = Date.now() - startTimestamp.getTime();
                await ExecutionLogRepository.insertLog({
                    agent_name: "ExecutionAgent",
                    start_timestamp: startTimestamp,
                    duration_ms: durationMs,
                    success: true,
                    error_message: null,
                    user_id: userId,
                    portfolio_id: portfolioId
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
                portfolio_id: portfolioId
            });
            throw error;
        }
    }
}
