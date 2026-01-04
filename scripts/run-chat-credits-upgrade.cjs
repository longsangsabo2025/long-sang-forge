/**
 * 🚀 CHAT CREDITS UPGRADE MIGRATION
 * Upgrade chat credits system to support per-plan limits:
 * - Free: 10 credits/day (reset daily)
 * - Pro: 500 credits/month (reset monthly)
 * - VIP: 2000 credits/month (reset monthly)
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://diexsbzqwsbpilsymnfb.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY"
);

async function runMigration() {
  console.log("🚀 CHAT CREDITS UPGRADE MIGRATION");
  console.log("=".repeat(50));

  // Step 1: Add columns
  console.log("\n📦 Step 1: Adding new columns...");
  const addColumnsSQL = `
    ALTER TABLE chat_credits
    ADD COLUMN IF NOT EXISTS period_type text DEFAULT 'daily' CHECK (period_type IN ('daily', 'monthly')),
    ADD COLUMN IF NOT EXISTS period_start date DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free';
  `;

  const { error: colError } = await supabase.rpc("exec_sql", { query: addColumnsSQL });
  if (colError && !colError.message.includes("already exists")) {
    console.log("   ⚠️ Columns might already exist:", colError.message);
  } else {
    console.log("   ✅ Columns added");
  }

  // Step 2: Create index
  console.log("\n📦 Step 2: Creating index...");
  const indexSQL = `
    CREATE INDEX IF NOT EXISTS idx_chat_credits_period
    ON chat_credits (user_id, period_type, period_start);
  `;

  const { error: idxError } = await supabase.rpc("exec_sql", { query: indexSQL });
  if (idxError && !idxError.message.includes("already exists")) {
    console.log("   ⚠️ Index:", idxError.message);
  } else {
    console.log("   ✅ Index created");
  }

  // Step 3: Create get_user_subscription_plan function
  console.log("\n📦 Step 3: Creating get_user_subscription_plan...");
  const planFuncSQL = `
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
  `;

  const { error: planErr } = await supabase.rpc("exec_sql", { query: planFuncSQL });
  console.log(planErr ? `   ⚠️ ${planErr.message}` : "   ✅ Function created");

  // Step 4: Create get_credit_config function
  console.log("\n📦 Step 4: Creating get_credit_config...");
  const configFuncSQL = `
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
  `;

  const { error: configErr } = await supabase.rpc("exec_sql", { query: configFuncSQL });
  console.log(configErr ? `   ⚠️ ${configErr.message}` : "   ✅ Function created");

  // Step 5: Create upgraded use_chat_credit function
  console.log("\n📦 Step 5: Creating upgraded use_chat_credit...");
  const useCreditSQL = `
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
  `;

  const { error: useErr } = await supabase.rpc("exec_sql", { query: useCreditSQL });
  console.log(useErr ? `   ⚠️ ${useErr.message}` : "   ✅ Function created");

  // Step 6: Create upgraded get_chat_credits function
  console.log("\n📦 Step 6: Creating upgraded get_chat_credits...");
  const getCreditSQL = `
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
  `;

  const { error: getErr } = await supabase.rpc("exec_sql", { query: getCreditSQL });
  console.log(getErr ? `   ⚠️ ${getErr.message}` : "   ✅ Function created");

  // Step 7: Test with a paid user
  console.log("\n🧪 Step 7: Testing with paid users...");

  // Get a paid user
  const { data: paidUsers } = await supabase
    .from("user_subscriptions")
    .select("user_id, plan_id, status")
    .eq("status", "active")
    .in("plan_id", ["pro", "vip"])
    .limit(3);

  if (paidUsers && paidUsers.length > 0) {
    console.log(`   Found ${paidUsers.length} paid users:`);
    for (const user of paidUsers) {
      // Test get_chat_credits
      const { data: credits } = await supabase.rpc("get_chat_credits", { p_user_id: user.user_id });
      console.log(
        `   - ${user.plan_id.toUpperCase()}: ${credits?.credits_remaining}/${
          credits?.credits_limit
        } remaining (${credits?.label})`
      );
    }
  } else {
    console.log("   No paid users found in database");
  }

  // Also test a free user
  const { data: freeCredits } = await supabase.rpc("get_chat_credits", {
    p_user_id: "27e1a7af-6cc3-4e8f-a989-46e993a119c2",
  });
  console.log(
    `   - FREE: ${freeCredits?.credits_remaining}/${freeCredits?.credits_limit} remaining (${freeCredits?.label})`
  );

  console.log("\n" + "=".repeat(50));
  console.log("✅ MIGRATION COMPLETE!");
  console.log(`
📊 CREDIT LIMITS BY PLAN:
   FREE: 10 credits/day (reset daily)
   PRO:  500 credits/month (reset monthly)
   VIP:  2000 credits/month (reset monthly)
  `);
}

runMigration().catch(console.error);
