/**
 * Fix get_related_documents function
 */
const config = require("./_config.cjs");
const { Client } = require("pg");

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("🔧 Connected to DB\n");

  try {
    // Find and drop all versions
    console.log("📋 Finding all get_related_documents functions...");
    const existing = await client.query(`
      SELECT p.oid::regprocedure as func_sig
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'get_related_documents'
    `);
    console.log("   Found:", existing.rows.length, "versions");

    for (const row of existing.rows) {
      console.log("   Dropping:", row.func_sig);
      await client.query(`DROP FUNCTION IF EXISTS ${row.func_sig} CASCADE`);
    }

    console.log("🔍 Creating new get_related_documents...");
    await client.query(`
      CREATE FUNCTION get_related_documents(
        source_id UUID,
        max_results INT DEFAULT 5
      )
      RETURNS TABLE (
        id UUID,
        title TEXT,
        content TEXT,
        category TEXT,
        tags TEXT[],
        similarity DOUBLE PRECISION
      )
      LANGUAGE plpgsql
      AS $fn$
      DECLARE
        source_embedding vector(1536);
      BEGIN
        -- Get source document embedding
        SELECT kb.embedding INTO source_embedding
        FROM knowledge_base kb
        WHERE kb.id = source_id;

        IF source_embedding IS NULL THEN
          RETURN;
        END IF;

        RETURN QUERY
        SELECT
          kb.id,
          kb.title,
          kb.content,
          kb.category,
          kb.tags,
          (1 - (kb.embedding <=> source_embedding))::double precision as similarity
        FROM knowledge_base kb
        WHERE kb.is_active = true
          AND kb.id != source_id
          AND kb.embedding IS NOT NULL
        ORDER BY kb.embedding <=> source_embedding
        LIMIT max_results;
      END;
      $fn$
    `);

    await client.query(
      "GRANT EXECUTE ON FUNCTION get_related_documents TO authenticated, anon, service_role"
    );

    console.log("\n✅ get_related_documents fixed!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fix();
