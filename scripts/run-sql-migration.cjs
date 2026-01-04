/**
 * Run SQL Migration via Transaction Pooler
 * Usage: node scripts/run-sql-migration.cjs <migration-file>
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load env
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;

async function runMigration() {
  const migrationFile = process.argv[2] || "supabase/migrations/20260102_add_chat_credits.sql";

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env");
    process.exit(1);
  }

  console.log("🚀 Connecting to database via transaction pooler...");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected!\n");

    // Read SQL file
    const sqlPath = path.resolve(migrationFile);
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ File not found: ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, "utf-8");
    console.log(`📄 Running: ${migrationFile}\n`);

    // Execute SQL
    await client.query(sql);
    console.log("✅ Migration completed successfully!");

    // Verify table exists
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'chat_credits'
    `);

    if (rows.length > 0) {
      console.log("✅ Table chat_credits created!");
    }

    // Check functions
    const { rows: funcs } = await client.query(`
      SELECT routine_name FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name IN ('use_chat_credit', 'get_chat_credits')
    `);
    console.log(`✅ Functions created: ${funcs.map((f) => f.routine_name).join(", ")}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("already exists")) {
      console.log("ℹ️  Objects may already exist, that's OK!");
    }
  } finally {
    await client.end();
    console.log("\n🔌 Disconnected.");
  }
}

runMigration();
