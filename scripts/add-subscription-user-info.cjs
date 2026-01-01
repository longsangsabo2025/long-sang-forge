const pg = require("pg");

const client = new pg.Client({
  connectionString:
    "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
});

const alterSQL = `
-- Add user_email and user_name columns to store directly (avoid JOIN issues)
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create index on user_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_email ON user_subscriptions(user_email);
`;

async function runMigration() {
  console.log("🚀 Adding user_email and user_name columns...\n");

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    await client.query(alterSQL);
    console.log("✅ Columns added successfully!\n");

    // Verify
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_subscriptions'
      ORDER BY ordinal_position
    `);

    console.log("📋 user_subscriptions columns:");
    result.rows.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log("\n🎉 Migration completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await client.end();
  }
}

runMigration();
