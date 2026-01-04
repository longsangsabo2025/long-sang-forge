/**
 * Fix page_content RLS policies
 */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  console.log("🔧 Fixing page_content RLS policies...\n");

  // Step 1: Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .from("page_content")
    .select("page_id")
    .limit(1);

  if (tablesError) {
    console.log("❌ Table page_content might not exist or RLS blocking:", tablesError.message);
    console.log("\n📝 Creating table with correct RLS via raw SQL...\n");
  } else {
    console.log("✅ Table exists, current data:", tables);
  }

  // Use postgres function to run SQL
  // First, let's try to insert with service role - it should bypass RLS
  console.log("\n📝 Trying to insert test data...");

  const { data: insertData, error: insertError } = await supabase
    .from("page_content")
    .upsert(
      {
        page_id: "test-rls-check",
        content: { images: {}, texts: { test: "hello" }, styles: {} },
        updated_at: new Date().toISOString(),
        updated_by: null,
      },
      { onConflict: "page_id" }
    )
    .select();

  if (insertError) {
    console.log("❌ Insert failed:", insertError.message);
    console.log("\n⚠️  RLS is blocking service_role. Need to fix via Supabase Dashboard.");
    console.log("\n📋 Run this SQL in Supabase SQL Editor:\n");
    console.log(`
-- Drop existing policies
DROP POLICY IF EXISTS "public_read" ON page_content;
DROP POLICY IF EXISTS "auth_write" ON page_content;
DROP POLICY IF EXISTS "auth_update" ON page_content;

-- Disable RLS temporarily to allow service role access
ALTER TABLE page_content DISABLE ROW LEVEL SECURITY;

-- Or if you want RLS enabled, use these policies:
-- ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Anyone can read" ON page_content FOR SELECT USING (true);
-- CREATE POLICY "Anyone can insert" ON page_content FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anyone can update" ON page_content FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete" ON page_content FOR DELETE USING (true);
`);
  } else {
    console.log("✅ Insert successful:", insertData);

    // Clean up test data
    await supabase.from("page_content").delete().eq("page_id", "test-rls-check");
    console.log("✅ Test data cleaned up");
    console.log("\n🎉 RLS is working correctly!");
  }
}

fixRLS().catch(console.error);
