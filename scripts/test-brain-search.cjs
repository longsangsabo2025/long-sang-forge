require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function testBrainSearch() {
  console.log("Testing brain_search like Edge Function does...\n");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const openai = new OpenAI({ apiKey: OPENAI_KEY });

  // Generate embedding
  const query = "Long Sang cung cap dich vu gi?";
  console.log("Query:", query);

  const embRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const embedding = embRes.data[0]?.embedding;
  console.log("Embedding dims:", embedding?.length);

  // Format like Edge Function
  const embeddingText = `[${embedding.join(",")}]`;
  console.log("Embedding text length:", embeddingText.length);
  console.log("First 50 chars:", embeddingText.substring(0, 50));

  // Call brain_search
  console.log("\nCalling brain_search...");
  const result = await supabase.rpc("brain_search", {
    embedding_text: embeddingText,
    threshold: 0.3,
    max_results: 5,
  });

  if (result.error) {
    console.log("ERROR:", result.error.message);
    console.log("Full error:", result.error);
  } else {
    console.log("SUCCESS! Found", result.data?.length, "matches");
    result.data?.forEach((r) => console.log("  -", r.title, "|", r.similarity?.toFixed(3)));
  }
}

testBrainSearch().catch((e) => console.error("Error:", e.message));
