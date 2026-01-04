/**
 * Check subscription status
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
    console.log("📊 SUBSCRIPTION STATUS CHECK\n");

    // Check expiring in 30 days
    const { rows: expiring } = await client.query("SELECT * FROM get_expiring_subscriptions(30)");
    console.log("⏰ Expiring in 30 days:", expiring.length);
    if (expiring.length > 0) {
      expiring.forEach((s) =>
        console.log("   -", s.user_email || s.user_id, ":", s.days_remaining, "days left")
      );
    }

    // Check all active
    const { rows: active } = await client.query(`
      SELECT plan_id, COUNT(*) as count
      FROM user_subscriptions
      WHERE status = 'active'
      GROUP BY plan_id
    `);
    console.log("\n✅ Active subscriptions:");
    active.forEach((r) =>
      console.log("   -", (r.plan_id || "UNKNOWN").toUpperCase(), ":", r.count)
    );

    // Check expired
    const { rows: expired } = await client.query(`
      SELECT COUNT(*) as count FROM user_subscriptions WHERE status = 'expired'
    `);
    console.log("\n⛔ Expired subscriptions:", expired[0].count);

    // Check cron job
    const { rows: jobs } = await client.query(`
      SELECT jobname, schedule, active FROM cron.job
    `);
    console.log("\n🕐 Cron jobs:");
    jobs.forEach((j) => console.log("   -", j.jobname, ":", j.schedule, j.active ? "✅" : "❌"));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

check();
