/**
 * Run Knowledge Base Migration
 * Chạy SQL migration trực tiếp vào database qua transaction pooler
 */

require("dotenv").config();
const { Client } = require("pg");

async function runMigration() {
  console.log("🚀 KNOWLEDGE BASE MIGRATION");
  console.log("================================\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in .env");
    process.exit(1);
  }

  console.log("📡 Connecting to database...");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected!\n");

    // STEP 1: Add columns
    console.log("📦 STEP 1: Adding new columns...");

    const addColumns = [
      {
        name: "metadata",
        sql: `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'`,
      },
      {
        name: "context_prefix",
        sql: `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS context_prefix TEXT`,
      },
      {
        name: "search_vector",
        sql: `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS search_vector tsvector`,
      },
    ];

    for (const col of addColumns) {
      try {
        await client.query(col.sql);
        console.log(`   ✅ ${col.name}`);
      } catch (err) {
        console.log(`   ⚠️ ${col.name}: ${err.message.substring(0, 50)}`);
      }
    }

    // STEP 2: Create indexes
    console.log("\n📇 STEP 2: Creating indexes...");

    try {
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata ON knowledge_base USING GIN (metadata)`
      );
      console.log("   ✅ idx_knowledge_base_metadata");
    } catch (err) {
      console.log(`   ⚠️ metadata index: ${err.message.substring(0, 50)}`);
    }

    try {
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_knowledge_base_search_vector ON knowledge_base USING GIN (search_vector)`
      );
      console.log("   ✅ idx_knowledge_base_search_vector");
    } catch (err) {
      console.log(`   ⚠️ search_vector index: ${err.message.substring(0, 50)}`);
    }

    // STEP 3: Create trigger function
    console.log("\n⚡ STEP 3: Creating trigger function...");

    const triggerFunction = `
      CREATE OR REPLACE FUNCTION knowledge_base_search_vector_update()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.context_prefix, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    try {
      await client.query(triggerFunction);
      console.log("   ✅ knowledge_base_search_vector_update()");
    } catch (err) {
      console.log(`   ⚠️ trigger function: ${err.message.substring(0, 50)}`);
    }

    // STEP 4: Create trigger
    console.log("\n🔗 STEP 4: Creating trigger...");

    try {
      await client.query(
        `DROP TRIGGER IF EXISTS knowledge_base_search_vector_trigger ON knowledge_base`
      );
      await client.query(`
        CREATE TRIGGER knowledge_base_search_vector_trigger
        BEFORE INSERT OR UPDATE ON knowledge_base
        FOR EACH ROW
        EXECUTE FUNCTION knowledge_base_search_vector_update()
      `);
      console.log("   ✅ knowledge_base_search_vector_trigger");
    } catch (err) {
      console.log(`   ⚠️ trigger: ${err.message.substring(0, 50)}`);
    }

    // STEP 5: Create hybrid search function
    console.log("\n🔍 STEP 5: Creating hybrid_search_knowledge()...");

    const hybridSearchFn = `
      CREATE OR REPLACE FUNCTION hybrid_search_knowledge(
        query_text TEXT,
        query_embedding vector(1536),
        match_count INT DEFAULT 10,
        semantic_weight FLOAT DEFAULT 0.7,
        keyword_weight FLOAT DEFAULT 0.3,
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
        similarity FLOAT,
        keyword_rank FLOAT,
        combined_score FLOAT
      )
      LANGUAGE plpgsql
      AS $$
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
            1 - (kb.embedding <=> query_embedding) as similarity,
            0::float as keyword_rank
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
            0::float as similarity,
            ts_rank_cd(kb.search_vector, plainto_tsquery('english', query_text)) as keyword_rank
          FROM knowledge_base kb
          WHERE kb.is_active = true
            AND kb.search_vector @@ plainto_tsquery('english', query_text)
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
            COALESCE(s.similarity, 0) as similarity,
            COALESCE(k.keyword_rank, 0) as keyword_rank,
            (COALESCE(s.similarity, 0) * semantic_weight +
             COALESCE(k.keyword_rank, 0) * keyword_weight) as combined_score
          FROM semantic_results s
          FULL OUTER JOIN keyword_results k ON s.id = k.id
        )
        SELECT * FROM combined
        ORDER BY combined_score DESC
        LIMIT match_count;
      END;
      $$;
    `;

    try {
      await client.query(hybridSearchFn);
      console.log("   ✅ hybrid_search_knowledge()");
    } catch (err) {
      console.log(`   ❌ hybrid_search_knowledge: ${err.message.substring(0, 80)}`);
    }

    // STEP 6: Create get_related_documents function
    console.log("\n🔗 STEP 6: Creating get_related_documents()...");

    const relatedDocsFn = `
      CREATE OR REPLACE FUNCTION get_related_documents(
        source_id UUID,
        match_count INT DEFAULT 5
      )
      RETURNS TABLE (
        id UUID,
        title TEXT,
        category TEXT,
        tags TEXT[],
        similarity FLOAT
      )
      LANGUAGE plpgsql
      AS $$
      DECLARE
        source_embedding vector(1536);
        source_category TEXT;
      BEGIN
        SELECT kb.embedding, kb.category
        INTO source_embedding, source_category
        FROM knowledge_base kb
        WHERE kb.id = source_id;

        RETURN QUERY
        SELECT
          kb.id,
          kb.title,
          kb.category,
          kb.tags,
          1 - (kb.embedding <=> source_embedding) as similarity
        FROM knowledge_base kb
        WHERE kb.id != source_id
          AND kb.is_active = true
        ORDER BY
          CASE WHEN kb.category = source_category THEN 0 ELSE 1 END,
          kb.embedding <=> source_embedding
        LIMIT match_count;
      END;
      $$;
    `;

    try {
      await client.query(relatedDocsFn);
      console.log("   ✅ get_related_documents()");
    } catch (err) {
      console.log(`   ❌ get_related_documents: ${err.message.substring(0, 80)}`);
    }

    // STEP 7: Create search_by_topic function
    console.log("\n📚 STEP 7: Creating search_by_topic()...");

    const searchByTopicFn = `
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
        relevance FLOAT
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
          ts_rank_cd(kb.search_vector, plainto_tsquery('english', topic)) as relevance
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
    `;

    try {
      await client.query(searchByTopicFn);
      console.log("   ✅ search_by_topic()");
    } catch (err) {
      console.log(`   ❌ search_by_topic: ${err.message.substring(0, 80)}`);
    }

    // STEP 8: Rebuild search vectors
    console.log("\n🔄 STEP 8: Rebuilding search vectors...");

    try {
      const result = await client.query(`
        UPDATE knowledge_base
        SET search_vector =
          setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(context_prefix, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(content, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'B')
        WHERE search_vector IS NULL OR search_vector = ''::tsvector
      `);
      console.log(`   ✅ Updated ${result.rowCount} documents`);
    } catch (err) {
      console.log(`   ⚠️ rebuild vectors: ${err.message.substring(0, 80)}`);
    }

    console.log("\n================================");

    // Verify columns exist
    console.log("\n🔍 Verifying schema...");
    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'knowledge_base'
      AND column_name IN ('metadata', 'context_prefix', 'search_vector')
      ORDER BY column_name
    `);

    if (rows.length >= 3) {
      console.log("✅ All new columns exist:");
      rows.forEach((r) => console.log(`   - ${r.column_name}: ${r.data_type}`));
    } else {
      console.log("⚠️ Some columns missing. Found:", rows);
    }

    // Verify functions exist
    console.log("\n🔍 Verifying functions...");
    const { rows: funcs } = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN ('hybrid_search_knowledge', 'get_related_documents', 'search_by_topic')
      ORDER BY routine_name
    `);

    console.log(`✅ Functions created: ${funcs.map((f) => f.routine_name).join(", ")}`);

    // Count docs with search_vector
    const { rows: countRows } = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(search_vector) as with_vector,
             COUNT(metadata) as with_metadata
      FROM knowledge_base
    `);

    console.log("\n📊 Knowledge Base Status:");
    console.log(`   Total docs: ${countRows[0].total}`);
    console.log(`   With search_vector: ${countRows[0].with_vector}`);
    console.log(`   With metadata: ${countRows[0].with_metadata}`);

    console.log("\n🎉 MIGRATION COMPLETE!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
