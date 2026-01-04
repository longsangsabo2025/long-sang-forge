/**
 * Fix page_content RLS using postgres-meta API
 */
const https = require("https");

const SUPABASE_URL = "diexsbzqwsbpilsymnfb.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY";

const sql = `
-- Drop existing policies
DROP POLICY IF EXISTS "public_read" ON page_content;
DROP POLICY IF EXISTS "auth_write" ON page_content;
DROP POLICY IF EXISTS "auth_update" ON page_content;

-- Create new permissive policies
CREATE POLICY "page_content_select" ON page_content FOR SELECT USING (true);
CREATE POLICY "page_content_insert" ON page_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "page_content_update" ON page_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "page_content_delete" ON page_content FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT SELECT ON page_content TO anon;
GRANT ALL ON page_content TO authenticated;
`;

async function runSQL() {
  console.log("🔧 Creating RPC function and running SQL...\n");

  // First, create a temporary RPC function
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION temp_fix_page_content_rls()
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Drop existing policies
      DROP POLICY IF EXISTS "public_read" ON page_content;
      DROP POLICY IF EXISTS "auth_write" ON page_content;
      DROP POLICY IF EXISTS "auth_update" ON page_content;
      DROP POLICY IF EXISTS "page_content_select" ON page_content;
      DROP POLICY IF EXISTS "page_content_insert" ON page_content;
      DROP POLICY IF EXISTS "page_content_update" ON page_content;
      DROP POLICY IF EXISTS "page_content_delete" ON page_content;

      -- Create new permissive policies
      CREATE POLICY "page_content_select" ON page_content FOR SELECT USING (true);
      CREATE POLICY "page_content_insert" ON page_content FOR INSERT TO authenticated WITH CHECK (true);
      CREATE POLICY "page_content_update" ON page_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
      CREATE POLICY "page_content_delete" ON page_content FOR DELETE TO authenticated USING (true);

      -- Grant permissions
      GRANT SELECT ON page_content TO anon;
      GRANT ALL ON page_content TO authenticated;

      RETURN 'RLS policies fixed successfully';
    END;
    $$;
  `;

  console.log("SQL to run in Supabase Dashboard SQL Editor:");
  console.log("=".repeat(60));
  console.log(createFunctionSQL);
  console.log("=".repeat(60));
  console.log("\nThen call: SELECT temp_fix_page_content_rls();");
  console.log("=".repeat(60));
}

runSQL();
