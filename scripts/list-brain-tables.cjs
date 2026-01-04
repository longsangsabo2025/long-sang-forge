/**
 * List brain-related tables
 */

require("dotenv").config();
const { Client } = require("pg");

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%brain%' OR table_name LIKE '%knowledge%')
    ORDER BY table_name
  `);

  console.log("Brain/Knowledge tables:");
  result.rows.forEach((r) => console.log("  -", r.table_name));

  await client.end();
}

run();
