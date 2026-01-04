require("dotenv").config();
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testRPC() {
  console.log("Testing Supabase SDK RPC...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get a sample embedding from DB first
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  // Get raw array
  const embResult = await c.query(`
    SELECT embedding FROM brain_knowledge
    WHERE embedding IS NOT NULL LIMIT 1
  `);
  const embArray = embResult.rows[0]?.embedding;
  console.log("Embedding type:", typeof embArray);
  console.log("First 3 values:", embArray?.slice(0, 3));

  // Test with array joined as string like Edge Function does
  const embStr = `[${embArray.join(",")}]`;
  console.log("\nTest embedding format:", embStr.substring(0, 50), "...");
  console.log("Length:", embStr.length);

  // Test search_knowledge
  console.log("\n1. Testing with array format [x,y,z]...");
  const result1 = await supabase.rpc("search_knowledge", {
    query_embedding: embStr,
    match_threshold: 0.3,
    match_count: 3,
  });

  if (result1.error) {
    console.log("ERROR:", result1.error.message);
  } else {
    console.log("OK:", result1.data?.length, "results");
    result1.data?.forEach((r) => console.log(" -", r.title, "| sim:", r.similarity?.toFixed(3)));
  }

  await c.end();
}

testRPC().catch((e) => console.error("Error:", e.message));
