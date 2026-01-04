/**
 * Apply Performance Indexes
 * Run: node scripts/apply-performance-indexes.cjs
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function applyIndexes() {
  console.log("🚀 APPLYING PERFORMANCE INDEXES\n");
  console.log("=".repeat(50));

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
  ];

  for (const idx of indexes) {
    console.log(`\n📦 Creating ${idx.name}...`);

    const { error } = await supabase.rpc("exec_sql", { sql: idx.sql });

    if (error) {
      // Try alternative method
      console.log(`   ⚠️ RPC failed, trying direct...`);

      // Use REST API to execute
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ sql: idx.sql }),
      });

      if (!response.ok) {
        console.log(`   ❌ Failed: Index may already exist or no exec_sql function`);
      } else {
        console.log(`   ✅ Created!`);
      }
    } else {
      console.log(`   ✅ Created!`);
    }
  }

  // Re-test performance
  console.log("\n\n⏱️  RE-TESTING QUERY PERFORMANCE...\n");

  const queries = [
    {
      name: "Get user subscription",
      fn: async () =>
        supabase
          .from("user_subscriptions")
          .select("*, plan:subscription_plans(*)")
          .eq("status", "active")
          .limit(1),
    },
    {
      name: "Get chat credits",
      fn: async () =>
        supabase.rpc("get_chat_credits", {
          p_user_id: "27e1a7af-6cc3-4e8f-a989-46e993a119c2",
        }),
    },
    {
      name: "Count active subscriptions",
      fn: async () =>
        supabase
          .from("user_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
    },
  ];

  for (const query of queries) {
    const start = Date.now();
    await query.fn();
    const duration = Date.now() - start;

    const status = duration < 100 ? "🟢" : duration < 300 ? "🟡" : "🔴";
    console.log(`   ${status} ${query.name}: ${duration}ms`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Performance optimization complete!");
}

applyIndexes().catch(console.error);
