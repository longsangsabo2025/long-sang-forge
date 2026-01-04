/**
 * Fix RLS policies for User Brain tables
 */

require("dotenv").config();
const { Client } = require("pg");

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("Connected to PostgreSQL");

  // Check current policies
  const policies = await client.query(`
    SELECT tablename, policyname, roles, cmd, qual
    FROM pg_policies
    WHERE tablename LIKE 'user_brain%'
  `);
  console.log("Current policies:", JSON.stringify(policies.rows, null, 2));

  // The issue is that service_role bypasses RLS by default in Supabase
  // But we need to ensure authenticated users can also access their data
  // Let's disable RLS temporarily for testing, or add proper policies

  const sql = `
    -- For service_role to work, we can either:
    -- 1. Disable RLS (not recommended for production)
    -- 2. Or ensure service_role has BYPASSRLS (default in Supabase)

    -- Let's add an INSERT policy for authenticated users on quotas
    DROP POLICY IF EXISTS "Users can insert own quotas" ON public.user_brain_quotas;
    CREATE POLICY "Users can insert own quotas" ON public.user_brain_quotas
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Also add UPDATE policy
    DROP POLICY IF EXISTS "Users can update own quotas" ON public.user_brain_quotas;
    CREATE POLICY "Users can update own quotas" ON public.user_brain_quotas
      FOR UPDATE USING (auth.uid() = user_id);

    -- For imports - also add update policy
    DROP POLICY IF EXISTS "Users can update own imports" ON public.user_brain_imports;
    CREATE POLICY "Users can update own imports" ON public.user_brain_imports
      FOR UPDATE USING (auth.uid() = user_id);
  `;

  await client.query(sql);
  console.log("✅ Policies updated");

  // Check again
  const policiesAfter = await client.query(`
    SELECT tablename, policyname, roles, cmd
    FROM pg_policies
    WHERE tablename LIKE 'user_brain%'
    ORDER BY tablename, policyname
  `);
  console.log("Policies after:", JSON.stringify(policiesAfter.rows, null, 2));

  await client.end();
}

fix().catch((e) => console.error("❌", e.message));
