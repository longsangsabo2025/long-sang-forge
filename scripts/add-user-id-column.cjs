#!/usr/bin/env node
/**
 * Add user_id column to consultations table
 */

require("dotenv").config();
const { Client } = require("pg");

// Use the connection string from Supabase dashboard
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-0-us-east-1.pooler.supabase.com:6543/postgres";

async function addUserIdColumn() {
  console.log("🔧 Adding user_id column to consultations...\n");

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Add user_id column
    await client.query(`
      ALTER TABLE consultations
      ADD COLUMN IF NOT EXISTS user_id UUID
    `);
    console.log("✅ Added user_id column");

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_consultations_user_id
      ON consultations(user_id)
    `);
    console.log("✅ Created index");

    console.log("\n🎉 Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

addUserIdColumn();
