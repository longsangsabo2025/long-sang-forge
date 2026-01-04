/**
 * Fix page_content RLS using direct PostgreSQL connection
 */
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

const sql = `
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
CREATE POLICY "page_content_insert" ON page_content FOR INSERT WITH CHECK (true);
CREATE POLICY "page_content_update" ON page_content FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "page_content_delete" ON page_content FOR DELETE USING (true);

-- Grant permissions
GRANT SELECT ON page_content TO anon;
GRANT ALL ON page_content TO authenticated;
`;

async function main() {
  console.log("🔧 Connecting to Supabase PostgreSQL...\n");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected!\n");

    console.log("📝 Running RLS fix SQL...\n");
    await client.query(sql);

    console.log("✅ RLS policies fixed successfully!\n");

    // Verify policies
    const result = await client.query(`
      SELECT policyname, permissive, cmd
      FROM pg_policies
      WHERE tablename = 'page_content'
    `);

    console.log("📋 Current policies on page_content:");
    console.table(result.rows);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
