import { getPool } from "../connection";

export interface MarketSnapshot {
  id: string;
  asset_id: string;
  bid: string | null;
  ask: string | null;
  price: string;
  volume: string | null;
  timestamp: Date;
  source: string;
  created_at: Date;
}

export class MarketSnapshotRepository {
  static async getLatest(assetId?: string): Promise<MarketSnapshot[]> {
    const pool = getPool();
    if (assetId) {
      const result = await pool.query(
        `SELECT * FROM market_snapshots WHERE asset_id = $1 ORDER BY timestamp DESC LIMIT 1`,
        [assetId]
      );
      return result.rows as MarketSnapshot[];
    } else {
      const result = await pool.query(
        `SELECT DISTINCT ON (asset_id) * FROM market_snapshots ORDER BY asset_id, timestamp DESC`
      );
      return result.rows as MarketSnapshot[];
    }
  }
}
