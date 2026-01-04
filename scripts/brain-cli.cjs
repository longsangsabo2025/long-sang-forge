/**
 * Brain CLI - Quick add knowledge from command line
 * ==================================================
 *
 * Usage:
 *   node scripts/brain-cli.cjs add "Title" "Content" --tags tag1,tag2
 *   node scripts/brain-cli.cjs embed
 *   node scripts/brain-cli.cjs search "query"
 *   node scripts/brain-cli.cjs stats
 */

require("dotenv").config();
const OpenAI = require("openai");
const crypto = require("crypto");

const config = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DOMAIN_ID: "19561882-d717-4b29-8b0c-02ed8b304c03", // Long Sang Website
};

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

// ===========================================
// HELPERS
// ===========================================
function computeHash(content) {
  return crypto
    .createHash("md5")
    .update(content || "")
    .digest("hex");
}

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

  const contentLength = response.headers.get("content-length");
  if (options.method === "DELETE" || contentLength === "0") {
    return null;
  }

  return response.json();
}

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000),
  });
  return response.data[0]?.embedding;
}

// ===========================================
// COMMANDS
// ===========================================

// ADD knowledge
async function cmdAdd(title, content, tags = []) {
  console.log(`\n📝 Adding knowledge: "${title}"`);

  // Generate embedding immediately
  console.log("   ⏳ Generating embedding...");
  const embedding = await generateEmbedding(title + "\n" + content);

  if (!embedding) {
    console.log("   ❌ Failed to generate embedding");
    return;
  }

  const result = await supabaseRest("brain_knowledge", {
    method: "POST",
    body: JSON.stringify({
      domain_id: config.DOMAIN_ID,
      title,
      content,
      content_type: "document",
      tags,
      embedding: `[${embedding.join(",")}]`,
      metadata: {
        contentHash: computeHash(content),
        source: "brain-cli",
        addedAt: new Date().toISOString(),
      },
      importance_score: 80,
    }),
  });

  console.log(`   ✅ Added with ID: ${result[0]?.id}`);
  console.log(`   📊 Embedding dims: ${embedding.length}`);
}

// EMBED all missing
async function cmdEmbed() {
  console.log("\n🧠 Embedding missing knowledge...");

  const all = await supabaseRest("brain_knowledge?select=id,title,content,metadata,embedding");
  const needsEmbed = all.filter(
    (x) => !x.embedding || computeHash(x.content) !== x.metadata?.contentHash
  );

  if (needsEmbed.length === 0) {
    console.log("   ✅ All knowledge already has embeddings!");
    return;
  }

  console.log(`   📝 Found ${needsEmbed.length} items needing embedding`);

  for (const item of needsEmbed) {
    console.log(`   ⏳ ${item.title.substring(0, 50)}...`);
    const embedding = await generateEmbedding(item.title + "\n" + item.content);

    if (embedding) {
      await supabaseRest(`brain_knowledge?id=eq.${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          embedding: `[${embedding.join(",")}]`,
          metadata: { ...item.metadata, contentHash: computeHash(item.content) },
          updated_at: new Date().toISOString(),
        }),
      });
      console.log(`   ✅ Done`);
    }
  }

  console.log("\n   🎉 Embedding complete!");
}

// SEARCH knowledge
async function cmdSearch(query) {
  console.log(`\n🔍 Searching: "${query}"`);

  // Generate query embedding
  const embedding = await generateEmbedding(query);
  if (!embedding) {
    console.log("   ❌ Failed to generate embedding");
    return;
  }

  // Call brain_search
  const result = await fetch(`${config.SUPABASE_URL}/rest/v1/rpc/brain_search`, {
    method: "POST",
    headers: {
      apikey: config.SUPABASE_KEY,
      Authorization: `Bearer ${config.SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      embedding_text: `[${embedding.join(",")}]`,
      threshold: 0.15,
      max_results: 5,
    }),
  });

  const data = await result.json();

  if (!data?.length) {
    console.log("   ❌ No matches found");
    return;
  }

  console.log(`\n   📊 Found ${data.length} matches:\n`);
  data.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.title}`);
    console.log(`      Similarity: ${(item.similarity * 100).toFixed(1)}%`);
    console.log(`      Preview: ${item.content.substring(0, 100)}...`);
    console.log();
  });
}

// STATS
async function cmdStats() {
  console.log("\n📊 Brain Knowledge Stats:");

  const all = await supabaseRest("brain_knowledge?select=id,title,content_type,embedding,tags");
  const withEmbed = all.filter((x) => x.embedding);

  console.log(`   Total: ${all.length}`);
  console.log(`   With embedding: ${withEmbed.length}`);
  console.log(`   Without embedding: ${all.length - withEmbed.length}`);

  const byType = all.reduce((acc, x) => {
    acc[x.content_type] = (acc[x.content_type] || 0) + 1;
    return acc;
  }, {});

  console.log("\n   By type:");
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`      ${type}: ${count}`);
  });
}

// ===========================================
// MAIN
// ===========================================
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  switch (cmd) {
    case "add": {
      const title = args[1];
      const content = args[2];
      const tagsArg = args.find((a) => a.startsWith("--tags="));
      const tags = tagsArg ? tagsArg.replace("--tags=", "").split(",") : [];

      if (!title || !content) {
        console.log('Usage: node brain-cli.cjs add "Title" "Content" --tags=tag1,tag2');
        return;
      }
      await cmdAdd(title, content, tags);
      break;
    }

    case "embed":
      await cmdEmbed();
      break;

    case "search": {
      const query = args[1];
      if (!query) {
        console.log('Usage: node brain-cli.cjs search "your query"');
        return;
      }
      await cmdSearch(query);
      break;
    }

    case "stats":
      await cmdStats();
      break;

    default:
      console.log(`
🧠 Brain CLI - Knowledge Management

Commands:
  add "Title" "Content" --tags=tag1,tag2   Add new knowledge
  embed                                     Generate missing embeddings
  search "query"                            Search knowledge base
  stats                                     Show statistics

Examples:
  node scripts/brain-cli.cjs add "Pricing FAQ" "Website từ 5 triệu..."
  node scripts/brain-cli.cjs search "giá website"
  node scripts/brain-cli.cjs stats
`);
  }
}

main().catch(console.error);
