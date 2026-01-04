/**
 * Fix function return types
 */
require("dotenv").config();
const { Client } = require("pg");

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected!");

  // Fix search_by_topic return type
  await client.query(`
    CREATE OR REPLACE FUNCTION search_by_topic(
      topic TEXT,
      match_count INT DEFAULT 20,
      filter_user_id TEXT DEFAULT NULL
    )
    RETURNS TABLE (
      id UUID,
      title TEXT,
      content TEXT,
      category TEXT,
      tags TEXT[],
      metadata JSONB,
      relevance DOUBLE PRECISION
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.tags,
        kb.metadata,
        ts_rank_cd(kb.search_vector, plainto_tsquery('english', topic))::double precision as relevance
      FROM knowledge_base kb
      WHERE kb.is_active = true
        AND (
          kb.metadata->>'topics' ILIKE '%' || topic || '%'
          OR kb.category ILIKE '%' || topic || '%'
          OR topic = ANY(kb.tags)
          OR kb.search_vector @@ plainto_tsquery('english', topic)
        )
        AND (filter_user_id IS NULL OR kb.user_id = filter_user_id)
      ORDER BY relevance DESC
      LIMIT match_count;
    END;
    $$;
  `);
  console.log("✅ Fixed search_by_topic");

  await client.end();
}
fix();
