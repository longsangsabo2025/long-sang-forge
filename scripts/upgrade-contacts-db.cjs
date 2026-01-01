/**
 * Upgrade contacts table with CRM columns
 */
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function upgradeContacts() {
  const client = await pool.connect();
  try {
    console.log("🔧 Adding columns to contacts table...");

    await client.query(`
      ALTER TABLE public.contacts
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS budget VARCHAR(50),
      ADD COLUMN IF NOT EXISTS source VARCHAR(100),
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS followed_up_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE
    `);

    console.log("✅ Columns added successfully!");

    // Drop restrictive CHECK constraints that block form submission
    console.log("🔧 Dropping restrictive CHECK constraints...");
    await client.query(
      `ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_source_check`
    );
    await client.query(
      `ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_budget_check`
    );
    await client.query(
      `ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_status_check`
    );
    console.log("✅ Constraints dropped!");

    // Check current columns
    const result = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'contacts' ORDER BY ordinal_position
    `);

    console.log("\n📋 Current contacts columns:");
    result.rows.forEach((r) => console.log(`  - ${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

upgradeContacts();
