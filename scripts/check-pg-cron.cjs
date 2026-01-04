/**
 * 🔍 ELON CHECK: pg_cron availability
 */
require("dotenv").config();
const { Client } = require("pg");

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Check if pg_cron is installed
    const { rows: installed } = await client.query(
      "SELECT * FROM pg_extension WHERE extname = 'pg_cron'"
    );
    console.log("pg_cron installed:", installed.length > 0 ? "✅ YES" : "❌ NO");

    // Check if pg_cron is available
    const { rows: available } = await client.query(
      "SELECT extname FROM pg_available_extensions WHERE extname = 'pg_cron'"
    );
    console.log("pg_cron available:", available.length > 0 ? "✅ YES" : "❌ NO");

    // Check current expired subscriptions
    const { rows: expired } = await client.query(`
      SELECT COUNT(*) as count FROM user_subscriptions
      WHERE status = 'active' AND expires_at < NOW()
    `);
    console.log("Expired but not marked:", expired[0].count);

    // Check subscriptions expiring soon
    const { rows: expiring } = await client.query(`
      SELECT COUNT(*) as count FROM user_subscriptions
      WHERE status = 'active'
      AND expires_at > NOW()
      AND expires_at < NOW() + INTERVAL '7 days'
    `);
    console.log("Expiring in 7 days:", expiring[0].count);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

check();
