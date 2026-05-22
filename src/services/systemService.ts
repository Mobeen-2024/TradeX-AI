import { getPool } from "../db/connection";

export class SystemService {
  static async getAuditLogs(limit: number = 10) {
    const pool = getPool();
    const logsRes = await pool.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1", [limit]);
    return logsRes.rows;
  }

  static async killSystem() {
    const pool = getPool();
    await pool.query("UPDATE global_system_controls SET is_trading_enabled = false WHERE id = 1");
  }

  static async resumeSystem() {
    const pool = getPool();
    await pool.query("UPDATE global_system_controls SET is_trading_enabled = true, circuit_breaker_active = false WHERE id = 1");
  }
}
