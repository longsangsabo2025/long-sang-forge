/**
 * 🚀 APPLY CHAT CREDITS UPGRADE VIA SUPABASE MANAGEMENT API
 */

require("dotenv").config();
const { Client } = require("pg");

async function main() {
  console.log("🚀 CHAT CREDITS UPGRADE - Direct Database Connection");
  console.log("=".repeat(50));

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

  console.log("Using connection:", connectionString.replace(/:[^:@]+@/, ":***@"));

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("✅ Connected!\n");

    // Step 1: Add columns
    console.log("📦 Step 1: Adding columns...");
    try {
      await client.query(`
        ALTER TABLE chat_credits
        ADD COLUMN IF NOT EXISTS period_type text DEFAULT 'daily',
        ADD COLUMN IF NOT EXISTS period_start date DEFAULT CURRENT_DATE,
        ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free';
      `);
      console.log("   ✅ Columns added");
    } catch (e) {
      console.log("   ⚠️", e.message);
    }

    // Step 2: Add constraint
    console.log("\n📦 Step 2: Adding constraint...");
    try {
      await client.query(`
        ALTER TABLE chat_credits
        DROP CONSTRAINT IF EXISTS chat_credits_period_type_check;

        ALTER TABLE chat_credits
        ADD CONSTRAINT chat_credits_period_type_check
        CHECK (period_type IN ('daily', 'monthly'));
      `);
      console.log("   ✅ Constraint added");
    } catch (e) {
      console.log("   ⚠️", e.message);
    }

    // Step 3: Create index
    console.log("\n📦 Step 3: Creating index...");
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_chat_credits_period
        ON chat_credits (user_id, period_type, period_start);
      `);
      console.log("   ✅ Index created");
    } catch (e) {
      console.log("   ⚠️", e.message);
    }

    // Step 4: Create get_user_subscription_plan
    console.log("\n📦 Step 4: Creating get_user_subscription_plan...");
    await client.query(`
      CREATE OR REPLACE FUNCTION get_user_subscription_plan(p_user_id uuid)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_plan_id text;
      BEGIN
        SELECT plan_id INTO v_plan_id
        FROM user_subscriptions
        WHERE user_id = p_user_id
          AND status = 'active'
          AND (expires_at IS NULL OR expires_at > now())
        ORDER BY created_at DESC
        LIMIT 1;

        RETURN COALESCE(v_plan_id, 'free');
      END;
      $func$;
    `);
    console.log("   ✅ Function created");

    // Step 5: Create get_credit_config
    console.log("\n📦 Step 5: Creating get_credit_config...");
    await client.query(`
      CREATE OR REPLACE FUNCTION get_credit_config(p_plan text)
      RETURNS jsonb
      LANGUAGE plpgsql
      AS $func$
      BEGIN
        CASE p_plan
          WHEN 'vip' THEN
            RETURN jsonb_build_object('limit', 2000, 'period_type', 'monthly', 'label', '2000/tháng');
          WHEN 'pro' THEN
            RETURN jsonb_build_object('limit', 500, 'period_type', 'monthly', 'label', '500/tháng');
          ELSE
            RETURN jsonb_build_object('limit', 10, 'period_type', 'daily', 'label', '10/ngày');
        END CASE;
      END;
      $func$;
    `);
    console.log("   ✅ Function created");

    // Step 6: Create use_chat_credit
    console.log("\n📦 Step 6: Creating use_chat_credit...");
    await client.query(`
      CREATE OR REPLACE FUNCTION use_chat_credit(p_user_id uuid)
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_plan text;
        v_config jsonb;
        v_period_type text;
        v_credit_limit int;
        v_period_start date;
        v_credits_used int := 0;
      BEGIN
        -- Get user's subscription plan
        v_plan := get_user_subscription_plan(p_user_id);
        v_config := get_credit_config(v_plan);
        v_period_type := v_config->>'period_type';
        v_credit_limit := (v_config->>'limit')::int;

        -- Calculate period start
        IF v_period_type = 'monthly' THEN
          v_period_start := date_trunc('month', CURRENT_DATE)::date;
        ELSE
          v_period_start := CURRENT_DATE;
        END IF;

        -- Ensure record exists for today
        INSERT INTO chat_credits (user_id, date, period_type, period_start, subscription_plan, credits_used, credits_limit)
        VALUES (p_user_id, CURRENT_DATE, v_period_type, v_period_start, v_plan, 0, v_credit_limit)
        ON CONFLICT (user_id, date) DO UPDATE SET
          period_type = EXCLUDED.period_type,
          period_start = EXCLUDED.period_start,
          subscription_plan = EXCLUDED.subscription_plan,
          credits_limit = EXCLUDED.credits_limit,
          updated_at = now();

        -- Get current usage for the period
        IF v_period_type = 'monthly' THEN
          SELECT COALESCE(SUM(credits_used), 0) INTO v_credits_used
          FROM chat_credits
          WHERE user_id = p_user_id
            AND period_type = 'monthly'
            AND period_start = v_period_start;
        ELSE
          SELECT COALESCE(credits_used, 0) INTO v_credits_used
          FROM chat_credits
          WHERE user_id = p_user_id AND date = CURRENT_DATE;
        END IF;

        -- Check if credits available
        IF v_credits_used >= v_credit_limit THEN
          RETURN jsonb_build_object(
            'success', false,
            'credits_used', v_credits_used,
            'credits_limit', v_credit_limit,
            'credits_remaining', 0,
            'plan', v_plan,
            'period_type', v_period_type,
            'label', v_config->>'label',
            'message', CASE
              WHEN v_period_type = 'monthly' THEN 'Bạn đã hết lượt hỏi tháng này!'
              ELSE 'Bạn đã hết lượt hỏi hôm nay. Vui lòng quay lại ngày mai!'
            END
          );
        END IF;

        -- Use 1 credit
        UPDATE chat_credits
        SET credits_used = credits_used + 1, updated_at = now()
        WHERE user_id = p_user_id AND date = CURRENT_DATE;

        -- Return success with updated totals
        IF v_period_type = 'monthly' THEN
          SELECT COALESCE(SUM(credits_used), 0) INTO v_credits_used
          FROM chat_credits
          WHERE user_id = p_user_id
            AND period_type = 'monthly'
            AND period_start = v_period_start;
        ELSE
          SELECT credits_used INTO v_credits_used
          FROM chat_credits
          WHERE user_id = p_user_id AND date = CURRENT_DATE;
        END IF;

        RETURN jsonb_build_object(
          'success', true,
          'credits_used', v_credits_used,
          'credits_limit', v_credit_limit,
          'credits_remaining', v_credit_limit - v_credits_used,
          'plan', v_plan,
          'period_type', v_period_type,
          'label', v_config->>'label',
          'message', 'OK'
        );
      END;
      $func$;
    `);
    console.log("   ✅ Function created");

    // Step 7: Create get_chat_credits
    console.log("\n📦 Step 7: Creating get_chat_credits...");
    await client.query(`
      CREATE OR REPLACE FUNCTION get_chat_credits(p_user_id uuid)
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_plan text;
        v_config jsonb;
        v_period_type text;
        v_credit_limit int;
        v_period_start date;
        v_credits_used int := 0;
      BEGIN
        -- Get user's subscription plan
        v_plan := get_user_subscription_plan(p_user_id);
        v_config := get_credit_config(v_plan);
        v_period_type := v_config->>'period_type';
        v_credit_limit := (v_config->>'limit')::int;

        -- Calculate period start
        IF v_period_type = 'monthly' THEN
          v_period_start := date_trunc('month', CURRENT_DATE)::date;

          -- Sum all credits for this month
          SELECT COALESCE(SUM(credits_used), 0) INTO v_credits_used
          FROM chat_credits
          WHERE user_id = p_user_id
            AND period_type = 'monthly'
            AND period_start = v_period_start;
        ELSE
          -- Get today's usage
          SELECT COALESCE(credits_used, 0) INTO v_credits_used
          FROM chat_credits
          WHERE user_id = p_user_id AND date = CURRENT_DATE;
        END IF;

        RETURN jsonb_build_object(
          'credits_used', v_credits_used,
          'credits_limit', v_credit_limit,
          'credits_remaining', GREATEST(0, v_credit_limit - v_credits_used),
          'plan', v_plan,
          'period_type', v_period_type,
          'label', v_config->>'label'
        );
      END;
      $func$;
    `);
    console.log("   ✅ Function created");

    // Test
    console.log("\n🧪 Testing with paid users...");

    const { rows: paidUsers } = await client.query(`
      SELECT user_id, plan_id FROM user_subscriptions
      WHERE status = 'active' AND plan_id IN ('pro', 'vip')
      LIMIT 3
    `);

    for (const user of paidUsers) {
      const { rows } = await client.query("SELECT get_chat_credits($1) as credits", [user.user_id]);
      const credits = rows[0].credits;
      console.log(
        `   ${user.plan_id.toUpperCase()}: ${credits.credits_remaining}/${credits.credits_limit} (${
          credits.label
        })`
      );
    }

    // Test free user (one without active subscription)
    const { rows: freeTest } = await client.query(`
      SELECT get_chat_credits('00000000-0000-0000-0000-000000000001'::uuid) as credits
    `);
    console.log(
      `   FREE: ${freeTest[0].credits.credits_remaining}/${freeTest[0].credits.credits_limit} (${freeTest[0].credits.label})`
    );

    console.log("\n" + "=".repeat(50));
    console.log("✅ MIGRATION COMPLETE!");
    console.log(`
📊 CREDIT LIMITS BY PLAN:
   FREE: 10 credits/day (reset daily)
   PRO:  500 credits/month (reset monthly)
   VIP:  2000 credits/month (reset monthly)
    `);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
