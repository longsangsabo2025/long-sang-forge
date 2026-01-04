/**
 * Create user_feature_overrides table for Admin to grant special access
 * ELON AUDIT: User Override System - Cho phép admin cấp quyền đặc biệt cho từng user
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserOverridesTable() {
  console.log("🚀 Creating user_feature_overrides table...\n");

  const sql = `
    -- Create user_feature_overrides table
    CREATE TABLE IF NOT EXISTS user_feature_overrides (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      feature_key TEXT NOT NULL,
      feature_value JSONB NOT NULL,
      reason TEXT,
      granted_by UUID REFERENCES auth.users(id),
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      -- One override per user per feature
      UNIQUE(user_id, feature_key)
    );

    -- Create index for fast lookup
    CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user_id
      ON user_feature_overrides(user_id);

    CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_expires_at
      ON user_feature_overrides(expires_at)
      WHERE expires_at IS NOT NULL;

    -- Enable RLS
    ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;

    -- Admin can do anything
    CREATE POLICY IF NOT EXISTS "admin_all_user_feature_overrides"
      ON user_feature_overrides FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'admin'
        )
      );

    -- Users can read their own overrides
    CREATE POLICY IF NOT EXISTS "users_read_own_overrides"
      ON user_feature_overrides FOR SELECT
      USING (user_id = auth.uid());

    -- Add comments
    COMMENT ON TABLE user_feature_overrides IS 'Admin-granted feature overrides per user (ELON AUDIT)';
    COMMENT ON COLUMN user_feature_overrides.feature_key IS 'Feature key like showcase_limit, investment_access etc';
    COMMENT ON COLUMN user_feature_overrides.feature_value IS 'Override value: number for limits, boolean for access';
    COMMENT ON COLUMN user_feature_overrides.reason IS 'Admin note explaining why override was granted';
    COMMENT ON COLUMN user_feature_overrides.expires_at IS 'Optional expiry for temporary grants';
  `;

  try {
    // Execute via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      // Try direct query approach
      console.log("Trying alternative approach...");

      // Check if table exists
      const { data: tables } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "user_feature_overrides");

      if (tables && tables.length > 0) {
        console.log("✅ Table already exists!");
        return;
      }

      // Create table using raw REST
      const createResp = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Alternative approach response:", createResp.status);
    }

    console.log("✅ Migration script prepared!");
    console.log("\n📋 Run this SQL in Supabase SQL Editor:\n");
    console.log(sql);
  } catch (error) {
    console.error("Error:", error);
    console.log("\n📋 Run this SQL manually in Supabase SQL Editor:\n");
    console.log(sql);
  }
}

createUserOverridesTable();
