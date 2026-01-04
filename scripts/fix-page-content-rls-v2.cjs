/**
 * Fix page_content RLS - Allow public write for admin edit feature
 */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: "public" },
  auth: { persistSession: false },
});

async function fixRLS() {
  console.log("🔧 Fixing page_content RLS policies...\n");

  // The SQL to run - allow all operations for authenticated users
  // and read for everyone
  const sql = `
    -- Drop existing policies
    DROP POLICY IF EXISTS "public_read" ON page_content;
    DROP POLICY IF EXISTS "auth_write" ON page_content;
    DROP POLICY IF EXISTS "auth_update" ON page_content;
    DROP POLICY IF EXISTS "Anyone can read" ON page_content;
    DROP POLICY IF EXISTS "Anyone can insert" ON page_content;
    DROP POLICY IF EXISTS "Anyone can update" ON page_content;
    DROP POLICY IF EXISTS "Anyone can delete" ON page_content;

    -- Create permissive policies
    -- Anyone can read (for public pages)
    CREATE POLICY "public_read_page_content"
    ON page_content FOR SELECT
    USING (true);

    -- Authenticated users can insert
    CREATE POLICY "auth_insert_page_content"
    ON page_content FOR INSERT
    TO authenticated
    WITH CHECK (true);

    -- Authenticated users can update
    CREATE POLICY "auth_update_page_content"
    ON page_content FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

    -- Authenticated users can delete
    CREATE POLICY "auth_delete_page_content"
    ON page_content FOR DELETE
    TO authenticated
    USING (true);
  `;

  console.log("📝 SQL to run:\n", sql);
  console.log("\n⚠️  Please run the above SQL in Supabase Dashboard SQL Editor");
  console.log("   Go to: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new\n");
}

fixRLS().catch(console.error);
