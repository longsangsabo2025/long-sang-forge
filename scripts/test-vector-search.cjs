const { Client } = require("pg");

const c = new Client({
  connectionString:
    "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await c.connect();

  // Create a test embedding (1536 dims, all 0.01)
  const testEmbedding = Array(1536).fill(0.01);
  const embStr = "[" + testEmbedding.join(",") + "]";

  console.log("Testing match_knowledge directly via SQL...");
  console.log("Embedding dims:", testEmbedding.length);

  try {
    const result = await c.query(
      `
      SELECT id, title, 1 - (embedding <=> $1::vector) as similarity
      FROM brain_knowledge
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT 5
    `,
      [embStr]
    );

    console.log("\nDirect SQL Results:");
    for (const row of result.rows) {
      console.log(" -", row.title.substring(0, 50), "| similarity:", row.similarity);
    }
  } catch (e) {
    console.error("Direct SQL Error:", e.message);
  }

  // Also test the function directly
  console.log("\n\nTesting match_knowledge function...");
  try {
    const result = await c.query(
      `
      SELECT * FROM match_knowledge($1::vector, 0.3, 5, NULL)
    `,
      [embStr]
    );

    console.log("Function Results:", result.rows.length, "matches");
    for (const row of result.rows) {
      console.log(" -", row.title.substring(0, 50), "| similarity:", row.similarity);
    }
  } catch (e) {
    console.error("Function Error:", e.message);
  }

  await c.end();
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
