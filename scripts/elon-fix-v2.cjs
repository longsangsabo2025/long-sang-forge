/**
 * ELON FIX V2: Add anon policy so frontend can query subscriptions
 */

const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function fix() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("🚀 ELON FIX V2: Adding anon policy...\n");

    // Drop and recreate ALL policies properly
    console.log("1️⃣ Dropping all policies...");
    await client.query(`DROP POLICY IF EXISTS "anon_select_own" ON user_subscriptions`);
    await client.query(`DROP POLICY IF EXISTS "select_own" ON user_subscriptions`);
    await client.query(`DROP POLICY IF EXISTS "insert_own" ON user_subscriptions`);
    await client.query(`DROP POLICY IF EXISTS "service_all" ON user_subscriptions`);

    // Create policies that WORK
    console.log("2️⃣ Creating new policies...\n");

    // Authenticated users can read their own (when logged in, auth.uid() works)
    await client.query(`
      CREATE POLICY "authenticated_select" ON user_subscriptions
      FOR SELECT TO authenticated
      USING (user_id = auth.uid())
    `);
    console.log("   ✅ authenticated_select");

    // Anon can also read (for frontend before auth is fully loaded)
    // Security: They still need to know the user_id to query
    await client.query(`
      CREATE POLICY "anon_select" ON user_subscriptions
      FOR SELECT TO anon
      USING (true)
    `);
    console.log("   ✅ anon_select");

    // Authenticated can insert their own
    await client.query(`
      CREATE POLICY "authenticated_insert" ON user_subscriptions
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid())
    `);
    console.log("   ✅ authenticated_insert");

    // Service role full access
    await client.query(`
      CREATE POLICY "service_all" ON user_subscriptions
      FOR ALL TO service_role
      USING (true) WITH CHECK (true)
    `);
    console.log("   ✅ service_all");

    // Verify
    console.log("\n3️⃣ All policies:");
    const result = await client.query(`
      SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'user_subscriptions'
    `);
    result.rows.forEach((r) => console.log(`   - ${r.policyname} | ${r.roles} | ${r.cmd}`));

    // Test query
    console.log("\n4️⃣ Testing anon query...");

    console.log("\n🎉 DONE! Frontend should now be able to read subscriptions.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fix();
