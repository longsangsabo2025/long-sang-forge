/**
 * Fix hybrid_search_knowledge function types
 * Fixes FLOAT to DOUBLE PRECISION mismatch
 */
const config = require("./_config.cjs");
const { Client } = require("pg");

async function fixFunction() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("🔧 Connected to DB\n");

  try {
    // Drop and recreate with correct types
    console.log("📦 Dropping old function...");
    await client.query("DROP FUNCTION IF EXISTS hybrid_search_knowledge CASCADE");

    console.log("🔍 Creating hybrid_search_knowledge with DOUBLE PRECISION...");
    await client.query(`
      CREATE OR REPLACE FUNCTION hybrid_search_knowledge(
        query_text TEXT,
        query_embedding vector(1536),
        match_count INT DEFAULT 10,
        semantic_weight DOUBLE PRECISION DEFAULT 0.7,
        keyword_weight DOUBLE PRECISION DEFAULT 0.3,
        filter_user_id TEXT DEFAULT NULL,
        filter_category TEXT DEFAULT NULL
      )
      RETURNS TABLE (
        id UUID,
        title TEXT,
        content TEXT,
        context_prefix TEXT,
        category TEXT,
        tags TEXT[],
        metadata JSONB,
        similarity DOUBLE PRECISION,
        keyword_rank DOUBLE PRECISION,
        combined_score DOUBLE PRECISION
      )
      LANGUAGE plpgsql
      AS $fn$
      BEGIN
        RETURN QUERY
        WITH semantic_results AS (
          SELECT
            kb.id,
            kb.title,
            kb.content,
            kb.context_prefix,
            kb.category,
            kb.tags,
            kb.metadata,
            (1 - (kb.embedding <=> query_embedding))::double precision as similarity,
            0::double precision as keyword_rank
          FROM knowledge_base kb
          WHERE kb.is_active = true
            AND (filter_user_id IS NULL OR kb.user_id = filter_user_id)
            AND (filter_category IS NULL OR kb.category = filter_category)
          ORDER BY kb.embedding <=> query_embedding
          LIMIT match_count * 3
        ),
        keyword_results AS (
          SELECT
            kb.id,
            kb.title,
            kb.content,
            kb.context_prefix,
            kb.category,
            kb.tags,
            kb.metadata,
            0::double precision as similarity,
            ts_rank_cd(kb.search_vector, plainto_tsquery('simple', query_text))::double precision as keyword_rank
          FROM knowledge_base kb
          WHERE kb.is_active = true
            AND kb.search_vector @@ plainto_tsquery('simple', query_text)
            AND (filter_user_id IS NULL OR kb.user_id = filter_user_id)
            AND (filter_category IS NULL OR kb.category = filter_category)
          ORDER BY keyword_rank DESC
          LIMIT match_count * 3
        ),
        combined AS (
          SELECT
            COALESCE(s.id, k.id) as id,
            COALESCE(s.title, k.title) as title,
            COALESCE(s.content, k.content) as content,
            COALESCE(s.context_prefix, k.context_prefix) as context_prefix,
            COALESCE(s.category, k.category) as category,
            COALESCE(s.tags, k.tags) as tags,
            COALESCE(s.metadata, k.metadata) as metadata,
            COALESCE(s.similarity, 0::double precision) as similarity,
            COALESCE(k.keyword_rank, 0::double precision) as keyword_rank,
            (COALESCE(s.similarity, 0::double precision) * semantic_weight +
             COALESCE(k.keyword_rank, 0::double precision) * keyword_weight)::double precision as combined_score
          FROM semantic_results s
          FULL OUTER JOIN keyword_results k ON s.id = k.id
        )
        SELECT * FROM combined
        ORDER BY combined_score DESC
        LIMIT match_count;
      END;
      $fn$
    `);

    console.log("🔑 Granting permissions...");
    await client.query(
      "GRANT EXECUTE ON FUNCTION hybrid_search_knowledge TO authenticated, anon, service_role"
    );

    // Update trigger to use 'simple' for multilingual support
    console.log("🔄 Updating trigger to use 'simple' config...");
    await client.query(`
      CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'B') ||
          setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Rebuild all search vectors with 'simple' config
    console.log("📊 Rebuilding search vectors (this may take a moment)...");
    const result = await client.query(`
      UPDATE knowledge_base SET search_vector =
        setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(content, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(array_to_string(tags, ' '), '')), 'C')
    `);
    console.log(`   Rebuilt ${result.rowCount} search vectors`);

    // Fix search_by_topic to use tags array
    console.log("🔍 Fixing search_by_topic to use tags array...");
    await client.query("DROP FUNCTION IF EXISTS search_by_topic CASCADE");
    await client.query(`
      CREATE OR REPLACE FUNCTION search_by_topic(
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
      AS $fn2$
      BEGIN
        RETURN QUERY
        SELECT
          kb.id,
          kb.title,
          kb.content,
          kb.category,
          kb.tags,
          (
            CASE
              WHEN topic_name = ANY(kb.tags) THEN 10.0
              WHEN kb.category ILIKE '%' || topic_name || '%' THEN 8.0
              WHEN EXISTS (SELECT 1 FROM unnest(kb.tags) t WHERE t ILIKE '%' || topic_name || '%') THEN 6.0
              ELSE 0.0
            END
          )::double precision as relevance
        FROM knowledge_base kb
        WHERE kb.is_active = true
          AND (
            topic_name = ANY(kb.tags)
            OR kb.category ILIKE '%' || topic_name || '%'
            OR EXISTS (SELECT 1 FROM unnest(kb.tags) t WHERE t ILIKE '%' || topic_name || '%')
          )
        ORDER BY relevance DESC, kb.created_at DESC
        LIMIT max_results;
      END;
      $fn2$
    `);
    await client.query(
      "GRANT EXECUTE ON FUNCTION search_by_topic TO authenticated, anon, service_role"
    );

    console.log("\n✅ hybrid_search_knowledge() fixed successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fixFunction();
