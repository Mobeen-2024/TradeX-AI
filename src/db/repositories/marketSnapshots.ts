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
  static async getLatest(assetIds?: string[]): Promise<MarketSnapshot[]> {
    const pool = getPool();
    if (assetIds && assetIds.length > 0) {
      const result = await pool.query(
        `SELECT DISTINCT ON (asset_id) * FROM market_snapshots WHERE asset_id = ANY($1) ORDER BY asset_id, timestamp DESC`,
        [assetIds]
      );
      return result.rows as MarketSnapshot[];
    } else if (assetIds && assetIds.length === 0) {
      return [];
    } else {
      const result = await pool.query(
        `SELECT DISTINCT ON (asset_id) * FROM market_snapshots ORDER BY asset_id, timestamp DESC`
      );
      return result.rows as MarketSnapshot[];
    }
  }
}
