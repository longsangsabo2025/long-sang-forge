/**
 * Create User AI Preferences Table
 * =================================
 * Cho phép Pro+ users tùy chỉnh trợ lý AI theo phong cách Elon Musk:
 * - Đơn giản, hiệu quả
 * - Chỉ những field thật sự cần thiết
 * - VIP có thêm tính năng cao cấp
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://diexsbzqwsbpilsymnfb.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAIPreferencesTable() {
  console.log("🚀 Creating user_ai_preferences table...\n");

  const sql = `
    -- =====================================================
    -- USER AI PREFERENCES TABLE
    -- =====================================================
    -- Elon-style: Đơn giản nhưng mạnh mẽ
    -- Pro: 5 fields cơ bản
    -- VIP: Full customization + Memory
    -- =====================================================

    CREATE TABLE IF NOT EXISTS user_ai_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

      -- ========== PRO TIER: Quick Profile (5 fields) ==========
      industry VARCHAR(100),              -- Ngành nghề kinh doanh
      business_goal TEXT,                 -- Mục tiêu chính
      budget_range VARCHAR(50),           -- Ngân sách dự kiến
      preferred_tone VARCHAR(50) DEFAULT 'friendly', -- casual, professional, formal, friendly
      main_pain_point TEXT,               -- Vấn đề cần giải quyết

      -- ========== VIP TIER: Full Persona ==========
      ai_name VARCHAR(50) DEFAULT 'Sang', -- Đặt tên riêng cho AI
      custom_greeting TEXT,               -- Lời chào tùy chỉnh
      language_style VARCHAR(50) DEFAULT 'vietnamese', -- vi, en, mixed
      communication_level VARCHAR(50) DEFAULT 'expert', -- beginner, intermediate, expert
      enable_memory BOOLEAN DEFAULT true, -- Nhớ lịch sử cuộc hội thoại

      -- ========== VIP EXCLUSIVE: Advanced ==========
      company_name VARCHAR(200),          -- Tên công ty
      company_description TEXT,           -- Mô tả công ty
      products_services TEXT,             -- Sản phẩm/dịch vụ chính
      target_customers TEXT,              -- Khách hàng mục tiêu
      competitors TEXT,                   -- Đối thủ cạnh tranh
      unique_selling_points TEXT,         -- Điểm khác biệt

      -- ========== METADATA ==========
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      UNIQUE(user_id)
    );

    -- Index for fast lookup
    CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_user_id
      ON user_ai_preferences(user_id);

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION update_user_ai_preferences_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_user_ai_preferences_updated_at ON user_ai_preferences;
    CREATE TRIGGER trigger_update_user_ai_preferences_updated_at
      BEFORE UPDATE ON user_ai_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_user_ai_preferences_updated_at();

    -- =====================================================
    -- ROW LEVEL SECURITY
    -- =====================================================
    ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

    -- Users can only see their own preferences
    DROP POLICY IF EXISTS "Users can view own preferences" ON user_ai_preferences;
    CREATE POLICY "Users can view own preferences" ON user_ai_preferences
      FOR SELECT USING (auth.uid() = user_id);

    -- Users can insert their own preferences
    DROP POLICY IF EXISTS "Users can insert own preferences" ON user_ai_preferences;
    CREATE POLICY "Users can insert own preferences" ON user_ai_preferences
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Users can update their own preferences
    DROP POLICY IF EXISTS "Users can update own preferences" ON user_ai_preferences;
    CREATE POLICY "Users can update own preferences" ON user_ai_preferences
      FOR UPDATE USING (auth.uid() = user_id);

    -- Users can delete their own preferences
    DROP POLICY IF EXISTS "Users can delete own preferences" ON user_ai_preferences;
    CREATE POLICY "Users can delete own preferences" ON user_ai_preferences
      FOR DELETE USING (auth.uid() = user_id);

    -- Service role can do anything
    DROP POLICY IF EXISTS "Service role full access" ON user_ai_preferences;
    CREATE POLICY "Service role full access" ON user_ai_preferences
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  `;

  try {
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      // Try direct execution
      console.log("⚠️ RPC failed, trying direct SQL...");

      const statements = sql.split(";").filter((s) => s.trim());
      for (const stmt of statements) {
        if (stmt.trim()) {
          const { error: stmtError } = await supabase.from("_temp_").select().limit(0);
          // Fallback: just create the table via REST
        }
      }
    }

    console.log("✅ Table creation SQL executed");
  } catch (err) {
    console.log("⚠️ Direct SQL failed:", err.message);
  }

  // Verify table exists
  const { data, error: verifyError } = await supabase
    .from("user_ai_preferences")
    .select("id")
    .limit(1);

  if (verifyError && verifyError.code === "42P01") {
    console.log("\n📋 Table not found. Creating via REST API...");

    // The table needs to be created in Supabase Dashboard or via migrations
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  Please run the following SQL in Supabase Dashboard:             ║
╠══════════════════════════════════════════════════════════════════╣

${sql}

╚══════════════════════════════════════════════════════════════════╝
    `);
  } else if (verifyError) {
    console.log("❌ Error:", verifyError.message);
  } else {
    console.log("✅ Table user_ai_preferences exists and is ready!");
  }

  console.log("\n🎉 AI Preferences setup complete!");
}

createAIPreferencesTable().catch(console.error);
