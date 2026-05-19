import { execSync } from "child_process";
import fs from "fs";
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function runAudit() {
  console.log("=== 1. Package.json scripts ===");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  console.log(JSON.stringify(pkg.scripts, null, 2));

  console.log("\n=== 2. Exact command used to compile ===");
  console.log("npm run build"); 

  console.log("\n=== 3. Exact compile output ===");
  try {
    const buildOut = execSync("npm run build", { encoding: "utf8" });
    console.log(buildOut);
  } catch (e: any) {
    console.log(e.stdout);
    console.log(e.stderr);
  }

  console.log("\n=== 4. Exact command used to start dev server ===");
  console.log("npm run dev");

  console.log("\n=== 5. Output of /health ===");
  try {
    const res = await fetch("http://localhost:3000/health");
    console.log(await res.text());
  } catch (e: any) {
    console.log("Error fetching /health:", e.message);
  }

  console.log("\n=== 6. Output of /health/db ===");
  try {
    const res = await fetch("http://localhost:3000/health/db");
    console.log(await res.text());
  } catch (e: any) {
    console.log("Error fetching /health/db:", e.message);
  }

  console.log("\n=== 7. count(*) from execution_logs ===");
  try {
    const client = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const res = await client.query("SELECT COUNT(*) FROM execution_logs");
    console.log(res.rows[0].count);
    await client.end();
  } catch (e: any) {
    console.log("Error querying db:", e.message);
  }
}

runAudit();
