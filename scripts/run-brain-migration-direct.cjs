/**
 * Run Second Brain Migration via REST API
 * =========================================
 * Creates tables for user's personal Second Brain
 *
 * Run: node scripts/run-brain-migration-direct.cjs
 */

require("dotenv").config();
const https = require("https");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://diexsbzqwsbpilsymnfb.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function execSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    const postData = JSON.stringify({ sql });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Length": Buffer.byteLength(postData),
        Prefer: "return=representation",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            resolve({ error: json });
          } else {
            resolve({ data: json });
          }
        } catch {
          resolve({ data });
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function createExecSqlFunction() {
  console.log("🔧 Creating exec_sql function...");

  // Try via pg_net or direct SQL query
  const sql = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
      RETURN jsonb_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM);
    END;
    $$;
  `;

  // Use the SQL Editor API endpoint (Supabase Dashboard API)
  const url = new URL(`${SUPABASE_URL}/pg/query`);

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("   Response:", res.statusCode, data.substring(0, 100));
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function runMigration() {
  console.log("=".repeat(60));
  console.log("🧠 SECOND BRAIN USER MIGRATION (Direct)");
  console.log("=".repeat(60));

  // Try to create exec_sql first
  await createExecSqlFunction();

  // SQL statements to create tables
  const statements = [
    // 1. user_brain_quotas table
    `CREATE TABLE IF NOT EXISTS public.user_brain_quotas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      documents_count INTEGER DEFAULT 0,
      queries_count INTEGER DEFAULT 0,
      domains_count INTEGER DEFAULT 0,
      month_year TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM'),
      max_documents INTEGER DEFAULT 50,
      max_queries_per_month INTEGER DEFAULT 100,
      max_domains INTEGER DEFAULT 3,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_query_at TIMESTAMPTZ,
      UNIQUE(user_id, month_year)
    )`,

    // 2. user_brain_imports table
    `CREATE TABLE IF NOT EXISTS public.user_brain_imports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      domain_id UUID,
      source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'url', 'pdf', 'text')),
      source_url TEXT,
      source_title TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      progress INTEGER DEFAULT 0,
      error_message TEXT,
      documents_created INTEGER DEFAULT 0,
      chunks_generated INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ
    )`,

    // 3. user_brain_chats table
    `CREATE TABLE IF NOT EXISTS public.user_brain_chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      domain_id UUID,
      session_id TEXT NOT NULL,
      title TEXT DEFAULT 'New Chat',
      messages JSONB DEFAULT '[]'::jsonb,
      knowledge_ids UUID[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_message_at TIMESTAMPTZ
    )`,

    // 4. Enable RLS
    `ALTER TABLE public.user_brain_quotas ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.user_brain_imports ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.user_brain_chats ENABLE ROW LEVEL SECURITY`,

    // 5. RLS Policies for user_brain_quotas
    `CREATE POLICY IF NOT EXISTS "Users can read own quotas" ON public.user_brain_quotas FOR SELECT USING (auth.uid() = user_id)`,
    `CREATE POLICY IF NOT EXISTS "Service role can manage quotas" ON public.user_brain_quotas FOR ALL USING (auth.role() = 'service_role')`,

    // 6. RLS Policies for user_brain_imports
    `CREATE POLICY IF NOT EXISTS "Users can read own imports" ON public.user_brain_imports FOR SELECT USING (auth.uid() = user_id)`,
    `CREATE POLICY IF NOT EXISTS "Users can create imports" ON public.user_brain_imports FOR INSERT WITH CHECK (auth.uid() = user_id)`,
    `CREATE POLICY IF NOT EXISTS "Service role can manage imports" ON public.user_brain_imports FOR ALL USING (auth.role() = 'service_role')`,

    // 7. RLS Policies for user_brain_chats
    `CREATE POLICY IF NOT EXISTS "Users can manage own chats" ON public.user_brain_chats FOR ALL USING (auth.uid() = user_id)`,
  ];

  console.log("\n📝 Executing", statements.length, "statements...\n");

  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    const preview = sql.substring(0, 60).replace(/\n/g, " ");

    const result = await execSQL(sql);

    if (result.error) {
      console.log(`❌ [${i + 1}] ${preview}...`);
      console.log(`   Error: ${JSON.stringify(result.error).substring(0, 80)}`);
    } else {
      console.log(`✅ [${i + 1}] ${preview}...`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Migration attempt complete!");
  console.log("   Check Supabase Dashboard for verification");
  console.log("=".repeat(60));
}

runMigration().catch(console.error);
