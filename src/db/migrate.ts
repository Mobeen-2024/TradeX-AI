import fs from "fs";
import path from "path";
import { getPool } from "./connection";

export async function runMigrations(): Promise<boolean> {
  const pool = getPool();
  
  console.log("[Migration Runner] Starting database migrations...");

  try {
    // 1. Ensure the schema_migrations table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Fetch already applied migrations
    const { rows } = await pool.query("SELECT migration_name FROM schema_migrations");
    const applied = new Set(rows.map((r: any) => r.migration_name));

    // 3. Scan the migrations directory
    const migrationsDir = path.join(__dirname, "migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`[Migration Runner] Migrations directory not found at ${migrationsDir}`);
      return false;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort(); // Natural alphabetical sorting (001_*, 002_*, etc.)

    console.log(`[Migration Runner] Found ${files.length} migration files in directory.`);

    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      console.log(`[Migration Runner] Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        
        // Execute the migration SQL
        // Split by semicolon could be risky if there are semicolons inside strings/blocks,
        // but for simple postgres migrations or full raw sql execution it's usually safer
        // to execute the raw string directly unless it contains multiple commands that must be run separately.
        // Node-postgres can execute multiple queries in a single query string if they are not parameterized!
        try {
          await client.query(sql);
        } catch (queryErr: any) {
          // Special graceful error handling for pgvector on environments without pgvector installed
          if (file === "001_initial_schema.sql" && sql.includes("vector") && queryErr.message.includes("extension \"vector\"")) {
            console.warn(`
[WARNING] The 'vector' extension is not available in your PostgreSQL database.
Semantic memory and vector search features will not work correctly without pgvector.
To enable these, please install pgvector or use a docker image (e.g., pgvector/pgvector:pg16).
Proceeding with basic schema creation...
            `);
            // Run schema without vector columns or skip vector extension line
            const modifiedSql = sql
              .replace("CREATE EXTENSION IF NOT EXISTS vector;", "-- CREATE EXTENSION IF NOT EXISTS vector;")
              .replace("vector_embedding VECTOR(1536),", "-- vector_embedding VECTOR(1536),");
            await client.query(modifiedSql);
          } else if (file === "002_alter_vector_dimensions.sql" && queryErr.message.includes("type \"vector\" does not exist")) {
            console.warn("[WARNING] Skipping '002_alter_vector_dimensions.sql' because vector extension is not active.");
          } else {
            throw queryErr;
          }
        }

        // Record the applied migration
        await client.query(
          "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
          [file]
        );

        await client.query("COMMIT");
        console.log(`[Migration Runner] Successfully applied ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`[Migration Runner] FATAL: Failed to apply migration ${file}:`, err);
        throw err;
      } finally {
        client.release();
      }
    }

    console.log("[Migration Runner] All migrations verified and up to date.");
    return true;
  } catch (error) {
    console.error("[Migration Runner] Migration process failed:", error);
    return false;
  }
}
