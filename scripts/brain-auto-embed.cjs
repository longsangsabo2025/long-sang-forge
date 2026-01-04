/**
 * Brain Auto-Embed System
 * =======================
 * Tự động tạo embedding cho knowledge chưa có embedding
 * + Cập nhật embedding cho knowledge đã thay đổi
 *
 * Run: node scripts/brain-auto-embed.cjs
 */

require("dotenv").config();
const OpenAI = require("openai");
const crypto = require("crypto");

const config = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  EMBEDDING_MODEL: "text-embedding-3-small",
  BATCH_SIZE: 20, // Process 20 at a time to avoid rate limits
  DELAY_MS: 500, // Delay between batches
};

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

// ===========================================
// HELPER: Compute content hash
// ===========================================
function computeHash(content) {
  return crypto
    .createHash("md5")
    .update(content || "")
    .digest("hex");
}

// ===========================================
// HELPER: Delay
// ===========================================
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===========================================
// SUPABASE REST API HELPERS
// ===========================================
async function supabaseRest(endpoint, options = {}) {
  const url = `${config.SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      apikey: config.SUPABASE_KEY,
      Authorization: `Bearer ${config.SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${error}`);
  }

  if (options.method === "DELETE" || response.headers.get("content-length") === "0") {
    return null;
  }

  return response.json();
}

// ===========================================
// GET KNOWLEDGE NEEDING EMBEDDING
// ===========================================
async function getKnowledgeNeedingEmbed() {
  // Get all knowledge
  const all = await supabaseRest("brain_knowledge?select=id,title,content,metadata,embedding");

  const needsEmbed = [];

  for (const item of all) {
    const currentHash = computeHash(item.content);
    const storedHash = item.metadata?.contentHash;

    // Needs embedding if:
    // 1. No embedding
    // 2. Content changed (hash different)
    if (!item.embedding || currentHash !== storedHash) {
      needsEmbed.push({
        ...item,
        newHash: currentHash,
        reason: !item.embedding ? "no_embedding" : "content_changed",
      });
    }
  }

  return needsEmbed;
}

// ===========================================
// GENERATE EMBEDDING
// ===========================================
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: config.EMBEDDING_MODEL,
    input: text.substring(0, 8000), // Limit input size
  });
  return response.data[0]?.embedding;
}

// ===========================================
// UPDATE KNOWLEDGE WITH EMBEDDING
// ===========================================
async function updateKnowledgeEmbedding(id, embedding, contentHash) {
  // Supabase REST API needs the embedding as array string
  const embeddingStr = `[${embedding.join(",")}]`;

  await supabaseRest(`brain_knowledge?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      embedding: embeddingStr,
      metadata: { contentHash },
      updated_at: new Date().toISOString(),
    }),
  });
}

// ===========================================
// MAIN: AUTO EMBED
// ===========================================
async function autoEmbed() {
  console.log("🧠 BRAIN AUTO-EMBED SYSTEM");
  console.log("=".repeat(50));

  // Check requirements
  if (!config.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found in .env");
    process.exit(1);
  }

  // Get knowledge needing embedding
  console.log("\n📊 Checking knowledge base...");
  const needsEmbed = await getKnowledgeNeedingEmbed();

  if (needsEmbed.length === 0) {
    console.log("✅ All knowledge already has embeddings!");
    return;
  }

  console.log(`\n📝 Found ${needsEmbed.length} items needing embedding:`);
  const byReason = needsEmbed.reduce((acc, x) => {
    acc[x.reason] = (acc[x.reason] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byReason).forEach(([reason, count]) => {
    console.log(`   - ${reason}: ${count}`);
  });

  // Process in batches
  console.log(`\n🚀 Processing in batches of ${config.BATCH_SIZE}...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < needsEmbed.length; i += config.BATCH_SIZE) {
    const batch = needsEmbed.slice(i, i + config.BATCH_SIZE);
    console.log(
      `\n📦 Batch ${Math.floor(i / config.BATCH_SIZE) + 1}/${Math.ceil(
        needsEmbed.length / config.BATCH_SIZE
      )}`
    );

    for (const item of batch) {
      try {
        console.log(`   ⏳ ${item.title.substring(0, 50)}...`);

        // Generate embedding
        const embedding = await generateEmbedding(item.title + "\n" + item.content);

        if (!embedding) {
          console.log(`   ❌ Failed to generate embedding`);
          failed++;
          continue;
        }

        // Update in DB
        await updateKnowledgeEmbedding(item.id, embedding, item.newHash);

        console.log(`   ✅ Done (${embedding.length} dims)`);
        success++;
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        failed++;
      }
    }

    // Delay between batches
    if (i + config.BATCH_SIZE < needsEmbed.length) {
      await delay(config.DELAY_MS);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY:");
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log("=".repeat(50));
}

// Run
autoEmbed().catch(console.error);
