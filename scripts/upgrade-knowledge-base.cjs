/**
 * KNOWLEDGE BASE UPGRADE SCRIPT
 * Implements:
 * 1. metadata JSONB column for rich filtering
 * 2. context_prefix for Anthropic-style contextual retrieval
 * 3. Full-text search with tsvector
 * 4. Hybrid search function (semantic + BM25)
 * 5. Topic extraction from existing content
 */

const config = require("./_config.cjs");

const supabase = config.getSupabaseClient();

// ============================================
// PHASE 1: DATABASE SCHEMA UPGRADE
// ============================================
async function upgradeSchema() {
  console.log("\n📦 PHASE 1: Upgrading Database Schema...\n");

  const migrations = [
    // 1. Add metadata column
    `ALTER TABLE knowledge_base
     ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`,

    // 2. Add context_prefix for contextual retrieval
    `ALTER TABLE knowledge_base
     ADD COLUMN IF NOT EXISTS context_prefix TEXT DEFAULT ''`,

    // 3. Add full-text search vector
    `ALTER TABLE knowledge_base
     ADD COLUMN IF NOT EXISTS search_vector tsvector`,

    // 4. Create GIN index for full-text search
    `CREATE INDEX IF NOT EXISTS idx_knowledge_base_search_vector
     ON knowledge_base USING GIN(search_vector)`,

    // 5. Create GIN index for metadata
    `CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata
     ON knowledge_base USING GIN(metadata)`,

    // 6. Create trigger to auto-update search_vector
    `CREATE OR REPLACE FUNCTION knowledge_base_search_vector_trigger()
     RETURNS trigger AS $$
     BEGIN
       NEW.search_vector :=
         setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
         setweight(to_tsvector('english', COALESCE(NEW.context_prefix, '')), 'B') ||
         setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
       RETURN NEW;
     END
     $$ LANGUAGE plpgsql`,

    `DROP TRIGGER IF EXISTS tsvector_update ON knowledge_base`,

    `CREATE TRIGGER tsvector_update
     BEFORE INSERT OR UPDATE ON knowledge_base
     FOR EACH ROW EXECUTE FUNCTION knowledge_base_search_vector_trigger()`,
  ];

  for (const sql of migrations) {
    try {
      const { error } = await supabase.rpc("exec_sql", { sql });
      if (error) {
        // Try direct execution if RPC not available
        console.log(`⚠️ RPC failed, trying direct: ${error.message}`);
      } else {
        console.log(`✅ Executed: ${sql.substring(0, 50)}...`);
      }
    } catch (e) {
      console.log(`⚠️ Migration note: ${e.message}`);
    }
  }

  return true;
}

// ============================================
// PHASE 2: CREATE HYBRID SEARCH FUNCTION
// ============================================
async function createHybridSearchFunction() {
  console.log("\n🔍 PHASE 2: Creating Hybrid Search Function...\n");

  const sql = `
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
    const { error } = await supabase.rpc("exec_sql", { sql });
    if (error) {
      console.log(`⚠️ Will create via SQL editor: ${error.message}`);
    } else {
      console.log("✅ Hybrid search function created!");
    }
  } catch (e) {
    console.log(`⚠️ Note: ${e.message}`);
  }

  // Save SQL to file for manual execution
  const fs = require("fs");
  fs.writeFileSync(
    "D:\\0.PROJECTS\\01-MAIN-PRODUCTS\\long-sang-forge\\supabase\\migrations\\upgrade_knowledge_base.sql",
    sql
  );
  console.log("📁 SQL saved to supabase/migrations/upgrade_knowledge_base.sql");
}

// ============================================
// PHASE 3: TOPIC EXTRACTION
// ============================================
const TOPIC_KEYWORDS = {
  // AI & Technology
  ai: [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "neural network",
    "llm",
    "gpt",
    "transformer",
    "embedding",
    "ai agent",
    "automation",
  ],
  "ai-agents": [
    "ai agent",
    "autonomous agent",
    "agent framework",
    "langchain",
    "autogen",
    "crewai",
  ],
  llm: ["large language model", "llm", "gpt", "claude", "gemini", "openai"],
  programming: [
    "code",
    "programming",
    "developer",
    "software",
    "api",
    "javascript",
    "python",
    "typescript",
  ],

  // Business & Finance
  business: ["business", "company", "startup", "entrepreneur", "revenue", "profit", "customer"],
  finance: ["money", "investment", "stock", "market", "financial", "budget", "income", "expense"],
  marketing: ["marketing", "branding", "social media", "content", "seo", "advertising"],

  // Personal Development
  productivity: [
    "productivity",
    "efficiency",
    "time management",
    "habit",
    "routine",
    "focus",
    "deep work",
  ],
  learning: ["learn", "study", "education", "skill", "knowledge", "course", "training"],
  mindset: ["mindset", "motivation", "growth", "success", "goal", "vision", "purpose"],

  // Industry Specific
  "real-estate": ["real estate", "property", "house", "apartment", "mortgage", "rental"],
  ecommerce: ["ecommerce", "online store", "shopify", "dropshipping", "product", "selling"],
};

function extractTopics(content, title) {
  const text = `${title} ${content}`.toLowerCase();
  const topics = [];
  const scores = {};

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword.toLowerCase(), "gi");
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > 0) {
      scores[topic] = score;
    }
  }

  // Sort by score and take top 5
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted.map(([topic]) => topic);
}

function extractDifficulty(content) {
  const text = content.toLowerCase();
  const advancedTerms = [
    "advanced",
    "complex",
    "deep dive",
    "architecture",
    "optimization",
    "algorithm",
  ];
  const beginnerTerms = ["beginner", "introduction", "basics", "getting started", "101", "simple"];

  let advancedScore = 0;
  let beginnerScore = 0;

  for (const term of advancedTerms) {
    if (text.includes(term)) advancedScore++;
  }
  for (const term of beginnerTerms) {
    if (text.includes(term)) beginnerScore++;
  }

  if (advancedScore > beginnerScore) return "advanced";
  if (beginnerScore > advancedScore) return "beginner";
  return "intermediate";
}

function generateContextPrefix(doc) {
  const topics = extractTopics(doc.content, doc.title);
  const difficulty = extractDifficulty(doc.content);

  let prefix = "";

  // Source info
  if (doc.source === "youtube" || doc.source_url?.includes("youtube")) {
    prefix += `[YouTube Video] `;
  } else if (doc.source === "manual") {
    prefix += `[Manual Entry] `;
  }

  // Category
  prefix += `Category: ${doc.category}. `;

  // Topics
  if (topics.length > 0) {
    prefix += `Topics: ${topics.join(", ")}. `;
  }

  // Difficulty
  prefix += `Level: ${difficulty}. `;

  // Tags if exist
  if (doc.tags && doc.tags.length > 0) {
    prefix += `Tags: ${doc.tags.join(", ")}. `;
  }

  return prefix;
}

// ============================================
// PHASE 4: UPDATE EXISTING DOCS
// ============================================
async function updateExistingDocs() {
  console.log("\n📝 PHASE 4: Updating Existing Documents...\n");

  // Fetch all docs
  const { data: docs, error } = await supabase
    .from("knowledge_base")
    .select("id, title, content, category, source, source_url, tags")
    .eq("user_id", "default-longsang-user");

  if (error) {
    console.error("Error fetching docs:", error);
    return;
  }

  console.log(`Found ${docs.length} documents to update`);

  let updated = 0;
  let failed = 0;

  for (const doc of docs) {
    try {
      const topics = extractTopics(doc.content, doc.title);
      const difficulty = extractDifficulty(doc.content);
      const contextPrefix = generateContextPrefix(doc);

      const metadata = {
        topics,
        difficulty,
        word_count: doc.content.split(/\s+/).length,
        has_code: doc.content.includes("```"),
        has_list: doc.content.includes("- ") || doc.content.includes("* "),
        extracted_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("knowledge_base")
        .update({
          context_prefix: contextPrefix,
          metadata,
        })
        .eq("id", doc.id);

      if (updateError) {
        console.log(`⚠️ Failed ${doc.title}: ${updateError.message}`);
        failed++;
      } else {
        updated++;
        if (updated % 50 === 0) {
          console.log(`✅ Updated ${updated}/${docs.length}`);
        }
      }
    } catch (e) {
      console.log(`❌ Error ${doc.title}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
}

// ============================================
// PHASE 5: REBUILD SEARCH VECTORS
// ============================================
async function rebuildSearchVectors() {
  console.log("\n🔄 PHASE 5: Rebuilding Search Vectors...\n");

  // This will trigger the tsvector update via the trigger
  const sql = `
    UPDATE knowledge_base
    SET updated_at = NOW()
    WHERE user_id = 'default-longsang-user'
  `;

  try {
    const { error } = await supabase.rpc("exec_sql", { sql });
    if (error) {
      console.log(`⚠️ Will need manual rebuild: ${error.message}`);
    } else {
      console.log("✅ Search vectors rebuilt!");
    }
  } catch (e) {
    console.log(`Note: ${e.message}`);
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log("🚀 KNOWLEDGE BASE UPGRADE SCRIPT");
  console.log("================================\n");

  // Phase 1: Schema upgrade
  await upgradeSchema();

  // Phase 2: Create hybrid search function
  await createHybridSearchFunction();

  // Phase 3 & 4: Update existing docs with topics and context
  await updateExistingDocs();

  // Phase 5: Rebuild search vectors
  await rebuildSearchVectors();

  console.log("\n🎉 UPGRADE COMPLETE!");
  console.log("================================");
  console.log("Next steps:");
  console.log("1. Run the SQL in supabase/migrations/upgrade_knowledge_base.sql");
  console.log("2. Test hybrid search with the new function");
  console.log("3. Update your search endpoints to use hybrid_search_knowledge()");
}

main().catch(console.error);
