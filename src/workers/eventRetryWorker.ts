import { getPool } from "../db/connection";
import { EventDispatcher, EventType } from "../events";

export class EventRetryWorker {
  private static interval: NodeJS.Timeout | null = null;

  static initialize() {
    if (this.interval) return;
    console.log("[EventRetryWorker] Initializing...");

    // Scan every 30 seconds
    this.interval = setInterval(async () => {
      try {
        await this.scanPendingEvents();
        await this.scanFailedEvents();
      } catch (err) {
        console.error(`[EventRetryWorker] Scan error:`, err);
      }
    }, 30000);

    // Initial run
    setTimeout(() => {
      this.scanPendingEvents().catch(err => console.error(`[EventRetryWorker] Initial scan error:`, err));
      this.scanFailedEvents().catch(err => console.error(`[EventRetryWorker] Initial scan error:`, err));
    }, 5000);
  }

  static async scanPendingEvents() {
    const pool = getPool();
    // Find PENDING events older than 60s
    const query = `
      UPDATE event_queue_logs
      SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'PENDING'
        AND COALESCE(updated_at, created_at) + interval '60 seconds' <= CURRENT_TIMESTAMP
      RETURNING id
    `;
    const res = await pool.query(query);
    for (const row of res.rows) {
      console.log(`[EventRetryWorker] Marked orphaned PENDING event ${row.id} as FAILED`);
    }
  }

  static async scanFailedEvents() {
    const pool = getPool();
    // Make sure we have at least updated_at, fallback to created_at if updated_at is null
    const query = `
      SELECT id, event_type, payload, retry_count
      FROM event_queue_logs
      WHERE status = 'FAILED'
        AND COALESCE(updated_at, created_at) + (15 * POWER(2, retry_count)) * interval '1 second' <= CURRENT_TIMESTAMP
    `;

    const res = await pool.query(query);

    for (const row of res.rows) {
      if (row.retry_count >= 3) {
        console.log(`[EventRetryWorker] Max retries reached for event ${row.id}, marking as DEAD_LETTER`);
        await EventDispatcher.markDeadLetter(row.id);
      } else {
        console.log(`[EventRetryWorker] Retrying event ${row.id} (attempt ${row.retry_count + 1})`);
        await EventDispatcher.dispatchExisting(row.id, row.event_type as EventType, row.payload);
      }
    }
  }

  static shutdown() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
