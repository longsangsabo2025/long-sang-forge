/**
 * Fix consultation cho user longsangsabo2025@gmail.com
 * Cập nhật status và tạo subscription bonus
 */

const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function fix() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    const userId = "27e1a7af-6cc3-4e8f-a989-46e993a119c2";
    const consultationId = "b85a38e3-5513-426a-89ce-27801002b47f";
    const email = "longsangsabo2025@gmail.com";

    // 1. Update consultation status
    console.log("📋 Updating consultation status...");
    await client.query(
      `
      UPDATE consultations
      SET status = 'confirmed',
          payment_status = 'confirmed',
          payment_confirmed_at = NOW()
      WHERE id = $1
    `,
      [consultationId]
    );
    console.log("  ✅ Consultation status updated to confirmed\n");

    // 2. Check if subscription exists
    console.log("📋 Checking existing subscription...");
    const subResult = await client.query(
      `
      SELECT * FROM user_subscriptions
      WHERE user_id = $1 AND status = 'active'
    `,
      [userId]
    );

    if (subResult.rows.length > 0) {
      // Extend by 1 month
      console.log("  📦 Found existing subscription, extending...");
      await client.query(
        `
        UPDATE user_subscriptions
        SET expires_at = expires_at + INTERVAL '1 month',
            updated_at = NOW()
        WHERE user_id = $1 AND status = 'active'
      `,
        [userId]
      );
      console.log("  ✅ Extended subscription by 1 month\n");
    } else {
      // Create new Pro subscription
      console.log("  📦 No subscription found, creating Pro...");
      await client.query(
        `
        INSERT INTO user_subscriptions (
          user_id, plan_id, status, starts_at, expires_at,
          payment_status, payment_amount, payment_transaction_id,
          auto_renew, user_email, billing_cycle
        ) VALUES (
          $1, 'pro', 'active', NOW(), NOW() + INTERVAL '1 month',
          'confirmed', 0, 'CONSULTATION_BONUS',
          false, $2, 'monthly'
        )
      `,
        [userId, email]
      );
      console.log("  ✅ Created Pro subscription (1 month bonus)\n");
    }

    // 3. Verify
    console.log("📋 Verification:");
    const consult = await client.query(
      `
      SELECT status, payment_status FROM consultations WHERE id = $1
    `,
      [consultationId]
    );
    console.log("  Consultation:", consult.rows[0]);

    const sub = await client.query(
      `
      SELECT plan_id, status, expires_at FROM user_subscriptions WHERE user_id = $1
    `,
      [userId]
    );
    console.log("  Subscription:", sub.rows[0]);

    console.log("\n🎉 Done! Refresh browser to see updates.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fix();
