/**
 * Fix search_by_topic function to use tags array instead of metadata.topics
 */
const config = require("./_config.cjs");
const { Client } = require("pg");

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("🔧 Connected to DB\n");

  try {
    // List all search_by_topic functions first
    console.log("📋 Finding all search_by_topic functions...");
    const existing = await client.query(`
      SELECT p.oid::regprocedure as func_sig
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'search_by_topic'
    `);
    console.log("   Found:", existing.rows.length, "versions");

    // Drop each one
    for (const row of existing.rows) {
      console.log("   Dropping:", row.func_sig);
      await client.query(`DROP FUNCTION IF EXISTS ${row.func_sig} CASCADE`);
    }

    console.log("🔍 Creating new search_by_topic using tags array...");
    await client.query(`
      CREATE FUNCTION search_by_topic(
        topic_name TEXT,
        max_results INT DEFAULT 10
      )
      RETURNS TABLE (
        id UUID,
        title TEXT,
        content TEXT,
        category TEXT,
        tags TEXT[],
        relevance DOUBLE PRECISION
      )
      LANGUAGE plpgsql
      AS $fn$
      BEGIN
        RETURN QUERY
        SELECT
          kb.id,
          kb.title,
          kb.content,
          kb.category,
          kb.tags,
          (CASE
            WHEN topic_name = ANY(kb.tags) THEN 10.0
            WHEN kb.category ILIKE '%' || topic_name || '%' THEN 8.0
            WHEN EXISTS (SELECT 1 FROM unnest(kb.tags) t WHERE t ILIKE '%' || topic_name || '%') THEN 6.0
            ELSE 0.0
          END)::double precision as relevance
        FROM knowledge_base kb
        WHERE kb.is_active = true
          AND (
            topic_name = ANY(kb.tags)
            OR kb.category ILIKE '%' || topic_name || '%'
            OR EXISTS (SELECT 1 FROM unnest(kb.tags) t WHERE t ILIKE '%' || topic_name || '%')
          )
        ORDER BY relevance DESC
        LIMIT max_results;
      END;
      $fn$
    `);

    await client.query(
      "GRANT EXECUTE ON FUNCTION search_by_topic TO authenticated, anon, service_role"
    );

    console.log("\n✅ search_by_topic fixed!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fix();
