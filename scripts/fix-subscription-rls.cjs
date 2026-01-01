/**
 * Fix RLS policies for user_subscriptions table
 * Ensures users can read their own subscriptions
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://diexsbzqwsbpilsymnfb.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function fixRLS() {
  console.log("🔧 Fixing RLS policies for user_subscriptions...\n");

  try {
    // Drop and recreate RLS policies
    const sqlCommands = [
      // Drop existing policies
      `DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions`,
      `DROP POLICY IF EXISTS "Users can create own subscriptions" ON user_subscriptions`,
      `DROP POLICY IF EXISTS "Service role full access to subscriptions" ON user_subscriptions`,
      `DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans`,

      // Enable RLS
      `ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY`,

      // Recreate policies
      `CREATE POLICY "Anyone can view subscription plans" ON subscription_plans FOR SELECT USING (is_active = true)`,
      `CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Service role full access to subscriptions" ON user_subscriptions FOR ALL USING (true)`,
    ];

    for (const sql of sqlCommands) {
      console.log(`Running: ${sql.substring(0, 60)}...`);
      const { error } = await supabase.rpc("exec_sql", { query: sql });
      if (error) {
        console.log(`  ⚠️ Warning: ${error.message}`);
      } else {
        console.log(`  ✅ Success`);
      }
    }

    console.log("\n✅ RLS policies updated!");

    // Test query
    console.log("\n📋 Testing query...");
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*, plan:subscription_plans(*)")
      .eq("user_id", "1310b619-51a3-4983-9cd2-918b54b8dd56")
      .eq("status", "active")
      .limit(1);

    if (error) {
      console.log("❌ Query error:", error.message);
    } else {
      console.log("✅ Query result:", data?.length, "subscription(s)");
      if (data?.[0]) {
        console.log("   Plan:", data[0].plan?.name_vi || data[0].plan_id);
        console.log("   Status:", data[0].status);
        console.log("   Expires:", data[0].expires_at);
      }
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

fixRLS();
