/**
 * Run User Brain Migration via PostgreSQL Transaction Pooler
 * Run: node scripts/run-user-brain-migration-pg.cjs
 */

require("dotenv").config();
const { Client } = require("pg");

const sql = `
-- 1. User Brain Quotas
CREATE TABLE IF NOT EXISTS public.user_brain_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- 2. User Brain Imports
CREATE TABLE IF NOT EXISTS public.user_brain_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.brain_domains(id) ON DELETE SET NULL,
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
);

-- 3. User Brain Chats
CREATE TABLE IF NOT EXISTS public.user_brain_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.brain_domains(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  title TEXT DEFAULT 'New Chat',
  messages JSONB DEFAULT '[]'::jsonb,
  knowledge_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_brain_quotas_user_id ON public.user_brain_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brain_imports_user_id ON public.user_brain_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brain_chats_user_id ON public.user_brain_chats(user_id);

-- RLS
ALTER TABLE public.user_brain_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brain_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brain_chats ENABLE ROW LEVEL SECURITY;

-- Policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own quotas" ON public.user_brain_quotas;
CREATE POLICY "Users can read own quotas" ON public.user_brain_quotas FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own imports" ON public.user_brain_imports;
CREATE POLICY "Users can read own imports" ON public.user_brain_imports FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create imports" ON public.user_brain_imports;
CREATE POLICY "Users can create imports" ON public.user_brain_imports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own chats" ON public.user_brain_chats;
CREATE POLICY "Users can manage own chats" ON public.user_brain_chats FOR ALL USING (auth.uid() = user_id);
`;

async function runMigration() {
  console.log("🧠 Running User Brain Migration via PostgreSQL...\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL not found in .env");
    process.exit(1);
  }

  console.log("📡 Connecting to:", connectionString.replace(/:[^:@]+@/, ":****@"));

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL\n");

    console.log("🔄 Executing migration SQL...");
    await client.query(sql);
    console.log("✅ Migration completed!\n");

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user_brain_quotas', 'user_brain_imports', 'user_brain_chats')
      ORDER BY table_name
    `);

    console.log("📋 Created tables:");
    result.rows.forEach((row) => {
      console.log(`   ✅ ${row.table_name}`);
    });

    if (result.rows.length === 3) {
      console.log("\n🎉 All 3 tables created successfully!");
    } else {
      console.log(`\n⚠️  Only ${result.rows.length}/3 tables found`);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.detail) console.error("   Detail:", error.detail);
  } finally {
    await client.end();
    console.log("\n📡 Connection closed");
  }
}

runMigration();
