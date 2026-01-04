/**
 * Create User AI Preferences Table - Direct PostgreSQL
 * Uses pg library to connect directly to Supabase
 */

const pg = require("pg");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function runMigration() {
  console.log("🚀 Creating user_ai_preferences table via PostgreSQL...\n");

  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL\n");

    // Create table
    console.log("📋 Creating table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_ai_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        industry VARCHAR(100),
        business_goal TEXT,
        budget_range VARCHAR(50),
        preferred_tone VARCHAR(50) DEFAULT 'friendly',
        main_pain_point TEXT,
        ai_name VARCHAR(50) DEFAULT 'Sang',
        custom_greeting TEXT,
        language_style VARCHAR(50) DEFAULT 'vietnamese',
        communication_level VARCHAR(50) DEFAULT 'expert',
        enable_memory BOOLEAN DEFAULT true,
        company_name VARCHAR(200),
        company_description TEXT,
        products_services TEXT,
        target_customers TEXT,
        competitors TEXT,
        unique_selling_points TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);
    console.log("✅ Table created\n");

    // Enable RLS
    console.log("🔒 Enabling RLS...");
    await client.query(`ALTER TABLE public.user_ai_preferences ENABLE ROW LEVEL SECURITY`);
    console.log("✅ RLS enabled\n");

    // Create policies
    console.log("📜 Creating RLS policies...");

    // Drop existing policies first
    await client.query(
      `DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_ai_preferences`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_ai_preferences`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_ai_preferences`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_ai_preferences`
    );
    await client.query(
      `DROP POLICY IF EXISTS "Service role full access" ON public.user_ai_preferences`
    );

    // Create new policies
    await client.query(`
      CREATE POLICY "Users can view own preferences" ON public.user_ai_preferences
      FOR SELECT USING (auth.uid() = user_id)
    `);
    await client.query(`
      CREATE POLICY "Users can insert own preferences" ON public.user_ai_preferences
      FOR INSERT WITH CHECK (auth.uid() = user_id)
    `);
    await client.query(`
      CREATE POLICY "Users can update own preferences" ON public.user_ai_preferences
      FOR UPDATE USING (auth.uid() = user_id)
    `);
    await client.query(`
      CREATE POLICY "Users can delete own preferences" ON public.user_ai_preferences
      FOR DELETE USING (auth.uid() = user_id)
    `);
    await client.query(`
      CREATE POLICY "Service role full access" ON public.user_ai_preferences
      FOR ALL USING (true)
    `);
    console.log("✅ Policies created\n");

    // Create index
    console.log("📊 Creating index...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_user_id
      ON public.user_ai_preferences(user_id)
    `);
    console.log("✅ Index created\n");

    // Verify
    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_ai_preferences'
      ORDER BY ordinal_position
    `);

    console.log("📋 Table columns:");
    rows.forEach((r) => console.log(`   - ${r.column_name}: ${r.data_type}`));

    console.log("\n🎉 Migration complete!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
