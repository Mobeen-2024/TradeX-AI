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
