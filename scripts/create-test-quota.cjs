/**
 * Create test user brain quota
 */

require("dotenv").config();
const { Client } = require("pg");

async function createQuota() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("Connected");

  const userId = "27e1a7af-6cc3-4e8f-a989-46e993a119c2";

  try {
    const result = await client.query(
      `
      INSERT INTO user_brain_quotas
        (user_id, documents_count, queries_count, domains_count, max_documents, max_queries_per_month, max_domains)
      VALUES
        ($1, 0, 0, 0, 100, 200, 2)
      ON CONFLICT (user_id, month_year)
      DO UPDATE SET
        max_documents = 100,
        max_queries_per_month = 200,
        max_domains = 2
      RETURNING *
    `,
      [userId]
    );

    console.log("✅ Created quota:", JSON.stringify(result.rows[0], null, 2));
  } catch (e) {
    console.error("❌ Error:", e.message);
  }

  await client.end();
}

createQuota();
