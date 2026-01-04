require("dotenv").config();
const { Client } = require("pg");

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await c.connect();

  // Check column definition
  const col = await c.query(`
    SELECT atttypmod
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    WHERE c.relname = 'brain_knowledge' AND a.attname = 'embedding'
  `);
  console.log("Column typmod (dimension + 4):", col.rows[0]?.atttypmod);
  // typmod = dimension + 4, so 3076 means 3072 dims, 1540 means 1536 dims

  // Check actual data dimensions
  const dims = await c.query(`
    SELECT vector_dims(embedding) as dims
    FROM brain_knowledge
    WHERE embedding IS NOT NULL
    LIMIT 1
  `);
  console.log("Actual data dimensions:", dims.rows[0]?.dims);

  // Check column type definition
  const typedef = await c.query(`
    SELECT column_name, udt_name,
           pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
    FROM information_schema.columns c
    JOIN pg_attribute a ON a.attname = c.column_name
    JOIN pg_class t ON t.relname = c.table_name AND a.attrelid = t.oid
    WHERE c.table_name = 'brain_knowledge' AND c.column_name = 'embedding'
  `);
  console.log("Column definition:", typedef.rows[0]?.data_type);

  await c.end();
}

main().catch((e) => console.error("Error:", e.message));
