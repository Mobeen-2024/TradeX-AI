import { EventListener, EventType, EventDispatcher } from "../events";
import { ExecutionService } from "../services/executionService";
import { ExecutionLogRepository } from "../db/repositories/executionLogs";
import { MemoryService } from "../services/memoryService";
import { getPool } from "../db/connection";

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
            const pool = getPool();
            const res = await pool.query("SELECT user_id FROM portfolios WHERE id = $1", [portfolioId]);
            if (res.rows.length > 0) {
                userId = res.rows[0].user_id;
            } else {
                throw new Error("Portfolio not found: " + portfolioId);
            }
        }

        try {
            if (decision.action === "BUY" || decision.action === "SELL") {
                const orderRequest = {
                    portfolioId,
                    userId,
                    assetId: decision.assetId || "BTC", // Default to BTC if unspecified
                    action: decision.action,
                    size: 1, // Default size for simulation
                };
                
                const orderId = await ExecutionService.placeOrder(orderRequest);
                
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
