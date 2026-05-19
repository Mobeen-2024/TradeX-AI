import { Client } from "pg";
import { getPool } from "../db/connection";

export enum EventType {
  MARKET_TICK_RECEIVED = "MARKET_TICK_RECEIVED",
  QUANT_ANALYSIS_COMPLETED = "QUANT_ANALYSIS_COMPLETED",
  RISK_VALIDATED = "RISK_VALIDATED",
  NEWS_PROCESSED = "NEWS_PROCESSED"
}

export interface EventPayload {
  type: EventType;
  payload: any;
}

type EventHandler = (payload: any) => void | Promise<void>;

export class EventDispatcher {
  /**
   * Emit an event using PostgreSQL NOTIFY
   */
  static async emit(type: EventType, payload: any) {
    const pool = getPool();
    const eventPayload: EventPayload = { type, payload };
    // Using pg_notify to emit to 'tradex_events' channel
    await pool.query(`SELECT pg_notify('tradex_events', $1)`, [JSON.stringify(eventPayload)]);
  }
}

export class EventListener {
  private static client: Client | null = null;
  private static handlers: Map<EventType, EventHandler[]> = new Map();

  static async initialize() {
    if (this.client) return;

    this.client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    await this.client.connect();

    this.client.on('notification', (msg) => {
      if (msg.channel === 'tradex_events' && msg.payload) {
        try {
          const event: EventPayload = JSON.parse(msg.payload);
          const handlers = this.handlers.get(event.type) || [];
          for (const handler of handlers) {
             Promise.resolve(handler(event.payload)).catch(err => {
                 console.error(`Error in event handler for ${event.type}:`, err);
             });
          }
        } catch (err) {
          console.error("Failed to parse event notification:", err);
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

  static async shutdown() {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}
