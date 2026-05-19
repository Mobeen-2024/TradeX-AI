import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;

export function getPool() {
  if (!poolInstance) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }

    poolInstance = new Pool({
      connectionString: databaseUrl,
    });
  }
  return poolInstance;
}

export async function checkDbConnection() {
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

