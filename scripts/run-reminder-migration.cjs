/**
 * Run reminder_metadata migration using transaction pooler
 */
require("dotenv").config();
const { Client } = require("pg");

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔗 Connecting to database via transaction pooler...");
    await client.connect();
    console.log("✅ Connected!\n");

    // Add reminder_metadata column
    console.log("📦 Adding reminder_metadata column...");
    await client.query(`
      ALTER TABLE consultations
      ADD COLUMN IF NOT EXISTS reminder_metadata JSONB DEFAULT '{}'::jsonb;
    `);
    console.log("✅ reminder_metadata column added!\n");

    // Verify column exists
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'consultations'
      AND column_name = 'reminder_metadata';
    `);

    if (result.rows.length > 0) {
      console.log("✅ Verification passed:");
      console.log("   Column:", result.rows[0].column_name);
      console.log("   Type:", result.rows[0].data_type);
      console.log("   Default:", result.rows[0].column_default);
    } else {
      console.log("❌ Column not found after migration!");
    }

    // Also check meeting_link column
    console.log("\n📦 Checking meeting_link column...");
    const meetingResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'consultations'
      AND column_name = 'meeting_link';
    `);

    if (meetingResult.rows.length > 0) {
      console.log("✅ meeting_link column exists");
    } else {
      console.log("⚠️ meeting_link column missing, adding...");
      await client.query(`
        ALTER TABLE consultations
        ADD COLUMN IF NOT EXISTS meeting_link TEXT;
      `);
      console.log("✅ meeting_link column added!");
    }

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
