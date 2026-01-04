/**
 * Regenerate embeddings for feature-user docs
 * Vì đã update content nhưng embedding cũ không còn match
 */

const config = require("./_config.cjs");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateEmbedding(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

async function regenerateEmbeddings() {
  console.log("🚀 Regenerating embeddings for feature-user docs...\n");

  const supabase = config.getSupabaseClient();

  // Get all feature-user docs
  const { data: docs, error } = await supabase
    .from("knowledge_base")
    .select("id, title, content")
    .eq("category", "feature-user");

  if (error) {
    console.log("Error fetching docs:", error.message);
    return;
  }

  console.log(`Found ${docs.length} docs to update\n`);

  let updated = 0;
  let errors = 0;

  for (const doc of docs) {
    try {
      // Generate new embedding
      const embedding = await generateEmbedding(doc.content);

      // Convert to pgvector text format
      const embeddingText = `[${embedding.join(",")}]`;

      // Update in DB
      const { error: updateErr } = await supabase
        .from("knowledge_base")
        .update({ embedding: embeddingText })
        .eq("id", doc.id);

      if (updateErr) throw updateErr;

      console.log(`✅ ${doc.title}`);
      updated++;

      // Rate limit - longer delay
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.log(`❌ ${doc.title}: ${err.message}`);
      errors++;
      // Wait longer on error
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Also update the product doc for Second Brain
  try {
    const { data: productDoc } = await supabase
      .from("knowledge_base")
      .select("id, title, content")
      .eq("category", "product")
      .ilike("title", "%second brain%")
      .single();

    if (productDoc) {
      const embedding = await generateEmbedding(productDoc.content);
      const embeddingText = `[${embedding.join(",")}]`;

      await supabase
        .from("knowledge_base")
        .update({ embedding: embeddingText })
        .eq("id", productDoc.id);

      console.log(`✅ ${productDoc.title} (product)`);
      updated++;
    }
  } catch (err) {
    console.log(`❌ Product doc: ${err.message}`);
    errors++;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);
  console.log("=".repeat(50));
}

regenerateEmbeddings().catch(console.error);
