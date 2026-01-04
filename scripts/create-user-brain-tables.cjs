/**
 * Create User Brain Tables
 * Run: node scripts/create-user-brain-tables.cjs
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://diexsbzqwsbpilsymnfb.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log("🧠 Creating User Brain Tables...\n");

  // Since we can't run raw SQL, we need to use Supabase Dashboard
  // But we can test if tables exist and provide instructions

  const tables = ["user_brain_quotas", "user_brain_imports", "user_brain_chats"];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);

    if (error?.code === "PGRST205") {
      console.log(`❌ Table ${table} does NOT exist`);
    } else if (error) {
      console.log(`⚠️  Table ${table}: ${error.message}`);
    } else {
      console.log(`✅ Table ${table} EXISTS`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 INSTRUCTIONS TO CREATE TABLES:");
  console.log("=".repeat(60));
  console.log(`
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select project: diexsbzqwsbpilsymnfb
3. Go to SQL Editor
4. Copy and paste the following SQL:

--------- COPY FROM HERE ---------

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

-- Policies
DROP POLICY IF EXISTS "Users can read own quotas" ON public.user_brain_quotas;
CREATE POLICY "Users can read own quotas" ON public.user_brain_quotas FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own imports" ON public.user_brain_imports;
CREATE POLICY "Users can read own imports" ON public.user_brain_imports FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create imports" ON public.user_brain_imports;
CREATE POLICY "Users can create imports" ON public.user_brain_imports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own chats" ON public.user_brain_chats;
CREATE POLICY "Users can manage own chats" ON public.user_brain_chats FOR ALL USING (auth.uid() = user_id);

--------- END COPY ---------

5. Click "Run" to execute
6. Re-run this script to verify tables were created

`);
}

createTables().catch(console.error);
