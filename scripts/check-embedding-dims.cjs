const { Client } = require("pg");

const c = new Client({
  connectionString:
    "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await c.connect();

  // Check column dimension
  const r = await c.query(`
    SELECT atttypmod FROM pg_attribute
    WHERE attrelid = 'brain_knowledge'::regclass AND attname = 'embedding'
  `);
  const typmod = r.rows[0]?.atttypmod;
  console.log("Embedding typmod:", typmod, "(dimensions =", typmod - 4, ")");

  // Check actual data dimension
  const r2 = await c.query(`
    SELECT array_length(embedding::real[], 1) as dim
    FROM brain_knowledge WHERE embedding IS NOT NULL LIMIT 1
  `);
  console.log("Actual data dimensions:", r2.rows[0]?.dim);

  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
