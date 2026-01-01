/**
 * Fix subscription cho user quytcolicocat@gmail.com
 */

const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function fix() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("🔧 Fixing user quytcolicocat subscription...\n");

    const userId = "1ce14857-919f-4427-b1cd-de9f19edd92e";
    const email = "quytcolicocat@gmail.com";

    // Create Pro subscription (2 months for 2 confirmed consultations)
    await client.query(
      `
      INSERT INTO user_subscriptions (user_id, plan_id, status, starts_at, expires_at, payment_status, payment_amount, payment_transaction_id, auto_renew, user_email, billing_cycle)
      VALUES ($1, 'pro', 'active', NOW(), NOW() + INTERVAL '2 months', 'confirmed', 0, 'CONSULTATION_BONUS', false, $2, 'monthly')
    `,
      [userId, email]
    );

    console.log("✅ Created Pro subscription (2 months bonus for 2 consultations)\n");

    // Verify
    const result = await client.query(
      `SELECT plan_id, status, expires_at FROM user_subscriptions WHERE user_id = $1`,
      [userId]
    );
    console.log("Subscription:", result.rows[0]);

    console.log("\n👉 Refresh browser to see Pro plan!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fix();
