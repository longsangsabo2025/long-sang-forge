/**
 * Create match_knowledge RPC function
 * Run: node scripts/create-match-knowledge.cjs
 */

const { Client } = require("pg");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

const SQL_DROP = `
-- Drop ALL existing match_knowledge functions
DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN
    SELECT oid::regprocedure::text as signature
    FROM pg_proc
    WHERE proname = 'match_knowledge'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func.signature || ' CASCADE';
    RAISE NOTICE 'Dropped: %', func.signature;
  END LOOP;
END $$;
`;

const SQL_CREATE = `
-- Create match_knowledge function for semantic search (1536 dims for text-embedding-3-small)
CREATE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  p_domain_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  domain_id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bk.id,
    bk.domain_id,
    bk.title,
    bk.content,
    1 - (bk.embedding <=> query_embedding) AS similarity
  FROM brain_knowledge bk
  WHERE
    bk.embedding IS NOT NULL
    AND (p_domain_id IS NULL OR bk.domain_id = p_domain_id)
    AND 1 - (bk.embedding <=> query_embedding) > match_threshold
  ORDER BY bk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION match_knowledge TO authenticated, anon, service_role;
`;

async function main() {
  console.log("🚀 Creating match_knowledge RPC function...\n");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Drop all existing versions
    console.log("🗑️  Dropping existing functions...");
    await client.query(SQL_DROP);

    // Create fresh
    console.log("📝 Creating new function...");
    await client.query(SQL_CREATE);
    console.log("✅ match_knowledge function created successfully!");

    // Verify function exists
    const result = await client.query(`
      SELECT routine_name FROM information_schema.routines
      WHERE routine_name = 'match_knowledge' AND routine_schema = 'public'
    `);

    if (result.rows.length > 0) {
      console.log("✅ Verified: match_knowledge function exists");
    }

    // Test function with empty embedding
    console.log("\n📊 Testing function...");
    const testResult = await client.query(`
      SELECT COUNT(*) as count FROM brain_knowledge WHERE embedding IS NOT NULL
    `);
    console.log(`   Found ${testResult.rows[0].count} knowledge items with embeddings`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log("\n🏁 Done!");
  }
}

main();
