const { Client } = require("pg");
require("dotenv").config();

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await c.connect();
  console.log("Connected to DB via transaction pooler");

  // ===== SOLUTION: Use TEXT parameter instead of VECTOR =====
  // This bypasses PostgREST schema cache completely!
  console.log("\n1. Creating brain_search function (TEXT input - no cache issues)...");

  await c.query("DROP FUNCTION IF EXISTS public.brain_search CASCADE").catch(() => {});

  // Function accepts TEXT, casts to vector internally
  await c.query(`
    CREATE OR REPLACE FUNCTION brain_search(
      embedding_text text,
      threshold double precision DEFAULT 0.5,
      max_results integer DEFAULT 5,
      filter_domain_id uuid DEFAULT NULL
    )
    RETURNS TABLE (id uuid, domain_id uuid, title text, content text, similarity double precision)
    LANGUAGE plpgsql AS $$
    DECLARE
      query_vec vector(1536);
    BEGIN
      -- Cast text to vector inside function (bypasses PostgREST type cache)
      query_vec := embedding_text::vector(1536);

      RETURN QUERY
      SELECT bk.id, bk.domain_id, bk.title, bk.content,
             (1 - (bk.embedding <=> query_vec))::double precision AS similarity
      FROM brain_knowledge bk
      WHERE bk.embedding IS NOT NULL
        AND (filter_domain_id IS NULL OR bk.domain_id = filter_domain_id)
        AND 1 - (bk.embedding <=> query_vec) > threshold
      ORDER BY bk.embedding <=> query_vec
      LIMIT max_results;
    END; $$;
  `);

  await c.query(
    "GRANT EXECUTE ON FUNCTION brain_search(text, double precision, integer, uuid) TO authenticated, anon, service_role"
  );

  await c.query("NOTIFY pgrst, 'reload schema'");
  console.log("✅ brain_search created!");

  // Test via direct SQL
  console.log("\n2. Testing brain_search via SQL...");
  const test = await c.query(`
    SELECT title, similarity FROM brain_search(
      (SELECT embedding::text FROM brain_knowledge WHERE embedding IS NOT NULL LIMIT 1),
      0.3, 3
    )
  `);
  console.log("SQL Results:", test.rows.length, "matches");
  test.rows.forEach((r) => console.log("  -", r.title, "|", r.similarity.toFixed(3)));

  // Test via REST API (the real test!)
  console.log("\n3. Testing brain_search via REST API...");
  const embRow = await c.query(
    `SELECT embedding::text as emb FROM brain_knowledge WHERE embedding IS NOT NULL LIMIT 1`
  );
  const embText = embRow.rows[0].emb;

  const fetch = (await import("node-fetch")).default;
  const response = await fetch(
    "https://diexsbzqwsbpilsymnfb.supabase.co/rest/v1/rpc/brain_search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        embedding_text: embText,
        threshold: 0.3,
        max_results: 3,
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    console.log("✅ REST API Results:", data.length, "matches");
    data.forEach((r) => console.log("  -", r.title, "|", r.similarity.toFixed(3)));
  } else {
    const err = await response.text();
    console.log("❌ REST API Error:", err);
  }

  await c.end();
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
