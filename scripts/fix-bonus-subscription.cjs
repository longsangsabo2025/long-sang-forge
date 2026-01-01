#!/usr/bin/env node
/**
 * Fix user_id and create bonus subscription for consultations
 */

require("dotenv").config();
const { Client } = require("pg");

async function fixAndGrantBonus() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    const userEmail = "longsang063@gmail.com";
    const userId = "1310b619-51a3-4983-9cd2-918b54b8dd56";

    // 1. Update user_id for all consultations with this email
    const updateResult = await client.query(
      `
      UPDATE consultations
      SET user_id = $1
      WHERE client_email = $2 AND user_id IS NULL
      RETURNING id, client_name
    `,
      [userId, userEmail]
    );

    console.log(`📝 Updated user_id for ${updateResult.rowCount} consultations`);

    // 2. Count paid consultations for this user
    const countResult = await client.query(
      `
      SELECT COUNT(*) as count FROM consultations
      WHERE user_id = $1 AND payment_status = 'confirmed'
    `,
      [userId]
    );

    const paidCount = parseInt(countResult.rows[0].count);
    console.log(`💳 User has ${paidCount} paid consultations`);

    // 3. Grant Pro subscription bonus (1 month per paid consultation, max 3 months)
    const bonusMonths = Math.min(paidCount, 3);

    if (bonusMonths > 0) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + bonusMonths);

      // Check existing subscription
      const existingResult = await client.query(
        `
        SELECT * FROM user_subscriptions
        WHERE user_id = $1 AND status = 'active'
        ORDER BY expires_at DESC LIMIT 1
      `,
        [userId]
      );

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        console.log(
          `\n📦 Existing subscription: ${existing.plan_id} (expires ${existing.expires_at
            .toISOString()
            .slice(0, 10)})`
        );

        // Extend existing subscription
        const newExpiry = new Date(existing.expires_at);
        newExpiry.setMonth(newExpiry.getMonth() + bonusMonths);

        await client.query(
          `
          UPDATE user_subscriptions
          SET expires_at = $1, updated_at = NOW()
          WHERE id = $2
        `,
          [newExpiry.toISOString(), existing.id]
        );

        console.log(
          `🎁 Extended subscription by ${bonusMonths} months → expires ${newExpiry
            .toISOString()
            .slice(0, 10)}`
        );
      } else {
        // Create new Pro subscription
        await client.query(
          `
          INSERT INTO user_subscriptions (
            user_id, plan_id, status, starts_at, expires_at,
            payment_status, payment_amount, payment_transaction_id,
            auto_renew, user_email, user_name, billing_cycle
          ) VALUES (
            $1, 'pro', 'active', NOW(), $2,
            'confirmed', 0, 'CONSULTATION_BONUS',
            false, $3, 'long sang vo', 'monthly'
          )
        `,
          [userId, endDate.toISOString(), userEmail]
        );

        console.log(
          `🎁 Created Pro subscription (${bonusMonths} months bonus) → expires ${endDate
            .toISOString()
            .slice(0, 10)}`
        );
      }
    }

    console.log("\n🎉 Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

fixAndGrantBonus();
