import { getPool } from "../db/connection";
import { v4 as uuidv4 } from "uuid";
import { PnlService } from "./pnlService";
import { EvaluationService } from "./evaluationService";
import { BinanceClient } from "./exchange/binanceClient";
import { RiskControlService } from "./riskControlService";
import { MemoryService } from "./memoryService";

interface OrderRequest {
  portfolioId: string;
  assetId: string;
  action: "BUY" | "SELL";
  size: number;
  correlationId?: string;
  strategyId?: string;
  isBacktest?: boolean;
  overrideId?: string;
}

class ExecutionSimulator {
  static async simulateExecution(
    intendedPrice: number,
    action: "BUY" | "SELL",
  ): Promise<{
    executedPrice: number;
    slippageBps: number;
    latencyMs: number;
    spreadPaid: number;
  }> {
    const latencyMs = Math.floor(Math.random() * 250) + 50;
    await new Promise((r) => setTimeout(r, latencyMs));

    const spreadBps = Math.random() * 2;
    const spreadMultiplier =
      action === "BUY" ? 1 + spreadBps / 10000 : 1 - spreadBps / 10000;

    const slippageBps = Math.random() * 5;
    const slippageMultiplier =
      action === "BUY" ? 1 + slippageBps / 10000 : 1 - slippageBps / 10000;

    const executedPrice = intendedPrice * spreadMultiplier * slippageMultiplier;
    const spreadPaid = intendedPrice * Math.abs(spreadMultiplier - 1);

    return { executedPrice, slippageBps, latencyMs, spreadPaid };
  }
}

export class ExecutionService {
  private static binanceClient = new BinanceClient();

  static async placeOrder(
    request: OrderRequest,
  ): Promise<{ orderId: string; price: number }> {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Idempotency check
      if (request.correlationId) {
        const existing = await client.query(
          `SELECT id, status, average_fill_price FROM orders WHERE correlation_id = $1`,
          [request.correlationId],
        );
        if (existing.rows.length > 0) {
          if (
            existing.rows[0].status === "FILLED" ||
            existing.rows[0].status === "PENDING" ||
            existing.rows[0].status === "NEW"
          ) {
            return {
              orderId: existing.rows[0].id,
              price: Number(existing.rows[0].average_fill_price || 0),
            };
          }
        }
      }

      // SAFETY LAYER: Global Kill Switch & Circuit Breaker
      const systemRes = await client.query(
        `SELECT is_trading_enabled, circuit_breaker_active, exchange_api_failures FROM global_system_controls ORDER BY id ASC LIMIT 1`,
      );
      if (systemRes.rows.length > 0) {
        const sys = systemRes.rows[0];
        if (!sys.is_trading_enabled || sys.circuit_breaker_active) {
          throw new Error(
            "Execution rejected: Global trading is disabled or circuit breaker is active.",
          );
        }
      }

      // Portfolio Hard Risk Constraints
      const portfolioRes = await client.query(
        `SELECT user_id, is_trading_enabled, max_position_size, max_loss FROM portfolios WHERE id = $1`,
        [request.portfolioId],
      );
      if (portfolioRes.rows.length === 0) {
        throw new Error("Portfolio not found");
      }
      const portfolio = portfolioRes.rows[0];

      if (!portfolio.is_trading_enabled) {
        throw new Error(
          "Execution rejected: Trading is disabled for this portfolio.",
        );
      }

      // Phase 9: Predictive Risk Engine
      const { RiskStateService } = require("./riskStateService");
      const riskAssessment = await RiskStateService.assessRiskState(
        request.portfolioId,
        request.assetId,
      );

      console.log(
        `[ExecutionService] Risk State: ${riskAssessment.state}, Multiplier: ${riskAssessment.riskMultiplier}, Drawdown: ${riskAssessment.drawdown}, Streak: ${riskAssessment.lossStreak}`,
      );

      // Phase 10: Multi-Portfolio Capital Orchestration
      const { GlobalPortfolioService } = require("./globalPortfolioService");
      const globalCapitalWeight =
        await GlobalPortfolioService.getPortfolioWeight(request.portfolioId);

      console.log(
        `[ExecutionService] Global Capital Weight: ${globalCapitalWeight}`,
      );

      // Fetch Coordinator Confidence Score from Memory via correlationId
      let confidenceScore = 1.0;
      let marketRegime = "UNKNOWN";
      let volatilityLevel = "NORMAL";

      if (request.correlationId) {
        const coordMemory = await MemoryService.getByCorrelation(
          request.correlationId,
          "Coordinator",
        );
        if (
          coordMemory &&
          coordMemory.metadata &&
          typeof coordMemory.metadata.confidence_score === "number"
        ) {
          confidenceScore = coordMemory.metadata.confidence_score;
        }
        const quantMemory = await MemoryService.getByCorrelation(
          request.correlationId,
          "QuantAgent",
        );
        if (quantMemory) {
          marketRegime = quantMemory.market_regime || "UNKNOWN";
          volatilityLevel =
            (quantMemory.metadata && quantMemory.metadata.volatility_level) ||
            "NORMAL";
        }
      }

      // Verify Max Loss Limit vs Current PNL
      const positionsRes = await client.query(
        `SELECT * FROM positions WHERE portfolio_id = $1`,
        [request.portfolioId],
      );
      let totalUnrealizedPnl = 0;
      let totalRealizedPnl = 0;
      for (const pos of positionsRes.rows) {
        totalRealizedPnl += Number(pos.pnl_realized || 0);
        const cPriceRes = await client.query(
          `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`,
          [pos.asset_id],
        );
        const currPrice =
          cPriceRes.rows.length > 0
            ? Number(cPriceRes.rows[0].price)
            : Number(pos.avg_entry_price);
        totalUnrealizedPnl +=
          (currPrice - Number(pos.avg_entry_price)) * Number(pos.size);
      }
      if (
        Number(portfolio.max_loss) > 0 &&
        totalRealizedPnl + totalUnrealizedPnl <=
          -Math.abs(Number(portfolio.max_loss))
      ) {
        throw new Error(
          `Execution rejected: Max loss limit (${portfolio.max_loss}) breached.`,
        );
      }

      const recentTicks = await client.query(
        `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 20`,
        [request.assetId],
      );
      let volatilityMultiplier = 1.0;
      let currentPrice = 50000;
      if (recentTicks.rows.length >= 10) {
        const prices = recentTicks.rows.map((r) => Number(r.price));
        currentPrice = prices[0];
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const spreadPercentage =
          avgPrice > 0 ? (maxPrice - minPrice) / avgPrice : 0;

        if (spreadPercentage > 0.03) {
          volatilityMultiplier = 0.5;
        } else if (spreadPercentage < 0.005) {
          volatilityMultiplier = 1.2;
        }
      }

      const originalSize = Number(request.size);
      // Apply all position sizing edges: base size * predictive risk multiplier * global capital weight * vol curve * confidence probability
      request.size = parseFloat(
        (
          originalSize *
          riskAssessment.riskMultiplier *
          globalCapitalWeight *
          volatilityMultiplier *
          confidenceScore
        ).toFixed(6),
      );

      // Phase 8: Capital Allocation scaling
      if (request.strategyId) {
        const {
          CapitalAllocationService,
        } = require("./capitalAllocationService");
        const allocs = await CapitalAllocationService.getContextualAllocations(
          request.portfolioId,
          marketRegime,
          volatilityLevel,
        );
        const alloc = allocs.find(
          (a: any) => a.strategy_id === request.strategyId,
        );
        const allocationMultiplier = alloc
          ? Number(alloc.allocation_percentage)
          : 1;
        request.size = request.size * allocationMultiplier;
      }

      if (request.size <= 0) request.size = 0.000001;

      const isBacktestMode = (request as any).isBacktest === true;

      // SMALL POSITION ENSURANCE (TESTNET)
      // Ensure minimum notional but small size
      let finalSize = request.size;
      let expectedNotional = finalSize * currentPrice;

      console.log(
        `[ExecutionService] Original request volume: ${request.size} @ ~${currentPrice} = ${expectedNotional} USDT. Confidence: ${confidenceScore}`,
      );

      // For Binance Testnet, minimum notional is often 10 USDT.
      // We cap max notional at 50 USDT to keep positions strictly small.
      if (!isBacktestMode) {
        const MAX_NOTIONAL = 50;
        const MIN_NOTIONAL = 15; // Safe buffer above 10 USDT

        if (expectedNotional > MAX_NOTIONAL) {
          finalSize = MAX_NOTIONAL / currentPrice;
          console.log(
            `[ExecutionService] Capping size to max notional ($50): ${finalSize}`,
          );
        } else if (expectedNotional < MIN_NOTIONAL && confidenceScore > 0.3) {
          // Only bump to minimum if confidence is somewhat decent
          finalSize = MIN_NOTIONAL / currentPrice;
          console.log(
            `[ExecutionService] Bumping size to min notional ($15): ${finalSize}`,
          );
        }
      }

      // Floor decimal precision
      finalSize = Math.floor(finalSize * 100000) / 100000;
      request.size = finalSize;
      console.log(
        `[ExecutionService] Executing order: ${request.action} ${request.size} ${request.assetId}`,
      );

      // Save order into DB as PENDING initially
      const orderIdResult = await client.query(
        `INSERT INTO orders (id, portfolio_id, asset_id, action, size, status, correlation_id, is_simulation)
                 VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7)
                 ON CONFLICT (correlation_id) DO UPDATE SET status = 'PENDING', is_simulation = $7
                 RETURNING id`,
        [
          uuidv4(),
          request.portfolioId,
          request.assetId,
          request.action,
          request.size,
          request.correlationId || null,
          isBacktestMode
        ],
      );
      const internalOrderId = orderIdResult.rows[0].id;
      console.log(
        `[ExecutionService] Inserted internal PENDING order: ${internalOrderId}`,
      );

      let executedPrice = currentPrice;
      let executionStatus = "FILLED";
      let exchangeOrderId = null;
      let filledQuantity = request.size;

      if (!isBacktestMode) {
        console.log(`[ExecutionService] Initiating REAL exchange execution...`);
        try {
          const orderRes = await this.binanceClient.placeOrder({
            symbol: request.assetId,
            side: request.action,
            type: "MARKET",
            quantity: request.size,
          });

          exchangeOrderId = orderRes.orderId;
          executionStatus = orderRes.status; // typically 'FILLED', 'NEW', 'PARTIALLY_FILLED'

          console.log(
            `[ExecutionService] Exchange response status: ${executionStatus}, target ID: ${exchangeOrderId}`,
          );

          if (
            orderRes.status === "FILLED" ||
            orderRes.status === "PARTIALLY_FILLED"
          ) {
            let totalCost = 0;
            let totalQty = 0;
            if (orderRes.fills && orderRes.fills.length > 0) {
              for (const fill of orderRes.fills) {
                totalCost += parseFloat(fill.price) * parseFloat(fill.qty);
                totalQty += parseFloat(fill.qty);
              }
              executedPrice = totalCost / totalQty;
              filledQuantity = totalQty;
            } else if (parseFloat(orderRes.executedQty) > 0) {
              executedPrice =
                parseFloat(orderRes.cummulativeQuoteQty) /
                parseFloat(orderRes.executedQty);
              filledQuantity = parseFloat(orderRes.executedQty);
            }
          }

          // Reset API failures on success
          await client.query(
            `UPDATE global_system_controls SET exchange_api_failures = 0`,
          );
        } catch (err: any) {
          // Circuit Breaker Trigger
          const updateRes = await client.query(`
                        UPDATE global_system_controls
                        SET exchange_api_failures = exchange_api_failures + 1
                        RETURNING exchange_api_failures`);
          const failures = updateRes.rows[0].exchange_api_failures;
          console.error(
            `[ExecutionService] Binance API Error. Failures count: ${failures}`,
          );

          if (failures >= 3) {
            await client.query(
              `UPDATE global_system_controls SET circuit_breaker_active = true, is_trading_enabled = false`,
            );
            console.error(
              `[ExecutionService] CIRCUIT BREAKER TRIGGERED! Trading halted due to 3 consecutive exchange API failures.`,
            );
          }

          await client.query(
            `UPDATE orders SET status = 'CANCELED' WHERE id = $1`,
            [internalOrderId],
          );
          throw new Error(
            `Real exchange execution failed: ${(err as any).message}`,
          );
        }
      } else {
        // Backtest mode Simulation
        const sim = await ExecutionSimulator.simulateExecution(
          currentPrice,
          request.action,
        );
        executedPrice = sim.executedPrice;

        // We will pass sim metrics into processFills to store them
        (request as any).simMetrics = { ...sim, intendedPrice: currentPrice };
      }

      await client.query(
        `UPDATE orders
                 SET status = $1, exchange_order_id = $2, average_fill_price = $3, filled_size = $4
                 WHERE id = $5`,
        [
          executionStatus,
          exchangeOrderId,
          executedPrice,
          filledQuantity,
          internalOrderId,
        ],
      );

      // If order is fully or partially filled, we apply it locally
      // (If it's just 'NEW', the SyncWorker will process the fills later)
      if (
        executionStatus === "FILLED" ||
        executionStatus === "PARTIALLY_FILLED"
      ) {
        await ExecutionService.processFills(
          client,
          request,
          internalOrderId,
          executedPrice,
          filledQuantity,
          portfolio,
          positionsRes.rows,
        );
      }

      await client.query("COMMIT");
      return { orderId: internalOrderId, price: executedPrice };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private static async processFills(
    client: any,
    request: OrderRequest,
    orderId: string,
    price: number,
    filledSize: number,
    portfolio: any,
    positions: any[],
  ) {
    let newTradeId: string | null = null;
    let closedTradeId: string | null = null;
    const cost = filledSize * price;

    const balanceResult = await client.query(
      `SELECT cash_balance FROM balances WHERE portfolio_id = $1 FOR UPDATE`,
      [request.portfolioId],
    );
    let cash =
      balanceResult.rows.length > 0
        ? Number(balanceResult.rows[0].cash_balance)
        : 100000;
    if (balanceResult.rows.length === 0) {
      await client.query(
        `INSERT INTO balances (portfolio_id, cash_balance) VALUES ($1, $2)`,
        [request.portfolioId, cash],
      );
    }

    const posResult = await client.query(
      `SELECT * FROM positions WHERE portfolio_id = $1 AND asset_id = $2 FOR UPDATE`,
      [request.portfolioId, request.assetId],
    );
    let pos = posResult.rows.length > 0 ? posResult.rows[0] : null;

    if (request.action === "BUY") {
      cash -= cost;
      await client.query(
        `UPDATE balances SET cash_balance = $1 WHERE portfolio_id = $2`,
        [cash, request.portfolioId],
      );

      if (pos) {
        const oldSize = Number(pos.size);
        const newSize = oldSize + filledSize;
        const oldEntry = Number(pos.avg_entry_price);
        const newEntry = (oldSize * oldEntry + cost) / newSize;
        await client.query(
          `UPDATE positions SET size = $1, avg_entry_price = $2, updated_at = NOW() WHERE id = $3`,
          [newSize, newEntry, pos.id],
        );
      } else {
        await client.query(
          `INSERT INTO positions (portfolio_id, asset_id, avg_entry_price, size) VALUES ($1, $2, $3, $4)`,
          [request.portfolioId, request.assetId, price, filledSize],
        );
      }

      const isSimulation = (request as any).isBacktest === true;
      const overrideId = request.overrideId || null;
      const tradeResult = await client.query(
        `INSERT INTO trades (portfolio_id, asset_id, entry_price, size, status, is_simulation, override_id) VALUES ($1, $2, $3, $4, 'OPEN', $5, $6) RETURNING id`,
        [request.portfolioId, request.assetId, price, filledSize, isSimulation, overrideId],
      );
      newTradeId = tradeResult.rows[0].id;
      await client.query(`UPDATE orders SET trade_id = $1 WHERE id = $2`, [
        newTradeId,
        orderId,
      ]);
    }

    if (request.action === "SELL") {
      cash += cost;
      await client.query(
        `UPDATE balances SET cash_balance = $1 WHERE portfolio_id = $2`,
        [cash, request.portfolioId],
      );

      if (pos) {
        const entryPrice = Number(pos.avg_entry_price);
        const realizedPnl = PnlService.calculateRealizedPnlOnSell(
          entryPrice,
          price,
          filledSize,
        );
        const newSize = Math.max(0, Number(pos.size) - filledSize);
        const newPnlRealized = Number(pos.pnl_realized) + realizedPnl;

        await client.query(
          `UPDATE positions SET size = $1, pnl_realized = $2, updated_at = NOW() WHERE id = $3`,
          [newSize, newPnlRealized, pos.id],
        );
      } else {
        await client.query(
          `INSERT INTO positions (portfolio_id, asset_id, avg_entry_price, size, pnl_realized) VALUES ($1, $2, $3, $4, 0)`,
          [request.portfolioId, request.assetId, price, -filledSize],
        );
      }

      const openTradeResult = await client.query(
        `SELECT id, entry_price, size FROM trades WHERE portfolio_id = $1 AND asset_id = $2 AND status = 'OPEN' ORDER BY opened_at ASC LIMIT 1`,
        [request.portfolioId, request.assetId],
      );

      if (openTradeResult.rows.length > 0) {
        const tradeToClose = openTradeResult.rows[0];
        const tradeRealizedPnl = PnlService.calculateRealizedPnlOnSell(
          Number(tradeToClose.entry_price),
          price,
          filledSize,
        );

        const overrideId = request.overrideId || null;
        await client.query(
          `UPDATE trades SET status = 'CLOSED', exit_price = $1, pnl = $2, closed_at = NOW(), override_id = COALESCE($4, override_id) WHERE id = $3`,
          [price, tradeRealizedPnl, tradeToClose.id, overrideId],
        );
        await client.query(`UPDATE orders SET trade_id = $1 WHERE id = $2`, [
          tradeToClose.id,
          orderId,
        ]);
        closedTradeId = tradeToClose.id;
      }
    }

    if (closedTradeId && portfolio.user_id) {
      EvaluationService.evaluateTrade(
        closedTradeId,
        portfolio.user_id,
        request.portfolioId,
        request.correlationId,
      ).catch((err) => {
        console.error("[ExecutionService] Post-trade evaluation failed:", err);
      });
      const {
        StrategyEvolutionService,
      } = require("./strategyEvolutionService");
      StrategyEvolutionService.processClosedTrade(
        closedTradeId,
        request.portfolioId,
      ).catch((err) => {
        console.error(
          "[ExecutionService] Post-trade strategy evolution failed:",
          err,
        );
      });
    }

    const simMetrics = (request as any).simMetrics;
    const targetTradeId = newTradeId || closedTradeId;
    if (simMetrics && targetTradeId) {
      await client.query(
        `INSERT INTO execution_metrics (trade_id, intended_price, executed_price, slippage_bps, latency_ms, spread_paid)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          targetTradeId,
          simMetrics.intendedPrice,
          simMetrics.executedPrice,
          simMetrics.slippageBps,
          simMetrics.latencyMs,
          simMetrics.spreadPaid,
        ],
      );
    }
  }

  static async syncOpenOrders() {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const pendingOrders = await client.query(
        `SELECT id, asset_id, exchange_order_id, status FROM orders
                 WHERE status IN ('NEW', 'PENDING', 'PARTIALLY_FILLED') AND exchange_order_id IS NOT NULL`,
      );

      if (pendingOrders.rows.length > 0) {
        console.log(
          `[ExecutionService] Found ${pendingOrders.rows.length} pending exchange orders.`,
        );
      }

      for (const order of pendingOrders.rows) {
        try {
          const statusRes = await this.binanceClient.getOrderStatus(
            order.asset_id,
            order.exchange_order_id,
          );

          if (statusRes.status !== order.status) {
            let avgPrice = 0;
            let filledQty = parseFloat(statusRes.executedQty);

            if (filledQty > 0) {
              avgPrice = parseFloat(statusRes.cummulativeQuoteQty) / filledQty;
            }

            await client.query(
              `UPDATE orders SET status = $1, average_fill_price = $2, filled_size = $3 WHERE id = $4`,
              [statusRes.status, avgPrice, filledQty, order.id],
            );

            // If it transitioned to filled/canceled, we should process fills (for now we omit full fill processing due to scope/events)
            if (
              ["FILLED", "PARTIALLY_FILLED", "CANCELED", "REJECTED"].includes(
                statusRes.status,
              )
            ) {
              const { EventDispatcher, EventType } = require("../events");
              EventDispatcher.emit(EventType.ORDER_UPDATED, {
                orderId: order.id,
                exchangeOrderId: order.exchange_order_id,
                status: statusRes.status,
                filledSize: filledQty,
                averagePrice: avgPrice,
              });
            }
            return pendingOrders.rows;
          }
        } catch (err: any) {
          console.error(
            `[ExecutionService] Failed to sync order ${order.id}:`,
            err,
          );
        }
      }
      return pendingOrders.rows;
    } finally {
      client.release();
    }
  }
}
