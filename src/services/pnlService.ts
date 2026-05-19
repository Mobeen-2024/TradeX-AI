import { getPool } from "../db/connection";
import { Position } from "../db/repositories/positions";

export class PnlService {
    static async calculateUnrealizedPnl(position: Position): Promise<number> {
        const pool = getPool();
        const priceResult = await pool.query(
            `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`,
            [position.asset_id]
        );
        const currentPrice = priceResult.rows.length > 0 ? Number(priceResult.rows[0].price) : Number(position.avg_entry_price);
        return (currentPrice - Number(position.avg_entry_price)) * Number(position.size);
    }
    
    static calculateRealizedPnlOnSell(entryPrice: number, sellPrice: number, size: number): number {
        return (sellPrice - entryPrice) * size;
    }
}
