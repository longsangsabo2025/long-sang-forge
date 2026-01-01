/**
 * Enable Realtime for user_subscriptions table
 * Run: node scripts/enable-realtime-subscriptions.cjs
 */

const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase");

    // Enable realtime for user_subscriptions table
    console.log("\n📡 Enabling Realtime for user_subscriptions...");

    // Check if already enabled
    const check = await client.query(`
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND tablename = 'user_subscriptions'
    `);

    if (check.rows.length > 0) {
      console.log("✅ Realtime already enabled for user_subscriptions");
    } else {
      await client.query(`
        ALTER PUBLICATION supabase_realtime
        ADD TABLE user_subscriptions;
      `);
      console.log("✅ Realtime enabled for user_subscriptions");
    }

    console.log("\n🎉 Done! Real-time updates will work for subscriptions.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main();
