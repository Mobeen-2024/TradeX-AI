import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let usingMockDb = false;

export function isUsingMockDb(): boolean {
  return usingMockDb;
}

function createMockPool(): pg.Pool {
  usingMockDb = true;
  const mockPool = {
    query: async (sql: string, params?: any[]) => {
      if (sql.includes("SELECT * FROM portfolios")) {
        let userId = "dev-mock-user-id";
        if (sql.includes("WHERE user_id =")) {
          userId = params?.[0] || userId;
        }
        return {
          rows: [
            {
              id: "mock-portfolio-1",
              user_id: userId,
              name: "Default Portfolio",
              description: "Created by memory mock",
              created_at: new Date(),
              updated_at: new Date(),
              is_trading_enabled: false,
              max_position_size: 0,
              max_loss: 0,
              execution_mode: "AUTO",
            },
          ],
        };
      }
      if (sql.includes("UPDATE portfolios")) {
        if (sql.includes("SET execution_mode =")) {
          return {
            rows: [
              {
                id: params?.[1],
                user_id: "dev-mock-user-id",
                execution_mode: params?.[0],
                name: "Default Portfolio",
                description: "Created by memory mock",
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          };
        }
        return {
          rows: [
            {
              id: params?.[3],
              user_id: "dev-mock-user-id",
              is_trading_enabled: params?.[0],
              max_position_size: params?.[1],
              max_loss: params?.[2],
              execution_mode: "AUTO",
              name: "Default Portfolio",
              description: "Created by memory mock",
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        };
      }
      if (sql.includes("INSERT INTO portfolios")) {
        return {
          rows: [
            {
              id: "mock-portfolio-2",
              user_id: params?.[0],
              name: params?.[1],
              description: params?.[2],
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        };
      }
      if (
        sql.includes("SELECT id FROM users") ||
        sql.includes("SELECT user_id FROM portfolios")
      ) {
        return {
          rows: [{ id: "dev-mock-user-id", user_id: "dev-mock-user-id" }],
        };
      }
      if (sql.includes("INSERT INTO users")) {
        return { rows: [] };
      }

      if (sql.includes("SELECT cash_balance FROM balances")) {
        return { rows: [{ cash_balance: "150000.00" }] };
      }

      if (sql.includes("SELECT * FROM positions")) {
        return {
          rows: [
            {
              id: "pos-1",
              portfolio_id: params?.[0],
              asset_id: "XAUUSD",
              size: "25.0",
              avg_entry_price: "2485.00",
              pnl_realized: "2150",
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        };
      }

      if (sql.includes("SELECT COUNT(*) FROM trades")) {
        return { rows: [{ count: "0" }] };
      }

      if (sql.includes("SELECT price FROM market_ticks")) {
        if (
          params?.[0] === "XAUUSD" ||
          params?.[0] === "BTC" ||
          params?.[0] === "ETH"
        )
          return { rows: [{ price: "2560.50" }] };
        return { rows: [{ price: "2560.50" }] };
      }

      if (sql.includes("INSERT INTO orders") || sql.includes("UPDATE orders")) {
        return { rows: [{ id: "mock-order-id" }] };
      }

      if (
        sql.includes("INSERT INTO decision_overrides") ||
        sql.includes("UPDATE decision_overrides")
      ) {
        return { rows: [{ id: "mock-override-id" }] };
      }

      if (sql.includes("SELECT * FROM decision_overrides")) {
        return { rows: [] };
      }

      if (
        sql.includes("INSERT INTO event_queue_logs") ||
        sql.includes("UPDATE event_queue_logs")
      ) {
        return {
          rows: [
            { id: "mock-event-id-" + Math.random().toString(36).substr(2, 9) },
          ],
        };
      }

      if (sql.includes("INSERT INTO agent_decisions")) {
        return { rows: [{ id: "mock-decision-id" }] };
      }

      // default
      return { rows: [] };
    },
    connect: async () => ({
      query: async (sql: string, p?: any[]) => mockPool.query(sql, p),
      release: () => {},
    }),
    on: () => {},
    end: async () => {},
  };

  return mockPool as unknown as pg.Pool;
}

export function getPool() {
  if (!poolInstance) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.warn(
        "DATABASE_URL environment variable is missing. Using in-memory mock DB.",
      );
      poolInstance = createMockPool();
      return poolInstance;
    }

    poolInstance = new Pool({
      connectionString: databaseUrl,
    });
  }
  return poolInstance;
}

export async function checkDbConnection() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL environment variable is missing. Database connection check skipped.",
    );
    return false;
  }
  try {
    const pool = getPool();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT 1 AS connected");
      return result.rows[0].connected === 1;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "Database connection failed. Falling back to in-memory mock DB.",
      error,
    );
    // Gracefully clean up the failed pool
    if (poolInstance && typeof poolInstance.end === "function") {
      poolInstance.end().catch(() => {});
    }
    // Switch to mock DB
    poolInstance = createMockPool();
    return false;
  }
}
