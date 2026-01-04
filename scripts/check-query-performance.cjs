/**
 * Check Query Performance & Indexes
 * Run: node scripts/check-query-performance.cjs
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPerformance() {
  console.log("🔍 QUERY PERFORMANCE CHECK\n");
  console.log("=".repeat(60));

  // 1. Check existing indexes
  console.log("\n📊 1. CHECKING INDEXES ON SUBSCRIPTION TABLES...\n");

  const { data: indexes, error: indexError } = await supabase.rpc("exec_sql", {
    sql: `
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename IN ('user_subscriptions', 'chat_credits', 'subscription_plans', 'discount_codes')
      ORDER BY tablename, indexname;
    `,
  });

  if (indexError) {
    console.log("⚠️ Cannot query indexes directly, checking via information schema...");

    // Alternative check
    const tables = ["user_subscriptions", "chat_credits", "subscription_plans"];
    for (const table of tables) {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      console.log(`   📁 ${table}: ${count || 0} rows`);
    }
  } else {
    console.log("Indexes found:");
    indexes?.forEach((idx) => {
      console.log(`   ✅ ${idx.tablename}.${idx.indexname}`);
    });
  }

  // 2. Check query times
  console.log("\n⏱️  2. TESTING QUERY PERFORMANCE...\n");

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
    {
      name: "Get expiring subscriptions (7 days)",
      fn: async () => {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        return supabase
          .from("user_subscriptions")
          .select("*")
          .eq("status", "active")
          .lte("expires_at", sevenDaysFromNow.toISOString())
          .gte("expires_at", new Date().toISOString());
      },
    },
  ];

  for (const query of queries) {
    const start = Date.now();
    const result = await query.fn();
    const duration = Date.now() - start;

    const status = duration < 100 ? "🟢" : duration < 300 ? "🟡" : "🔴";
    console.log(`   ${status} ${query.name}: ${duration}ms`);

    if (result.error) {
      console.log(`      ❌ Error: ${result.error.message}`);
    }
  }

  // 3. Recommendations
  console.log("\n💡 3. RECOMMENDATIONS\n");

  const recommendations = [];

  // Check if indexes exist
  const { data: subCount } = await supabase
    .from("user_subscriptions")
    .select("*", { count: "exact", head: true });

  if (subCount > 100) {
    recommendations.push("Consider adding index on user_subscriptions(user_id, status)");
    recommendations.push(
      "Consider adding index on user_subscriptions(expires_at) for expiry queries"
    );
  }

  // Check chat_credits table
  const { data: creditCount } = await supabase
    .from("chat_credits")
    .select("*", { count: "exact", head: true });

  if (creditCount > 1000) {
    recommendations.push("Consider adding composite index on chat_credits(user_id, period_start)");
  }

  if (recommendations.length === 0) {
    console.log("   ✅ No immediate optimizations needed");
  } else {
    recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }

  // 4. Create optimization migration if needed
  console.log("\n📝 4. SUGGESTED INDEXES (if needed)\n");

  const indexSQL = `
-- Performance optimization indexes
-- Run only if queries are slow

-- Index for user subscription lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
ON user_subscriptions(user_id, status);

-- Index for expiring subscriptions query
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires
ON user_subscriptions(expires_at)
WHERE status = 'active';

-- Index for chat credits lookup
CREATE INDEX IF NOT EXISTS idx_chat_credits_user_period
ON chat_credits(user_id, period_start DESC);

-- Index for payment transactions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment
ON user_subscriptions(payment_transaction_id)
WHERE payment_transaction_id IS NOT NULL;
`;

  console.log(indexSQL);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Performance check complete!");
}

checkPerformance().catch(console.error);
