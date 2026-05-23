import { getPool } from "../db/connection";
import { TelemetryServer } from "../telemetry";

export class SystemService {
  static async getAuditLogs(limit: number = 50, severity?: string) {
    const pool = getPool();
    let query = "SELECT * FROM audit_logs";
    const params: any[] = [];
    if (severity) {
      query += " WHERE severity = $1";
      params.push(severity);
    }
    query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1);
    params.push(limit);
    
    const logsRes = await pool.query(query, params);
    return logsRes.rows;
  }

  static async logAuditEvent(eventType: string, details: any, severity: string = 'INFO', source: string = 'SYSTEM', userId?: string, portfolioId?: string) {
    const pool = getPool();
    await pool.query(
      "INSERT INTO audit_logs (event_type, details, severity, source, user_id, portfolio_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [eventType, details, severity, source, userId, portfolioId]
    );
  }

  static async saveSnapshot(portfolioId: string, label: string, data: any, userId?: string) {
    const pool = getPool();
    const res = await pool.query(
      "INSERT INTO session_snapshots (portfolio_id, label, data, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [portfolioId, label, data, userId]
    );
    return res.rows[0];
  }

  static async listSnapshots(portfolioId: string) {
    const pool = getPool();
    const res = await pool.query(
      "SELECT id, label, created_at FROM session_snapshots WHERE portfolio_id = $1 ORDER BY created_at DESC",
      [portfolioId]
    );
    return res.rows;
  }

  static async loadSnapshot(id: string) {
    const pool = getPool();
    const res = await pool.query("SELECT * FROM session_snapshots WHERE id = $1", [id]);
    return res.rows[0];
  }

  static async getSystemHealth() {
    const pool = getPool();
    const startTime = Date.now();
    let dbConnected = false;
    try {
      await pool.query("SELECT 1");
      dbConnected = true;
    } catch (e) {}
    const dbLatencyMs = Date.now() - startTime;
    
    const { rows } = await pool.query("SELECT is_trading_enabled, circuit_breaker_active FROM global_system_controls WHERE id = 1");
    const controls = rows[0] || { is_trading_enabled: true, circuit_breaker_active: false };
    
    // Attempt to log health check optionally, or just return real-time. We'll just return real-time.
    
    return {
      dbConnected,
      dbLatencyMs,
      wsClientCount: TelemetryServer.getClientCount(),
      circuitBreakerActive: controls.circuit_breaker_active,
      isTradingEnabled: controls.is_trading_enabled
    };
  }

  static async killSystem() {
    const pool = getPool();
    await pool.query("UPDATE global_system_controls SET is_trading_enabled = false WHERE id = 1");
    await this.logAuditEvent('KILL_SWITCH_ACTIVATED', { reason: 'Manual kill switch toggled via UI' }, 'CRITICAL');
    TelemetryServer.broadcastGlobal({ type: "SYSTEM_CONTROL", action: "KILL" });
  }

  static async resumeSystem() {
    const pool = getPool();
    await pool.query("UPDATE global_system_controls SET is_trading_enabled = true, circuit_breaker_active = false WHERE id = 1");
    await this.logAuditEvent('SYSTEM_RESUMED', { reason: 'Manual resume toggled via UI' }, 'INFO');
    TelemetryServer.broadcastGlobal({ type: "SYSTEM_CONTROL", action: "RESUME" });
  }
}
