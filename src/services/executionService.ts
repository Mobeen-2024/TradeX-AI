import { getPool } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

interface OrderRequest {
    portfolioId: string;
    assetId: string;
    action: 'BUY' | 'SELL';
    size: number;
}

export class ExecutionService {
    static async placeOrder(request: OrderRequest): Promise<string> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const result = await client.query(
                `INSERT INTO orders (id, portfolio_id, asset_id, action, size, status)
                 VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING id`,
                [uuidv4(), request.portfolioId, request.assetId, request.action, request.size]
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
                `SELECT cash FROM balances WHERE portfolio_id = $1`,
                [request.portfolioId]
            );
            let cash = balanceResult.rows.length > 0 ? Number(balanceResult.rows[0].cash) : 100000;
            if (balanceResult.rows.length === 0) {
                await client.query(
                    `INSERT INTO balances (portfolio_id, cash) VALUES ($1, $2)`,
                    [request.portfolioId, cash]
                );
            }

            // Process Execution
            const cost = Number(request.size) * price;

            // Fetch existing position
            const posResult = await client.query(
                `SELECT * FROM positions WHERE portfolio_id = $1 AND asset_id = $2`,
                [request.portfolioId, request.assetId]
            );
            let pos = posResult.rows.length > 0 ? posResult.rows[0] : null;

            if (request.action === 'BUY') {
                cash -= cost;
                await client.query(`UPDATE balances SET cash = $1 WHERE portfolio_id = $2`, [cash, request.portfolioId]);

                if (pos) {
                    const oldSize = Number(pos.size);
                    const newSize = oldSize + Number(request.size);
                    const oldEntry = Number(pos.entry_price);
                    const newEntry = ((oldSize * oldEntry) + cost) / newSize;
                    await client.query(
                        `UPDATE positions SET size = $1, entry_price = $2, updated_at = NOW() WHERE id = $3`,
                        [newSize, newEntry, pos.id]
                    );
                } else {
                    await client.query(
                        `INSERT INTO positions (portfolio_id, asset_id, entry_price, size) VALUES ($1, $2, $3, $4)`,
                        [request.portfolioId, request.assetId, price, request.size]
                    );
                }
            } else if (request.action === 'SELL') {
                cash += cost;
                await client.query(`UPDATE balances SET cash = $1 WHERE portfolio_id = $2`, [cash, request.portfolioId]);

                if (pos) {
                    const entryPrice = Number(pos.entry_price);
                    const realizedPnl = (price - entryPrice) * Number(request.size);
                    const newSize = Math.max(0, Number(pos.size) - Number(request.size));
                    const newPnlRealized = Number(pos.pnl_realized) + realizedPnl;

                    await client.query(
                        `UPDATE positions SET size = $1, pnl_realized = $2, updated_at = NOW() WHERE id = $3`,
                        [newSize, newPnlRealized, pos.id]
                    );
                } else {
                    // Short selling logic? Create negative size position
                    await client.query(
                        `INSERT INTO positions (portfolio_id, asset_id, entry_price, size, pnl_realized) VALUES ($1, $2, $3, $4, 0)`,
                        [request.portfolioId, request.assetId, price, -request.size]
                    );
                }
            }

            // Simulate execution mock fill
            await new Promise(resolve => setTimeout(resolve, 500)); // fake delay

            await client.query(
                `UPDATE orders SET status = 'FILLED' WHERE id = $1`,
                [orderId]
            );

            await client.query("COMMIT");
            return orderId;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}
