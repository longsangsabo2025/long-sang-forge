/**
 * Run SQL migrations directly using pg
 * Uses transaction pooler from .env
 */
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function runSQL(sql, description) {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log(`\n🔧 ${description}...`);
    await client.query(sql);
    console.log(`✅ Done!`);
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("🚀 Running Database Fixes...\n");
  console.log("=".repeat(50));

  // 1. Fix token_usage RLS
  const fixTokenUsageRLS = `
    -- Drop existing restrictive policies
    DROP POLICY IF EXISTS "Service role can insert token usage" ON token_usage;
    DROP POLICY IF EXISTS "Users can view own token usage" ON token_usage;
    DROP POLICY IF EXISTS "Admins can view all token usage" ON token_usage;

    -- Create permissive policies
    CREATE POLICY "Allow all inserts" ON token_usage FOR INSERT WITH CHECK (true);
    CREATE POLICY "Users can view own" ON token_usage FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Service role full access" ON token_usage FOR ALL TO service_role USING (true);
  `;

  await runSQL(fixTokenUsageRLS, "Fixing token_usage RLS policies");

  // 2. Check current token_usage records
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("\n📊 Checking token_usage table...");
  const { rows } = await client.query("SELECT COUNT(*) as count FROM token_usage");
  console.log(`   Current records: ${rows[0].count}`);

  // 3. Test insert
  console.log("\n📝 Testing insert...");
  try {
    await client.query(`
      INSERT INTO token_usage (user_id, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, intent, source)
      VALUES ('27e1a7af-6cc3-4e8f-a989-46e993a119c2', 'gpt-4o-mini', 150, 50, 200, 0.0001, 'db-test', 'migration-script')
    `);
    console.log("✅ Insert successful!");
  } catch (err) {
    console.error(`❌ Insert failed: ${err.message}`);
  }

  // 4. Verify
  const { rows: verify } = await client.query(`
    SELECT id, model, total_tokens, intent, source, created_at
    FROM token_usage
    ORDER BY created_at DESC
    LIMIT 3
  `);
  console.log("\n📋 Latest records:");
  verify.forEach((r) => {
    console.log(`   - ${r.source}: ${r.total_tokens} tokens (${r.intent})`);
  });

  await client.end();

  console.log("\n" + "=".repeat(50));
  console.log("✅ Database fixes complete!");
}

main().catch(console.error);
