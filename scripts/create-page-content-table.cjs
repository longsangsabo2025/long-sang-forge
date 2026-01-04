/**
 * Create page_content table for Admin Edit Tool
 * Run: node scripts/create-page-content-table.cjs
 */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTable() {
  console.log("🔧 Creating page_content table...\n");

  // Check if table exists
  const { data, error: checkError } = await supabase
    .from("page_content")
    .select("page_id")
    .limit(1);

  if (!checkError) {
    console.log("✅ Table page_content already exists!");
    return;
  }

  if (checkError.code !== "42P01") {
    console.log("ℹ️  Table check result:", checkError.message);
  }

  // Table doesn't exist - need to create via Supabase Dashboard
  console.log("⚠️  Table does not exist. Please create it in Supabase Dashboard:");
  console.log("   Go to: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new");
  console.log("\n📋 Run this SQL:\n");
  console.log(`
-- Create page_content table for Admin Edit Tool
CREATE TABLE page_content (
  page_id TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public pages)
CREATE POLICY "public_read" ON page_content FOR SELECT USING (true);

-- Authenticated users can write
CREATE POLICY "auth_write" ON page_content FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update" ON page_content FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT SELECT ON page_content TO anon;
GRANT ALL ON page_content TO authenticated;
  `);
}

createTable();
