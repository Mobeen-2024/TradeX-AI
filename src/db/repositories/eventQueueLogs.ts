import { getPool, isUsingMockDb } from "../connection";

export class EventQueueLogsRepository {
  static async markOrphanedPendingAsFailed() {
    if (isUsingMockDb()) return [];
    const pool = getPool();
    const query = `
      UPDATE event_queue_logs
      SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'PENDING'
        AND COALESCE(updated_at, created_at) + interval '60 seconds' <= CURRENT_TIMESTAMP
      RETURNING id
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  static async getFailedEventsForRetry() {
    if (isUsingMockDb()) return [];
    const pool = getPool();
    const query = `
      SELECT id, event_type, payload, retry_count
      FROM event_queue_logs
      WHERE status = 'FAILED'
        AND COALESCE(updated_at, created_at) + (15 * POWER(2, retry_count)) * interval '1 second' <= CURRENT_TIMESTAMP
    `;
    const res = await pool.query(query);
    return res.rows;
  }
}
