import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

async function run() {
  console.log("=== 1. DB Connection Test ===");
  const client = new Client({
    connectionString: "postgres://user:password@localhost:5432/tradex"
  });
  
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");

    // Run migrations
    console.log("=== 2. Running Migrations ===");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    const migrationsDir = path.join(process.cwd(), 'src/db/migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        // Replace vector with TEXT to bypass pgvector requirement locally
        sql = sql.replace(/VECTOR\(\d+\)/gi, 'TEXT');
        sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS vector;/gi, '-- skipped vector extension');
        await client.query(sql);
        console.log(`Applied migration: ${file}`);
      }
    }

    console.log("=== 3. Seeding Data ===");
    // Create dummy operator to mock pgvector during local testing without extension
    await client.query(`
      CREATE OR REPLACE FUNCTION dummy_vector_distance(text, text) RETURNS float8 AS $$ 
      SELECT 0.0::float8; 
      $$ LANGUAGE sql IMMUTABLE;
    `);
    try {
      await client.query(`
        CREATE OPERATOR <=> (
          LEFTARG = text,
          RIGHTARG = text,
          PROCEDURE = dummy_vector_distance
        );
      `);
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        throw e;
      }
    }

    // Delete existing test data if any
    await client.query("DELETE FROM users WHERE email='test@example.com'");

    const userIdRes = await client.query(`
      INSERT INTO users (email, password_hash) 
      VALUES ('test@example.com', 'hash') 
      RETURNING id
    `);
    const userId = userIdRes.rows[0].id;
    console.log(`Seeded user: ${userId}`);

    const portRes = await client.query(`
      INSERT INTO portfolios (user_id, name) 
      VALUES ($1, 'Test Portfolio') 
      RETURNING id
    `, [userId]);
    const portfolioId = portRes.rows[0].id;
    console.log(`Seeded portfolio: ${portfolioId}`);

    const posRes = await client.query(`
      INSERT INTO positions (portfolio_id, asset_id, entry_price, size)
      VALUES ($1, 'BTC-USD', 65000, 1.5)
      RETURNING id
    `, [portfolioId]);
    console.log(`Seeded position: ${posRes.rows[0].id}`);

    const snapRes = await client.query(`
      INSERT INTO market_snapshots (asset_id, price, source, timestamp)
      VALUES ('BTC-USD', 66000, 'binance', NOW())
      RETURNING id
    `);
    console.log(`Seeded snapshot: ${snapRes.rows[0].id}`);
    
    await client.end();

    console.log(`\n=== 4. Running /api/intelligence/run-cycle against real persisted data ===`);
    const token = jwt.sign({ userId }, "your_jwt_secret_here");
    
    const response = await fetch("http://localhost:3000/api/intelligence/run-cycle", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`
       },
       body: JSON.stringify({ portfolioId })
    });

    const json = await response.json();
    console.log(JSON.stringify(json, null, 2));

    console.log("=== 5. Execution Logs ===");
    const logClient = new Client({
      connectionString: "postgres://user:password@localhost:5432/tradex"
    });
    await logClient.connect();
    const logs = await logClient.query("SELECT agent_name, duration_ms, success, error_message FROM execution_logs");
    console.log(JSON.stringify(logs.rows, null, 2));

    console.log("=== 6. Semantic Memory Logs ===");
    const memories = await logClient.query("SELECT market_regime, ai_rationale FROM semantic_memory_logs");
    console.log(JSON.stringify(memories.rows, null, 2));
    
    await logClient.end();

  } catch (err: any) {
    console.error("Test Error:", err);
    process.exit(1);
  }
}

run();
