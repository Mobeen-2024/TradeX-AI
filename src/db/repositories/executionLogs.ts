import { getPool } from "../connection";

export interface ExecutionLog {
  id?: string;
  agent_name: string;
  start_timestamp: Date;
  duration_ms: number;
  success: boolean;
  fallback_used?: boolean;
  error_message?: string | null;
  portfolio_id?: string | null;
  user_id?: string | null;
  strategy_id?: string | null;
  created_at?: Date;
}

export class ExecutionLogRepository {
  static async insertLog(log: ExecutionLog): Promise<void> {
    const pool = getPool();
    await pool.query(
      `INSERT INTO execution_logs (agent_name, start_timestamp, duration_ms, success, error_message, portfolio_id, user_id, fallback_used, strategy_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        log.agent_name,
        log.start_timestamp,
        log.duration_ms,
        log.success,
        log.error_message || null,
        log.portfolio_id || null,
        log.user_id || null,
        log.fallback_used ?? false,
        log.strategy_id || null,
      ]
    );
  }
}
