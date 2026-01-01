/**
 * Fix RLS policies using direct database connection
 */

const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function fixRLS() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    // Drop existing policies
    console.log("🗑️ Dropping old policies...");
    await client.query(
      `DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Users can create own subscriptions" ON user_subscriptions`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Service role full access to subscriptions" ON user_subscriptions`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans`
    );
    await client.query(
      `DROP POLICY IF EXISTS "authenticated users can view own" ON user_subscriptions`
    );
    await client.query(`DROP POLICY IF EXISTS "Service role full access" ON user_subscriptions`);
    console.log("✅ Old policies dropped\n");

    // Enable RLS
    console.log("🔒 Enabling RLS...");
    await client.query(`ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY`);
    await client.query(`ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY`);
    console.log("✅ RLS enabled\n");

    // Create new policies
    console.log("📝 Creating new policies...");

    await client.query(`
      CREATE POLICY "Anyone can view subscription plans"
      ON subscription_plans FOR SELECT
      USING (is_active = true)
    `);
    console.log("  ✅ Anyone can view subscription plans");

    await client.query(`
      CREATE POLICY "Users can view own subscriptions"
      ON user_subscriptions FOR SELECT
      USING (auth.uid() = user_id)
    `);
    console.log("  ✅ Users can view own subscriptions");

    await client.query(`
      CREATE POLICY "Users can create own subscriptions"
      ON user_subscriptions FOR INSERT
      WITH CHECK (auth.uid() = user_id)
    `);
    console.log("  ✅ Users can create own subscriptions");

    await client.query(`
      CREATE POLICY "Service role full access"
      ON user_subscriptions FOR ALL
      USING (true)
    `);
    console.log("  ✅ Service role full access");

    // Verify
    console.log("\n📋 Current policies:");
    const result = await client.query(`
      SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_subscriptions'
    `);
    result.rows.forEach((row) => {
      console.log(`  - ${row.policyname} (${row.cmd})`);
    });

    console.log("\n🎉 RLS policies fixed successfully!");
    console.log("👉 Refresh your browser to see the subscription update.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fixRLS();
