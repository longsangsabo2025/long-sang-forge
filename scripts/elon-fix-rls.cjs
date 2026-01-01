/**
 * ELON FIX: Đơn giản nhất - cho phép tất cả authenticated users đọc subscriptions của mình
 * Thay vì RLS phức tạp, dùng policy đơn giản hơn
 */

const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function elonFix() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("🚀 ELON FIX: Simplifying RLS...\n");

    // Option 1: Drop all policies and create ONE simple policy
    console.log("1️⃣ Dropping all existing policies...");
    await client.query(
      `DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Users can create own subscriptions" ON user_subscriptions`
    );
    await client.query(`DROP POLICY IF EXISTS "Service role full access" ON user_subscriptions`);
    await client.query(
      `DROP POLICY IF EXISTS "Service role full access to subscriptions" ON user_subscriptions`
    );
    await client.query(
      `DROP POLICY IF EXISTS "authenticated users can view own" ON user_subscriptions`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Enable read for authenticated users" ON user_subscriptions`
    );
    console.log("   ✅ Done\n");

    // Option 2: Create simple policies that ACTUALLY work
    console.log("2️⃣ Creating simple working policies...");

    // SELECT: Any authenticated user can read rows where user_id matches their auth.uid()
    await client.query(`
      CREATE POLICY "select_own" ON user_subscriptions
      FOR SELECT TO authenticated
      USING (user_id = auth.uid())
    `);
    console.log("   ✅ SELECT policy created\n");

    // INSERT: Users can insert their own
    await client.query(`
      CREATE POLICY "insert_own" ON user_subscriptions
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid())
    `);
    console.log("   ✅ INSERT policy created\n");

    // ALL for service_role (webhooks, admin)
    await client.query(`
      CREATE POLICY "service_all" ON user_subscriptions
      FOR ALL TO service_role
      USING (true) WITH CHECK (true)
    `);
    console.log("   ✅ SERVICE_ROLE policy created\n");

    // Verify
    console.log("3️⃣ Verifying policies:");
    const result = await client.query(`
      SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'user_subscriptions'
    `);
    result.rows.forEach((row) => {
      console.log(`   - ${row.policyname} | ${row.roles} | ${row.cmd}`);
    });

    console.log("\n🎉 DONE! RLS is now simple and working.");
    console.log("👉 User logs in → auth.uid() = user_id → can see their subscription");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

elonFix();
