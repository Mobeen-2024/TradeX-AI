import { Client } from "pg";
import { getPool, isUsingMockDb } from "../db/connection";

export enum EventType {
  MARKET_TICK_RECEIVED = "MARKET_TICK_RECEIVED",
  QUANT_ANALYSIS_REQUESTED = "QUANT_ANALYSIS_REQUESTED",
  QUANT_ANALYSIS_COMPLETED = "QUANT_ANALYSIS_COMPLETED",
  RISK_VALIDATION_REQUESTED = "RISK_VALIDATION_REQUESTED",
  RISK_VALIDATED = "RISK_VALIDATED",
  NEWS_PROCESSING_REQUESTED = "NEWS_PROCESSING_REQUESTED",
  NEWS_PROCESSED = "NEWS_PROCESSED",
  COORDINATOR_DECISION_REQUESTED = "COORDINATOR_DECISION_REQUESTED",
  COORDINATOR_DECISION_COMPLETED = "COORDINATOR_DECISION_COMPLETED",
  ORDER_EXECUTED = "ORDER_EXECUTED"
}

export interface EventPayload {
  id?: string;
  type: EventType;
  payload: any;
}

type EventHandler = (payload: any) => void | Promise<void>;

export class EventDispatcher {
  /**
   * Emit an event using PostgreSQL NOTIFY
   */
  static async emit(type: EventType, payload: any) {
    if (isUsingMockDb()) {
      console.log(`[EventDispatcher] [Mock Mode] Emitting in-memory event: ${type}`);
      setTimeout(async () => {
        const handlers = EventListener.getHandlersFor(type);
        for (const handler of handlers) {
          try {
            await Promise.resolve(handler(payload));
          } catch (err) {
            console.error(`[EventDispatcher] [Mock Mode] Error in handler for ${type}:`, err);
          }
        }
      }, 0);
      return;
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Persist event log before emitting
      const insertRes = await client.query(
        `INSERT INTO event_queue_logs (event_type, payload, status) VALUES ($1, $2, $3) RETURNING id`,
        [type, JSON.stringify(payload), 'PENDING']
      );
      const eventId = insertRes.rows[0].id;

      const eventPayload: EventPayload = { id: eventId, type, payload };
      // Using pg_notify to emit to 'tradex_events' channel
      await client.query(`SELECT pg_notify('tradex_events', $1)`, [JSON.stringify(eventPayload)]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async dispatchExisting(id: string, type: EventType, payload: any) {
    if (isUsingMockDb()) {
      console.log(`[EventDispatcher] [Mock Mode] Dispatching existing in-memory event: ${type}`);
      setTimeout(async () => {
        const handlers = EventListener.getHandlersFor(type);
        for (const handler of handlers) {
          try {
            await Promise.resolve(handler(payload));
          } catch (err) {
            console.error(`[EventDispatcher] [Mock Mode] Error in handler for ${type}:`, err);
          }
        }
      }, 0);
      return;
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE event_queue_logs SET status = 'PENDING', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
      const eventPayload: EventPayload = { id, type, payload };
      await client.query(`SELECT pg_notify('tradex_events', $1)`, [JSON.stringify(eventPayload)]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async markDeadLetter(id: string) {
    if (isUsingMockDb()) {
      console.log(`[EventDispatcher] [Mock Mode] Marked dead letter: ${id}`);
      return;
    }

    const pool = getPool();
    await pool.query(
      `UPDATE event_queue_logs SET status = 'DEAD_LETTER', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }
}

export class EventListener {
  private static client: Client | null = null;
  private static handlers: Map<EventType, EventHandler[]> = new Map();

  static getHandlersFor(type: EventType): EventHandler[] {
    return this.handlers.get(type) || [];
  }

  static async initialize() {
    if (isUsingMockDb()) {
      console.log("[EventListener] [Mock Mode] Database is in mock mode. Running using in-memory event loop.");
      return;
    }
    if (this.client) return;

    this.client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    await this.client.connect();

    this.client.on('notification', async (msg) => {
      if (msg.channel === 'tradex_events' && msg.payload) {
        let eventId: string | undefined;
        try {
          const event: EventPayload = JSON.parse(msg.payload);
          eventId = event.id;
          const handlers = this.handlers.get(event.type) || [];

          if (eventId) {
            const pool = getPool();
            const client = await pool.connect();
            try {
              await client.query('BEGIN');
              const lockRes = await client.query(
                `SELECT id FROM event_queue_logs WHERE id = $1 AND status = 'PENDING' FOR UPDATE SKIP LOCKED`,
                [eventId]
              );
              if (lockRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return;
              }
              await client.query(
                `UPDATE event_queue_logs SET status = 'PROCESSING', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [eventId]
              );
              await client.query('COMMIT');
            } catch (err) {
              await client.query('ROLLBACK');
              throw err;
            } finally {
              client.release();
            }
          }

          let allSuccess = true;
          for (const handler of handlers) {
            try {
              await Promise.resolve(handler(event.payload));
            } catch (err) {
              console.error(`Error in event handler for ${event.type}:`, err);
              allSuccess = false;
            }
          }

          if (eventId) {
            const pool = getPool();
            if (allSuccess) {
              await pool.query(
                `UPDATE event_queue_logs SET status = 'PROCESSED', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [eventId]
              );
            } else {
              await pool.query(
                `UPDATE event_queue_logs SET status = 'FAILED', retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [eventId]
              );
            }
          }
        } catch (err) {
          console.error("Failed to parse event notification or process DB update:", err);
        }
      }
    });

    await this.client.query('LISTEN tradex_events');
    console.log("PostgreSQL LISTEN started on 'tradex_events'");
  }

  static subscribe(type: EventType, handler: EventHandler) {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  static unsubscribe(type: EventType, handler: EventHandler) {
    let handlers = this.handlers.get(type);
    if (handlers) {
      handlers = handlers.filter(h => h !== handler);
      this.handlers.set(type, handlers);
    }
  }

  static async shutdown() {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}
