const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const client = new Client({
    connectionString:
      "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    const migrationFile = path.join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "20250201_subscription_enhancement.sql"
    );
    const sql = fs.readFileSync(migrationFile, "utf8");

    console.log("📄 Running migration: 20250201_subscription_enhancement.sql");
    console.log("---");

    await client.query(sql);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    if (error.message.includes("already exists")) {
      console.log("💡 Tables/policies may already exist - this is OK");
    }
  } finally {
    await client.end();
  }
}

runMigration();
