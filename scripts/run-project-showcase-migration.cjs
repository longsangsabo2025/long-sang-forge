/**
 * Run migration to add new columns to project_showcase
 */
const { Client } = require("pg");

async function runMigration() {
  const client = new Client({
    connectionString:
      "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
  });

  try {
    await client.connect();
    console.log("✓ Connected to database...");

    // Add new columns
    const alterStatements = [
      `ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS video_url TEXT`,
      `ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS github_url TEXT`,
      `ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS my_role TEXT DEFAULT 'Full-stack Developer'`,
      `ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS start_date DATE`,
      `ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS end_date DATE`,
      `ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1`,
      `ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
    ];

    for (const sql of alterStatements) {
      await client.query(sql);
      const colName = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
      console.log(`  ✓ Added column: ${colName}`);
    }

    // Create index
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_project_showcase_is_active ON project_showcase(is_active)`
    );
    console.log(`  ✓ Created index: idx_project_showcase_is_active`);

    // Verify
    const result = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'project_showcase'
      AND column_name IN ('video_url', 'github_url', 'my_role', 'start_date', 'end_date', 'team_size', 'is_active')
      ORDER BY column_name
    `);

    console.log("\n✅ Migration successful!");
    console.log("New columns verified:", result.rows.map((r) => r.column_name).join(", "));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
