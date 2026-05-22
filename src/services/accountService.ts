import { getPool } from "../db/connection";
import { BinanceClient } from "./exchange/binanceClient";

export class AccountService {
    private binanceClient = new BinanceClient();

    /**
     * Fetches real balances from Binance and updates the local balances table
     * for a given portfolio ID representing the real exchange account.
     */
    async syncExchangeBalances(portfolioId: string): Promise<void> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            console.log(`[AccountService] Syncing real exchange balances for portfolio ${portfolioId}...`);
            const rawBalances = await this.binanceClient.getAccountBalance();
            
            // Extract USDT as our base cash_balance Let's assume all base balances are USDT
            const usdtBalance = rawBalances.find((b: any) => b.asset === 'USDT');
            const totalCash = usdtBalance ? parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked) : 0;
            
            console.log(`[AccountService] Total equivalent cash balance (USDT): ${totalCash}`);

            await client.query("BEGIN");

            // Update cash balance
            const balanceRes = await client.query(`SELECT id FROM balances WHERE portfolio_id = $1`, [portfolioId]);
            if (balanceRes.rows.length === 0) {
                await client.query(
                    `INSERT INTO balances (portfolio_id, cash_balance, updated_at) VALUES ($1, $2, NOW())`,
                    [portfolioId, totalCash]
                );
            } else {
                await client.query(
                    `UPDATE balances SET cash_balance = $1, updated_at = NOW() WHERE portfolio_id = $2`,
                    [totalCash, portfolioId]
                );
            }

            // Sync other token positions
            for (const item of rawBalances) {
                if (item.asset === 'USDT') continue;
                
                const totalAssetAmount = parseFloat(item.free) + parseFloat(item.locked);
                if (totalAssetAmount > 0) {
                    const symbol = `${item.asset}USDT`;
                    
                    // Upsert position (note: we don't know average entry price strictly from this endpoint,
                    // we'll leave it unchanged if it exists, or 0 if it's new, though real system would calculate it)
                    const posRes = await client.query(
                        `SELECT id FROM positions WHERE portfolio_id = $1 AND asset_id = $2`, 
                        [portfolioId, symbol]
                    );

                    if (posRes.rows.length === 0) {
                        await client.query(
                            `INSERT INTO positions (portfolio_id, asset_id, size, avg_entry_price, updated_at) 
                             VALUES ($1, $2, $3, 0, NOW())`,
                            [portfolioId, symbol, totalAssetAmount]
                        );
                    } else {
                        // Normally you wouldn't blindly overwrite size if executionService is also tracking it, 
                        // but since it's a structural sync:
                        await client.query(
                            `UPDATE positions SET size = $1, updated_at = NOW() WHERE id = $2`,
                            [totalAssetAmount, posRes.rows[0].id]
                        );
                    }
                }
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            console.error(`[AccountService] Failed to sync balances from exchange:`, error);
            throw error;
        } finally {
            client.release();
        }
    }
}
