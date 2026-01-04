/**
 * Brain Analytics - Monitor knowledge search performance
 * ======================================================
 * Track và analyze hiệu quả của knowledge base
 *
 * Run: node scripts/brain-analytics.cjs
 */

require("dotenv").config();

const config = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
};

// ===========================================
// SUPABASE REST API
// ===========================================
async function supabaseRest(endpoint, options = {}) {
  const url = `${config.SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      apikey: config.SUPABASE_KEY,
      Authorization: `Bearer ${config.SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ===========================================
// ANALYTICS
// ===========================================
async function runAnalytics() {
  console.log("📊 BRAIN ANALYTICS DASHBOARD");
  console.log("=".repeat(60));

  // 1. Knowledge Stats
  console.log("\n🧠 KNOWLEDGE BASE STATS:");
  console.log("-".repeat(40));

  const allKnowledge = await supabaseRest(
    "brain_knowledge?select=id,title,content_type,embedding,tags,importance_score,access_count,created_at"
  );

  const withEmbedding = allKnowledge.filter((x) => x.embedding);
  const withoutEmbedding = allKnowledge.filter((x) => !x.embedding);

  console.log(`   Total documents: ${allKnowledge.length}`);
  console.log(`   ✅ With embedding: ${withEmbedding.length}`);
  console.log(`   ⚠️ Without embedding: ${withoutEmbedding.length}`);

  // By content type
  const byType = allKnowledge.reduce((acc, x) => {
    acc[x.content_type] = (acc[x.content_type] || 0) + 1;
    return acc;
  }, {});

  console.log("\n   By content type:");
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`      ${type}: ${count}`);
    });

  // By tags
  const tagCounts = {};
  allKnowledge.forEach((k) => {
    (k.tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  console.log("\n   Top tags:");
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([tag, count]) => {
      console.log(`      ${tag}: ${count}`);
    });

  // 2. Token Usage Stats
  console.log("\n💰 TOKEN USAGE STATS (last 7 days):");
  console.log("-".repeat(40));

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const tokenUsage = await supabaseRest(`token_usage?select=*&created_at=gte.${sevenDaysAgo}`);

    if (tokenUsage.length > 0) {
      const totalTokens = tokenUsage.reduce((sum, x) => sum + (x.total_tokens || 0), 0);
      const totalCost = tokenUsage.reduce((sum, x) => sum + (x.cost_usd || 0), 0);
      const uniqueUsers = new Set(tokenUsage.map((x) => x.user_id)).size;

      console.log(`   Total requests: ${tokenUsage.length}`);
      console.log(`   Unique users: ${uniqueUsers}`);
      console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
      console.log(`   Total cost: $${totalCost.toFixed(4)}`);
      console.log(`   Avg tokens/request: ${Math.round(totalTokens / tokenUsage.length)}`);

      // By intent
      const byIntent = tokenUsage.reduce((acc, x) => {
        acc[x.intent || "unknown"] = (acc[x.intent || "unknown"] || 0) + 1;
        return acc;
      }, {});

      console.log("\n   By intent:");
      Object.entries(byIntent)
        .sort((a, b) => b[1] - a[1])
        .forEach(([intent, count]) => {
          console.log(`      ${intent}: ${count}`);
        });
    } else {
      console.log("   No token usage data in last 7 days");
    }
  } catch (err) {
    console.log("   Token usage table not available");
  }

  // 3. Knowledge Gaps (items without embedding)
  if (withoutEmbedding.length > 0) {
    console.log("\n⚠️ KNOWLEDGE GAPS (no embedding):");
    console.log("-".repeat(40));
    withoutEmbedding.slice(0, 10).forEach((k) => {
      console.log(`   - ${k.title.substring(0, 50)}...`);
    });
    if (withoutEmbedding.length > 10) {
      console.log(`   ... and ${withoutEmbedding.length - 10} more`);
    }
    console.log("\n   💡 Run: node scripts/brain-auto-embed.cjs");
  }

  // 4. Recommendations
  console.log("\n💡 RECOMMENDATIONS:");
  console.log("-".repeat(40));

  const recommendations = [];

  if (withoutEmbedding.length > 0) {
    recommendations.push(`Generate embeddings for ${withoutEmbedding.length} items`);
  }

  if (allKnowledge.length < 50) {
    recommendations.push("Add more knowledge (target: 100+ documents)");
  }

  if (!tagCounts["pricing"] || tagCounts["pricing"] < 3) {
    recommendations.push("Add more pricing-related content");
  }

  if (!tagCounts["faq"] || tagCounts["faq"] < 5) {
    recommendations.push("Add more FAQ content");
  }

  if (recommendations.length === 0) {
    recommendations.push("Knowledge base looks good! 🎉");
  }

  recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  console.log("\n" + "=".repeat(60));
}

runAnalytics().catch(console.error);
