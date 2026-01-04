/**
 * Apply Performance Indexes via Transaction Pooler
 * Run: node scripts/apply-indexes-pooler.cjs
 */

const { Client } = require("pg");
require("dotenv").config();

async function applyIndexes() {
  console.log("🚀 APPLYING PERFORMANCE INDEXES VIA POOLER\n");
  console.log("=".repeat(60));

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to database via pooler\n");

    const indexes = [
      {
        name: "idx_user_subscriptions_user_status",
        sql: `CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
              ON user_subscriptions(user_id, status);`,
      },
      {
        name: "idx_user_subscriptions_expires",
        sql: `CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires
              ON user_subscriptions(expires_at)
              WHERE status = 'active';`,
      },
      {
        name: "idx_chat_credits_user_period",
        sql: `CREATE INDEX IF NOT EXISTS idx_chat_credits_user_period
              ON chat_credits(user_id, period_start DESC);`,
      },
      {
        name: "idx_user_subscriptions_payment",
        sql: `CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment
              ON user_subscriptions(payment_transaction_id)
              WHERE payment_transaction_id IS NOT NULL;`,
      },
      {
        name: "idx_user_subscriptions_created",
        sql: `CREATE INDEX IF NOT EXISTS idx_user_subscriptions_created
              ON user_subscriptions(created_at DESC);`,
      },
    ];

    for (const idx of indexes) {
      console.log(`📦 Creating ${idx.name}...`);
      try {
        await client.query(idx.sql);
        console.log(`   ✅ Created!`);
      } catch (err) {
        if (err.message.includes("already exists")) {
          console.log(`   ⚠️ Already exists`);
        } else {
          console.log(`   ❌ Error: ${err.message}`);
        }
      }
    }

    // Update statistics
    console.log("\n📊 Updating statistics...");
    await client.query("ANALYZE user_subscriptions;");
    await client.query("ANALYZE chat_credits;");
    await client.query("ANALYZE subscription_plans;");
    console.log("   ✅ Statistics updated!\n");

    // List all indexes
    console.log("📋 Current indexes on subscription tables:\n");
    const result = await client.query(`
      SELECT
        tablename,
        indexname
      FROM pg_indexes
      WHERE tablename IN ('user_subscriptions', 'chat_credits')
      ORDER BY tablename, indexname;
    `);

    result.rows.forEach((row) => {
      console.log(`   ${row.tablename}: ${row.indexname}`);
    });

    // Test query performance
    console.log("\n\n⏱️  TESTING QUERY PERFORMANCE...\n");

    const queries = [
      {
        name: "Get user subscription",
        sql: `SELECT * FROM user_subscriptions WHERE user_id = '27e1a7af-6cc3-4e8f-a989-46e993a119c2' AND status = 'active' LIMIT 1;`,
      },
      {
        name: "Count active subscriptions",
        sql: `SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active';`,
      },
      {
        name: "Get expiring (7 days)",
        sql: `SELECT * FROM user_subscriptions WHERE status = 'active' AND expires_at <= NOW() + INTERVAL '7 days';`,
      },
    ];

    for (const query of queries) {
      const start = Date.now();
      await client.query(query.sql);
      const duration = Date.now() - start;

      const status = duration < 50 ? "🟢" : duration < 150 ? "🟡" : "🔴";
      console.log(`   ${status} ${query.name}: ${duration}ms`);
    }
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    await client.end();
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Performance optimization complete!");
}

applyIndexes();
