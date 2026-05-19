import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;

export function getPool() {
  if (!poolInstance) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.warn("DATABASE_URL environment variable is missing. Using in-memory mock DB.");
      const mockPool = {
        query: async (sql: string, params?: any[]) => {
          if (sql.includes("SELECT * FROM portfolios")) {
            return { rows: [{ id: "mock-portfolio-1", user_id: params?.[0] || "dev-mock-user-id", name: "Default Portfolio", description: "Created by memory mock", created_at: new Date(), updated_at: new Date() }] };
          }
          if (sql.includes("INSERT INTO portfolios")) {
            return { rows: [{ id: "mock-portfolio-2", user_id: params?.[0], name: params?.[1], description: params?.[2], created_at: new Date(), updated_at: new Date() }] };
          }
          if (sql.includes("SELECT id FROM users") || sql.includes("SELECT user_id FROM portfolios")) {
            return { rows: [{ id: "dev-mock-user-id", user_id: "dev-mock-user-id" }] };
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
                { id: "pos-1", portfolio_id: params?.[0], asset_id: "BTC", size: "1.5", avg_entry_price: "45000", pnl_realized: "1200", created_at: new Date(), updated_at: new Date() },
                { id: "pos-2", portfolio_id: params?.[0], asset_id: "ETH", size: "10.0", avg_entry_price: "2500", pnl_realized: "300", created_at: new Date(), updated_at: new Date() }
              ]
            };
          }

          if (sql.includes("SELECT price FROM market_ticks")) {
            if (params?.[0] === "BTC") return { rows: [{ price: "66000.00" }] };
            if (params?.[0] === "ETH") return { rows: [{ price: "3500.00" }] };
            return { rows: [{ price: "100.00" }] };
          }

          if (sql.includes("INSERT INTO orders") || sql.includes("UPDATE orders")) {
            return { rows: [{ id: "mock-order-id" }] };
          }

          // default
          return { rows: [] };
        },
        connect: async () => ({
          query: async (sql: string, p?: any[]) => mockPool.query(sql, p),
          release: () => { }
        }),
        on: () => { },
        end: async () => { }
      };

      poolInstance = mockPool as unknown as pg.Pool;
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
    console.warn("DATABASE_URL environment variable is missing. Database connection check skipped.");
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
    console.error("Database connection failed:", error);
    return false;
  }
}

