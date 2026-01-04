/**
 * 🚀 ELON FIX: Setup renewal reminders cron
 *
 * This adds a cron job to call subscription-automation edge function daily
 * to send renewal reminder emails (7 days before expiry)
 */
require("dotenv").config();
const { Client } = require("pg");

async function setup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("🚀 SETTING UP RENEWAL REMINDERS CRON");
    console.log("=".repeat(50));

    // Create function to call edge function via http
    console.log("\n📦 Creating send_renewal_reminders function...");
    await client.query(`
      CREATE OR REPLACE FUNCTION send_renewal_reminders()
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_result jsonb;
        v_expiring_count int;
      BEGIN
        -- Count expiring subscriptions (7 days)
        SELECT COUNT(*) INTO v_expiring_count
        FROM user_subscriptions
        WHERE status = 'active'
          AND expires_at > NOW()
          AND expires_at < NOW() + INTERVAL '8 days'
          AND expires_at > NOW() + INTERVAL '6 days';

        -- Log
        RAISE NOTICE 'Found % subscriptions expiring in 7 days', v_expiring_count;

        -- Note: The actual email sending is done by calling the Edge Function
        -- via external scheduler (Supabase cron doesn't support HTTP calls directly)
        -- So we just return the count for monitoring

        RETURN jsonb_build_object(
          'expiring_in_7_days', v_expiring_count,
          'checked_at', NOW(),
          'note', 'Email sending requires Edge Function call from external scheduler'
        );
      END;
      $func$;
    `);
    console.log("   ✅ Function created");

    // Check current cron jobs
    console.log("\n📋 Current cron jobs:");
    const { rows: jobs } = await client.query(`
      SELECT jobname, schedule, command FROM cron.job ORDER BY jobname
    `);
    jobs.forEach((j) => console.log(`   - ${j.jobname}: ${j.schedule}`));

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📋 SUBSCRIPTION AUTOMATION STATUS:");
    console.log(`
✅ COMPLETED:
1. expire_subscriptions() - Auto-expire khi hết hạn
2. expire-subscriptions-daily cron - Chạy 07:01 VN hàng ngày
3. get_expiring_subscriptions() - Query subs sắp hết hạn
4. Chat credits per plan - FREE/PRO/VIP

⚠️ EMAIL REMINDERS:
- subscription-automation Edge Function đã có logic gửi email
- Nhưng cần external scheduler (Vercel cron, GitHub Actions, etc.)
- hoặc call thủ công: npx supabase functions invoke subscription-automation

🔧 TO ENABLE AUTO EMAILS:
Option 1: Vercel Cron (nếu deploy trên Vercel)
Option 2: GitHub Actions scheduled workflow
Option 3: Manual daily call

📧 EMAIL FLOW (trong subscription-automation):
- 7 ngày trước: Gửi renewal reminder
- Khi hết hạn: Admin notification
- 30 ngày sau đăng ký: Thank you email
    `);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

setup();
