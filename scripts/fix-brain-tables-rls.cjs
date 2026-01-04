/**
 * Check and fix RLS policies for brain tables
 */

require("dotenv").config();
const { Client } = require("pg");

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("Connected\n");

  // Check current policies
  const policies = await client.query(`
    SELECT tablename, policyname, roles, cmd
    FROM pg_policies
    WHERE tablename IN ('brain_domains', 'brain_knowledge')
    ORDER BY tablename, policyname
  `);

  console.log("=== Current Policies ===");
  console.log(JSON.stringify(policies.rows, null, 2));

  // Check if RLS is enabled
  const rlsStatus = await client.query(`
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname IN ('brain_domains', 'brain_knowledge')
  `);

  console.log("\n=== RLS Status ===");
  rlsStatus.rows.forEach((r) => {
    console.log(`${r.relname}: RLS ${r.relrowsecurity ? "ENABLED" : "DISABLED"}`);
  });

  // Add policies for users to access their own data
  console.log("\n=== Adding User Policies ===");

  const sql = `
    -- Ensure RLS is enabled
    ALTER TABLE public.brain_domains ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.brain_knowledge ENABLE ROW LEVEL SECURITY;

    -- brain_domains policies
    DROP POLICY IF EXISTS "Users can view own domains" ON public.brain_domains;
    CREATE POLICY "Users can view own domains" ON public.brain_domains
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own domains" ON public.brain_domains;
    CREATE POLICY "Users can create own domains" ON public.brain_domains
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own domains" ON public.brain_domains;
    CREATE POLICY "Users can update own domains" ON public.brain_domains
      FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own domains" ON public.brain_domains;
    CREATE POLICY "Users can delete own domains" ON public.brain_domains
      FOR DELETE USING (auth.uid() = user_id);

    -- brain_knowledge policies
    DROP POLICY IF EXISTS "Users can view own knowledge" ON public.brain_knowledge;
    CREATE POLICY "Users can view own knowledge" ON public.brain_knowledge
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own knowledge" ON public.brain_knowledge;
    CREATE POLICY "Users can create own knowledge" ON public.brain_knowledge
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own knowledge" ON public.brain_knowledge;
    CREATE POLICY "Users can update own knowledge" ON public.brain_knowledge
      FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own knowledge" ON public.brain_knowledge;
    CREATE POLICY "Users can delete own knowledge" ON public.brain_knowledge
      FOR DELETE USING (auth.uid() = user_id);

    -- Service role full access
    DROP POLICY IF EXISTS "Service role brain_domains" ON public.brain_domains;
    CREATE POLICY "Service role brain_domains" ON public.brain_domains
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role brain_knowledge" ON public.brain_knowledge;
    CREATE POLICY "Service role brain_knowledge" ON public.brain_knowledge
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  `;

  await client.query(sql);
  console.log("✅ Policies added");

  // Verify
  const policiesAfter = await client.query(`
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE tablename IN ('brain_domains', 'brain_knowledge')
    ORDER BY tablename, policyname
  `);

  console.log("\n=== Policies After ===");
  policiesAfter.rows.forEach((p) => console.log(`  ${p.tablename}: ${p.policyname} (${p.cmd})`));

  await client.end();
}

run().catch((e) => console.error("Error:", e.message));
