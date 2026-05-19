import { getPool } from "../db/connection";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { PnlService } from "./pnlService";

interface OrderRequest {
    portfolioId: string;
    assetId: string;
    action: 'BUY' | 'SELL';
    size: number;
    correlationId?: string;
}

export class ExecutionService {
    static async executeBinanceTestnetOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number) {
        const apiKey = process.env.BINANCE_TESTNET_API_KEY;
        const apiSecret = process.env.BINANCE_TESTNET_SECRET;

        if (!apiKey || !apiSecret) {
            console.warn(`[ExecutionService] Binance testnet keys missing. Falling back to simple delay...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }

        const baseUrl = 'https://testnet.binance.vision';
        const endpoint = '/api/v3/order';

        let formattedSymbol = symbol.toUpperCase();
        if (!formattedSymbol.endsWith('USDT')) {
            formattedSymbol += 'USDT';
        }

        const timestamp = Date.now();
        const queryString = `symbol=${formattedSymbol}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;

        const signature = crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');

        const url = `${baseUrl}${endpoint}?${queryString}&signature=${signature}`;

        try {
            console.log(`[ExecutionService] Sending real order to Binance Testnet: ${side} ${quantity} ${formattedSymbol}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-MBX-APIKEY': apiKey
                }
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('[ExecutionService] Binance API Error:', data);
                throw new Error(`Binance testnet execution failed: ${data.msg || response.statusText}`);
            }

            console.log('[ExecutionService] Binance testnet execution successful:', data.orderId);
        } catch (err) {
            console.error('[ExecutionService] External API execution failed:', err);
            throw err;
        }
    }

    static async placeOrder(request: OrderRequest): Promise<{ orderId: string, price: number }> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            if (request.correlationId) {
                const existing = await client.query(`SELECT id, status FROM orders WHERE correlation_id = $1`, [request.correlationId]);
                if (existing.rows.length > 0) {
                    if (existing.rows[0].status === 'FILLED') {
                        return { orderId: existing.rows[0].id, price: 0 }; // Idempotent return
                    }
                }
            }

            const result = await client.query(
                `INSERT INTO orders (id, portfolio_id, asset_id, action, size, status, correlation_id)
                 VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
                 ON CONFLICT (correlation_id) DO UPDATE SET status = 'PENDING'
                 RETURNING id`,
                [uuidv4(), request.portfolioId, request.assetId, request.action, request.size, request.correlationId || null]
            );
            const orderId = result.rows[0].id;

            // Get current market price
            let price = 50000; // fallback mock price
            const priceResult = await client.query(
                `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`,
                [request.assetId]
            );
            if (priceResult.rows.length > 0) {
                price = Number(priceResult.rows[0].price);
            }

            // Ensure balances entry exists
            const balanceResult = await client.query(
                `SELECT cash_balance FROM balances WHERE portfolio_id = $1 FOR UPDATE`,
                [request.portfolioId]
            );
            let cash = balanceResult.rows.length > 0 ? Number(balanceResult.rows[0].cash_balance) : 100000;
            if (balanceResult.rows.length === 0) {
                await client.query(
                    `INSERT INTO balances (portfolio_id, cash_balance) VALUES ($1, $2)`,
                    [request.portfolioId, cash]
                );
            }

            // Process Execution
            const cost = Number(request.size) * price;

            // Fetch existing position
            const posResult = await client.query(
                `SELECT * FROM positions WHERE portfolio_id = $1 AND asset_id = $2 FOR UPDATE`,
                [request.portfolioId, request.assetId]
            );
            let pos = posResult.rows.length > 0 ? posResult.rows[0] : null;

            if (request.action === 'BUY') {
                cash -= cost;
                if (cash < 0) {
                    throw new Error("Execution rejected: Insufficient cash balance");
                }
                await client.query(`UPDATE balances SET cash_balance = $1 WHERE portfolio_id = $2`, [cash, request.portfolioId]);

                if (pos) {
                    const oldSize = Number(pos.size);
                    const newSize = oldSize + Number(request.size);
                    const oldEntry = Number(pos.avg_entry_price);
                    const newEntry = ((oldSize * oldEntry) + cost) / newSize;
                    await client.query(
                        `UPDATE positions SET size = $1, avg_entry_price = $2, updated_at = NOW() WHERE id = $3`,
                        [newSize, newEntry, pos.id]
                    );
                } else {
                    await client.query(
                        `INSERT INTO positions (portfolio_id, asset_id, avg_entry_price, size) VALUES ($1, $2, $3, $4)`,
                        [request.portfolioId, request.assetId, price, request.size]
                    );
                }
            } else if (request.action === 'SELL') {
                cash += cost;
                await client.query(`UPDATE balances SET cash_balance = $1 WHERE portfolio_id = $2`, [cash, request.portfolioId]);

                if (pos) {
                    const entryPrice = Number(pos.avg_entry_price);
                    const realizedPnl = PnlService.calculateRealizedPnlOnSell(entryPrice, price, Number(request.size));
                    const newSize = Math.max(0, Number(pos.size) - Number(request.size));
                    const newPnlRealized = Number(pos.pnl_realized) + realizedPnl;

                    await client.query(
                        `UPDATE positions SET size = $1, pnl_realized = $2, updated_at = NOW() WHERE id = $3`,
                        [newSize, newPnlRealized, pos.id]
                    );
                } else {
                    // Short selling logic? Create negative size position
                    await client.query(
                        `INSERT INTO positions (portfolio_id, asset_id, avg_entry_price, size, pnl_realized) VALUES ($1, $2, $3, $4, 0)`,
                        [request.portfolioId, request.assetId, price, -request.size]
                    );
                }
            }

            // Execute via Binance Testnet or fallback to 500ms delay
            await ExecutionService.executeBinanceTestnetOrder(request.assetId, request.action, request.size);

            await client.query(
                `UPDATE orders SET status = 'FILLED' WHERE id = $1`,
                [orderId]
            );

            await client.query("COMMIT");
            return { orderId, price };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}
