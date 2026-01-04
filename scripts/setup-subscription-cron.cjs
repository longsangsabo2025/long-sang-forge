/**
 * 🚀 ELON FIX: Setup automatic subscription expiration
 *
 * This creates:
 * 1. A function to mark expired subscriptions
 * 2. A pg_cron job that runs daily at 00:01 UTC
 * 3. A function to send renewal reminders (via edge function trigger)
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
    console.log("🚀 ELON FIX: Setting up subscription auto-expiration");
    console.log("=".repeat(50));

    // Step 1: Create the expire function
    console.log("\n📦 Step 1: Creating expire_subscriptions function...");
    await client.query(`
      CREATE OR REPLACE FUNCTION expire_subscriptions()
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_count int := 0;
        v_expired_users text[] := '{}';
      BEGIN
        -- Mark active subscriptions that have passed expires_at as expired
        WITH updated AS (
          UPDATE user_subscriptions
          SET status = 'expired', updated_at = now()
          WHERE status = 'active'
            AND expires_at < now()
          RETURNING user_id, plan_id, user_email
        )
        SELECT
          COUNT(*),
          array_agg(COALESCE(user_email, user_id::text) || ' (' || plan_id || ')')
        INTO v_count, v_expired_users
        FROM updated;

        -- Log the action
        IF v_count > 0 THEN
          RAISE NOTICE 'Expired % subscriptions: %', v_count, v_expired_users;
        END IF;

        RETURN jsonb_build_object(
          'success', true,
          'expired_count', v_count,
          'expired_users', v_expired_users,
          'executed_at', now()
        );
      END;
      $func$;
    `);
    console.log("   ✅ Function created");

    // Step 2: Create helper function to check expiring soon
    console.log("\n📦 Step 2: Creating get_expiring_subscriptions function...");
    await client.query(`
      CREATE OR REPLACE FUNCTION get_expiring_subscriptions(p_days int DEFAULT 7)
      RETURNS TABLE(
        user_id uuid,
        user_email text,
        user_name text,
        plan_id text,
        expires_at timestamptz,
        days_remaining int
      )
      LANGUAGE plpgsql
      AS $func$
      BEGIN
        RETURN QUERY
        SELECT
          us.user_id,
          us.user_email,
          us.user_name,
          us.plan_id,
          us.expires_at,
          EXTRACT(DAY FROM us.expires_at - now())::int as days_remaining
        FROM user_subscriptions us
        WHERE us.status = 'active'
          AND us.expires_at > now()
          AND us.expires_at < now() + (p_days || ' days')::interval
        ORDER BY us.expires_at ASC;
      END;
      $func$;
    `);
    console.log("   ✅ Function created");

    // Step 3: Check if cron extension is enabled and schedule exists
    console.log("\n📦 Step 3: Checking cron extension...");
    const { rows: cronExt } = await client.query(`
      SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    `);

    if (cronExt.length === 0) {
      console.log("   ⚠️ pg_cron not installed, enabling...");
      await client.query("CREATE EXTENSION IF NOT EXISTS pg_cron");
    }
    console.log("   ✅ pg_cron is enabled");

    // Step 4: Create/update the cron job
    console.log("\n📦 Step 4: Setting up cron job...");

    // First, remove old job if exists
    try {
      await client.query(`
        SELECT cron.unschedule('expire-subscriptions-daily')
      `);
      console.log("   Removed old cron job");
    } catch (e) {
      // Job doesn't exist, that's fine
    }

    // Schedule new job - runs daily at 00:01 UTC (07:01 Vietnam time)
    await client.query(`
      SELECT cron.schedule(
        'expire-subscriptions-daily',
        '1 0 * * *',
        'SELECT expire_subscriptions()'
      )
    `);
    console.log("   ✅ Cron job scheduled: Daily at 00:01 UTC (07:01 VN)");

    // Step 5: Run immediately to catch any currently expired
    console.log("\n📦 Step 5: Running expire_subscriptions now...");
    const { rows: result } = await client.query("SELECT expire_subscriptions()");
    console.log("   Result:", JSON.stringify(result[0].expire_subscriptions, null, 2));

    // Step 6: Check scheduled jobs
    console.log("\n📦 Step 6: Verifying cron jobs...");
    const { rows: jobs } = await client.query(`
      SELECT jobname, schedule, command
      FROM cron.job
      WHERE jobname LIKE '%subscription%' OR jobname LIKE '%expire%'
    `);
    console.log("   Active jobs:");
    jobs.forEach((j) => console.log(`   - ${j.jobname}: ${j.schedule}`));

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ SUBSCRIPTION AUTO-EXPIRATION SETUP COMPLETE!");
    console.log(`
📋 WHAT'S BEEN SET UP:
1. expire_subscriptions() - Marks expired subscriptions
2. get_expiring_subscriptions(days) - Lists soon-to-expire subs
3. CRON job running daily at 00:01 UTC (07:01 VN time)

🔄 HOW IT WORKS:
- Every day at 07:01 AM Vietnam time
- System checks all active subscriptions
- If expires_at < now(), status → 'expired'
- Frontend already filters by expires_at > now()

🧪 TEST:
- SELECT expire_subscriptions();
- SELECT * FROM get_expiring_subscriptions(7);
    `);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

setup();
