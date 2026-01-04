/**
 * Run Token Usage Migration
 * Execute via: node scripts/run-token-usage-migration.cjs
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env");
  process.exit(1);
}

const { Client } = require("pg");

const migrationSQL = `
-- Create token_usage table
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(12, 8) NOT NULL DEFAULT 0,
  intent TEXT,
  source TEXT DEFAULT 'website',
  conversation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON public.token_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_model ON public.token_usage(model);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_date ON public.token_usage(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own token usage" ON public.token_usage;
DROP POLICY IF EXISTS "Service role can insert token usage" ON public.token_usage;
DROP POLICY IF EXISTS "Admins can view all token usage" ON public.token_usage;

-- Create policies
CREATE POLICY "Users can view own token usage"
  ON public.token_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert token usage"
  ON public.token_usage FOR INSERT
  WITH CHECK (true);

-- Admin policy using profiles table (more common in Supabase setups)
CREATE POLICY "Admins can view all token usage"
  ON public.token_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
`;

const functionsSQL = `
-- Get user's total usage for a period
CREATE OR REPLACE FUNCTION get_user_token_usage(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_tokens BIGINT,
  total_prompt_tokens BIGINT,
  total_completion_tokens BIGINT,
  total_cost_usd DECIMAL(12, 8),
  request_count BIGINT,
  avg_tokens_per_request DECIMAL(10, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(tu.total_tokens), 0)::BIGINT AS total_tokens,
    COALESCE(SUM(tu.prompt_tokens), 0)::BIGINT AS total_prompt_tokens,
    COALESCE(SUM(tu.completion_tokens), 0)::BIGINT AS total_completion_tokens,
    COALESCE(SUM(tu.cost_usd), 0)::DECIMAL(12, 8) AS total_cost_usd,
    COUNT(*)::BIGINT AS request_count,
    CASE
      WHEN COUNT(*) > 0 THEN (SUM(tu.total_tokens)::DECIMAL / COUNT(*))
      ELSE 0
    END AS avg_tokens_per_request
  FROM public.token_usage tu
  WHERE tu.user_id = p_user_id
    AND tu.created_at >= p_start_date
    AND tu.created_at <= p_end_date;
END;
$$;

-- Get daily usage breakdown for a user
CREATE OR REPLACE FUNCTION get_user_daily_usage(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  usage_date DATE,
  total_tokens BIGINT,
  total_cost_usd DECIMAL(12, 8),
  request_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(tu.created_at) AS usage_date,
    COALESCE(SUM(tu.total_tokens), 0)::BIGINT AS total_tokens,
    COALESCE(SUM(tu.cost_usd), 0)::DECIMAL(12, 8) AS total_cost_usd,
    COUNT(*)::BIGINT AS request_count
  FROM public.token_usage tu
  WHERE tu.user_id = p_user_id
    AND tu.created_at >= (NOW() - (p_days || ' days')::INTERVAL)
  GROUP BY DATE(tu.created_at)
  ORDER BY usage_date DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_token_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_daily_usage TO authenticated;
`;

async function runMigration() {
  console.log("🚀 Running Token Usage Migration...\n");

  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Run table creation
    console.log("\n📦 Creating token_usage table...");
    await client.query(migrationSQL);
    console.log("✅ Table and indexes created");

    // Run functions
    console.log("\n⚙️ Creating functions...");
    await client.query(functionsSQL);
    console.log("✅ Functions created");

    // Verify
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'token_usage'
      ORDER BY ordinal_position
    `);

    console.log("\n📋 Token Usage Table Schema:");
    result.rows.forEach((row) => {
      console.log(`   ${row.column_name}: ${row.data_type}`);
    });

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
