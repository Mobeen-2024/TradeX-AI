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
            return { rows: [{ id: "mock-portfolio-1", user_id: params?.[0], name: "Default Portfolio", description: "Created by memory mock", created_at: new Date(), updated_at: new Date() }] };
          }
          if (sql.includes("INSERT INTO portfolios")) {
            return { rows: [{ id: "mock-portfolio-2", user_id: params?.[0], name: params?.[1], description: params?.[2], created_at: new Date(), updated_at: new Date() }] };
          }
          if (sql.includes("SELECT id FROM users")) {
            return { rows: [{ id: "dev-mock-user-id" }] };
          }
          if (sql.includes("INSERT INTO users")) {
            return { rows: [] };
          }
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

