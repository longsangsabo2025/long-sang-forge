/**
 * Apply RLS policies using direct PostgreSQL connection
 */
const { Client } = require("pg");
require("dotenv").config();

const sql = `
-- Enable RLS
ALTER TABLE IF EXISTS saved_features ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own saved features" ON saved_features;
DROP POLICY IF EXISTS "Users can insert own saved features" ON saved_features;
DROP POLICY IF EXISTS "Users can update own saved features" ON saved_features;
DROP POLICY IF EXISTS "Users can delete own saved features" ON saved_features;

-- Create policies
CREATE POLICY "Users can view own saved features" 
ON saved_features FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved features" 
ON saved_features FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved features" 
ON saved_features FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved features" 
ON saved_features FOR DELETE 
USING (auth.uid() = user_id);
`;

async function main() {
  console.log("🔧 Connecting to PostgreSQL via transaction pooler...\n");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    console.log("📋 Executing RLS policies...\n");
    await client.query(sql);

    console.log("✅ RLS policies applied successfully!");
    console.log("\n🎉 Now the Save Feature button should work!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
