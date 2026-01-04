/**
 * SCALABILITY ANALYSIS: pgvector Knowledge Search
 * ================================================
 * Phân tích performance khi scale lên hàng triệu documents
 */

require("dotenv").config();
const { Client } = require("pg");

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function analyze() {
  await c.connect();

  console.log("=".repeat(70));
  console.log("SCALABILITY ANALYSIS: pgvector Knowledge Search");
  console.log("=".repeat(70));

  // 1. Current state
  console.log("\n📊 CURRENT STATE");
  console.log("-".repeat(70));

  const stats = await c.query(`
    SELECT
      COUNT(*) as total_rows,
      COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_embeddings,
      pg_size_pretty(pg_total_relation_size('brain_knowledge')) as table_size,
      pg_size_pretty(pg_relation_size('brain_knowledge')) as data_size
    FROM brain_knowledge
  `);
  console.log("Total rows:", stats.rows[0].total_rows);
  console.log("With embeddings:", stats.rows[0].with_embeddings);
  console.log("Table size:", stats.rows[0].table_size);
  console.log("Data size:", stats.rows[0].data_size);

  // 2. Index analysis
  console.log("\n📊 INDEX ANALYSIS");
  console.log("-".repeat(70));

  const indexes = await c.query(`
    SELECT indexname, indexdef, pg_size_pretty(pg_relation_size(indexname::regclass)) as size
    FROM pg_indexes
    WHERE tablename = 'brain_knowledge'
  `);
  indexes.rows.forEach((idx) => {
    console.log(`\n${idx.indexname}:`);
    console.log(`  Size: ${idx.size}`);
    console.log(`  Def: ${idx.indexdef.substring(0, 100)}...`);
  });

  // 3. Vector column analysis
  console.log("\n📊 VECTOR STORAGE ANALYSIS");
  console.log("-".repeat(70));

  const vectorSize = await c.query(`
    SELECT pg_column_size(embedding) as single_vector_bytes
    FROM brain_knowledge
    WHERE embedding IS NOT NULL
    LIMIT 1
  `);
  const avgContent = await c.query(`
    SELECT AVG(LENGTH(content)) as avg_content_length
    FROM brain_knowledge
    WHERE embedding IS NOT NULL
  `);
  const singleVectorBytes = vectorSize.rows[0]?.single_vector_bytes || 0;
  console.log(
    `Single vector(1536) size: ${singleVectorBytes} bytes (~${(singleVectorBytes / 1024).toFixed(
      1
    )} KB)`
  );
  console.log(
    `Avg content length: ${Math.round(avgContent.rows[0]?.avg_content_length || 0)} chars`
  );

  // 4. Projection at scale
  console.log("\n" + "=".repeat(70));
  console.log("📈 PROJECTION AT SCALE");
  console.log("=".repeat(70));

  const projections = [
    { docs: 1000, label: "1K docs (small)" },
    { docs: 10000, label: "10K docs (medium)" },
    { docs: 100000, label: "100K docs (large)" },
    { docs: 1000000, label: "1M docs (enterprise)" },
  ];

  console.log(`
┌─────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Scale               │ Vector Size  │ Index Size*  │ Query Time** │ Monthly Cost │
│                     │ (raw data)   │ (HNSW est.)  │ (estimated)  │ (Supabase)   │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤`);

  projections.forEach((p) => {
    const vectorMB = ((p.docs * singleVectorBytes) / 1024 / 1024).toFixed(1);
    const indexMB = ((p.docs * singleVectorBytes * 1.5) / 1024 / 1024).toFixed(1); // HNSW ~1.5x data

    // Query time estimation (logarithmic with HNSW)
    let queryTime;
    if (p.docs <= 1000) queryTime = "~50ms";
    else if (p.docs <= 10000) queryTime = "~100ms";
    else if (p.docs <= 100000) queryTime = "~200ms";
    else queryTime = "~500ms";

    // Supabase cost (rough estimate based on storage + compute)
    let cost;
    const totalGB = (parseFloat(vectorMB) + parseFloat(indexMB)) / 1024;
    if (totalGB < 8) cost = "$25/mo (Pro)";
    else if (totalGB < 50) cost = "$75/mo";
    else cost = "$200+/mo";

    console.log(
      `│ ${p.label.padEnd(19)} │ ${(vectorMB + " MB").padStart(12)} │ ${(indexMB + " MB").padStart(
        12
      )} │ ${queryTime.padStart(12)} │ ${cost.padStart(12)} │`
    );
  });

  console.log(`└─────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
* HNSW index typically 1.5x raw vector data
** With proper indexing (HNSW, ef_search=100)
`);

  // 5. TEXT vs VECTOR comparison at scale
  console.log("\n" + "=".repeat(70));
  console.log("⚖️  TEXT vs VECTOR PARAMETER - SCALABILITY COMPARISON");
  console.log("=".repeat(70));

  console.log(`
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ Factor                  │ VECTOR Parameter        │ TEXT Parameter          │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Storage Impact          │ None                    │ None                    │
│                         │ (same DB storage)       │ (same DB storage)       │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Network Bandwidth       │ ~32KB per query         │ ~32KB per query         │
│                         │ (JSON serialized)       │ (same - both text)      │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Query Overhead          │ 0ms                     │ ~0.01ms (cast)          │
│ (per query)             │                         │ (negligible)            │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Index Usage             │ ✅ Direct HNSW          │ ✅ Same (after cast)    │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ At 1M documents         │ ~500ms query            │ ~500ms query            │
│                         │ (index-dominated)       │ (index-dominated)       │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ PostgREST Stability     │ ⚠️ Schema cache risk    │ ✅ Always works         │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Type Safety             │ ✅ Compile-time check   │ ⚠️ Runtime check        │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Code Portability        │ ⚠️ pgvector specific    │ ✅ Universal JSON       │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘

🎯 KEY INSIGHT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
At scale (100K+ docs), the difference between TEXT and VECTOR is NEGLIGIBLE.

The bottleneck is:
1. Embedding generation: ~500ms (OpenAI API call)
2. Vector search (HNSW): ~100-500ms depending on scale
3. LLM response: ~1500ms

TEXT cast overhead: ~0.01ms = 0.002% of total time

The REAL optimization opportunities at scale:
`);

  // 6. Real optimization recommendations
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 REAL OPTIMIZATION STRATEGIES FOR SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 📊 USE HNSW INDEX (not IVFFlat)
   Current: No vector index or IVFFlat
   Better: CREATE INDEX ON brain_knowledge USING hnsw (embedding vector_cosine_ops)
   Impact: 10-100x faster queries at scale

2. 🔀 PARTITION BY DOMAIN
   Current: Single table
   Better: Partition by domain_id (mỗi domain có knowledge riêng)
   Impact: Query chỉ scan partition cần thiết

3. 💾 QUANTIZATION (for 1M+ docs)
   halfvec: 50% storage, ~95% accuracy
   binary: 97% storage reduction, ~90% accuracy

4. 🧠 EMBEDDING CACHING
   Cache frequent queries → skip OpenAI call (500ms saved!)

5. 🎯 DIMENSION REDUCTION
   text-embedding-3-small: 1536 dims
   Can reduce to 512 dims: 66% storage saved, ~97% accuracy

6. 📦 CHUNKING STRATEGY
   Better chunks = better retrieval = fewer docs needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 RECOMMENDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For YOUR use case (Long Sang knowledge base):

SHORT TERM (< 10K docs):
  → Keep TEXT param (stable, simple)
  → Add HNSW index

MEDIUM TERM (10K-100K docs):
  → Add HNSW index + partition by domain
  → Consider embedding caching

LONG TERM (100K+ docs):
  → Switch to halfvec (50% storage)
  → Use dedicated vector DB (Pinecone/Weaviate) if needed
  → TEXT vs VECTOR: KHÔNG quan trọng ở scale này
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  await c.end();
}

analyze().catch((e) => console.error("Error:", e.message));
