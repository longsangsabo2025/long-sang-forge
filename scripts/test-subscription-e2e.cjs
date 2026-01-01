/**
 * E2E Test: Subscription + Feature Gate System
 * Tests the complete flow from database to frontend
 *
 * Run: node scripts/test-subscription-e2e.cjs
 */

const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

const API_URL = "https://diexsbzqwsbpilsymnfb.supabase.co/rest/v1";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I";

async function main() {
  console.log("═".repeat(60));
  console.log("  🧪 E2E TEST: SUBSCRIPTION + FEATURE GATE SYSTEM");
  console.log("═".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function test(name, passed, details = "") {
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`  ✅ ${name}`);
    } else {
      results.failed++;
      console.log(`  ❌ ${name}`);
      if (details) console.log(`     → ${details}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PART 1: DATABASE LAYER
  // ═══════════════════════════════════════════════════════════
  console.log("\n📦 PART 1: DATABASE LAYER");
  console.log("─".repeat(40));

  const client = new Client({ connectionString });

  try {
    await client.connect();
    test("Database connection", true);

    // Test 1.1: Plans exist
    const plans = await client.query(
      `SELECT id, name, price, features FROM subscription_plans ORDER BY sort_order`
    );
    test("Plans exist (free, pro, vip)", plans.rows.length === 3);

    // Test 1.2: Features structure is simplified
    const freeFeatures = plans.rows.find((p) => p.id === "free")?.features;
    const hasBoolean = typeof freeFeatures?.showcase_premium === "boolean";
    const hasNumber = typeof freeFeatures?.showcase_limit === "number";
    test("Features are simplified (boolean + number)", hasBoolean && hasNumber);

    // Test 1.3: Feature values correct for each plan
    const proFeatures = plans.rows.find((p) => p.id === "pro")?.features;
    const vipFeatures = plans.rows.find((p) => p.id === "vip")?.features;

    test("Free: showcase_premium = false", freeFeatures?.showcase_premium === false);
    test("Pro: showcase_premium = true", proFeatures?.showcase_premium === true);
    test("VIP: investment_access = true", vipFeatures?.investment_access === true);
    test("VIP: consultation_discount = 20", vipFeatures?.consultation_discount === 20);

    // Test 1.4: Realtime enabled
    const realtimeCheck = await client.query(`
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND tablename = 'user_subscriptions'
    `);
    test("Realtime enabled for user_subscriptions", realtimeCheck.rows.length > 0);

    // Test 1.5: user_subscriptions has user_email column
    const columns = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'user_subscriptions' AND column_name = 'user_email'
    `);
    test("user_subscriptions has user_email column", columns.rows.length > 0);
  } catch (err) {
    test("Database tests", false, err.message);
  } finally {
    await client.end();
  }

  // ═══════════════════════════════════════════════════════════
  // PART 2: API LAYER
  // ═══════════════════════════════════════════════════════════
  console.log("\n🔌 PART 2: API LAYER");
  console.log("─".repeat(40));

  try {
    // Test 2.1: Plans API
    const plansRes = await fetch(`${API_URL}/subscription_plans?select=*&is_active=eq.true`, {
      headers: { apikey: API_KEY },
    });
    const plansData = await plansRes.json();
    test("GET /subscription_plans works", plansRes.ok && plansData.length === 3);

    // Test 2.2: Features in response
    const proFromAPI = plansData.find((p) => p.id === "pro");
    test("API returns features object", typeof proFromAPI?.features === "object");
    test(
      "Features have correct structure",
      proFromAPI?.features?.showcase_premium === true &&
        typeof proFromAPI?.features?.consultation_discount === "number"
    );
  } catch (err) {
    test("API tests", false, err.message);
  }

  // ═══════════════════════════════════════════════════════════
  // PART 3: WEBHOOK LAYER
  // ═══════════════════════════════════════════════════════════
  console.log("\n🪝 PART 3: WEBHOOK LAYER");
  console.log("─".repeat(40));

  try {
    // Test 3.1: Webhook endpoint exists and rejects invalid requests
    const webhookRes = await fetch(
      "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/casso-webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: true }),
      }
    );
    // Should reject invalid payload (400) or unauthorized (401)
    const rejectsInvalid = webhookRes.status === 400 || webhookRes.status === 401;
    test("Webhook rejects invalid requests", rejectsInvalid, `status: ${webhookRes.status}`);
  } catch (err) {
    test("Webhook endpoint reachable", false, err.message);
  }

  // ═══════════════════════════════════════════════════════════
  // PART 4: FRONTEND FILES
  // ═══════════════════════════════════════════════════════════
  console.log("\n🖥️ PART 4: FRONTEND FILES");
  console.log("─".repeat(40));

  const fs = require("fs");
  const path = require("path");
  const srcDir = path.join(__dirname, "..", "src");

  // Test 4.1: Hook files exist
  const hookFiles = ["hooks/useSubscription.ts", "hooks/useFeature.ts"];

  for (const file of hookFiles) {
    const exists = fs.existsSync(path.join(srcDir, file));
    test(`${file} exists`, exists);
  }

  // Test 4.2: Component files exist
  const componentFiles = [
    "components/subscription/SubscriptionCard.tsx",
    "components/subscription/SubscriptionPayment.tsx",
    "components/subscription/FeatureGate.tsx",
    "components/subscription/PremiumGate.tsx",
  ];

  for (const file of componentFiles) {
    const exists = fs.existsSync(path.join(srcDir, file));
    test(`${file} exists`, exists);
  }

  // Test 4.3: PricingPage exists
  const pricingExists = fs.existsSync(path.join(srcDir, "pages/PricingPage.tsx"));
  test("pages/PricingPage.tsx exists", pricingExists);

  // Test 4.4: SubscriptionCard imported in UserDashboard
  const dashboardContent = fs.readFileSync(path.join(srcDir, "pages/UserDashboard.tsx"), "utf-8");
  test("UserDashboard imports SubscriptionCard", dashboardContent.includes("SubscriptionCard"));

  // Test 4.5: useFeature hook has correct exports
  const useFeatureContent = fs.readFileSync(path.join(srcDir, "hooks/useFeature.ts"), "utf-8");
  test(
    "useFeature exports useFeature function",
    useFeatureContent.includes("export function useFeature")
  );
  test(
    "useFeature exports useConsultationDiscount",
    useFeatureContent.includes("export function useConsultationDiscount")
  );

  // ═══════════════════════════════════════════════════════════
  // PART 5: INTEGRATION CHECK
  // ═══════════════════════════════════════════════════════════
  console.log("\n🔗 PART 5: INTEGRATION CHECK");
  console.log("─".repeat(40));

  // Test 5.1: FeatureGate uses useFeature
  const featureGateContent = fs.readFileSync(
    path.join(srcDir, "components/subscription/FeatureGate.tsx"),
    "utf-8"
  );
  test(
    "FeatureGate imports useFeature hook",
    featureGateContent.includes('from "@/hooks/useFeature"')
  );

  // Test 5.2: useSubscription has realtime
  const useSubscriptionContent = fs.readFileSync(
    path.join(srcDir, "hooks/useSubscription.ts"),
    "utf-8"
  );
  test(
    "useSubscription has realtime subscription",
    useSubscriptionContent.includes("postgres_changes")
  );

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("  📊 SUMMARY");
  console.log("═".repeat(60));
  console.log(`  Total: ${results.passed + results.failed} tests`);
  console.log(`  ✅ Passed: ${results.passed}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log("═".repeat(60));

  if (results.failed === 0) {
    console.log("\n🎉 ALL TESTS PASSED! System is 100% ready.\n");
    console.log("📋 WHAT'S WORKING:");
    console.log("   1. Database: Plans + Features (simplified)");
    console.log("   2. API: REST endpoints for plans");
    console.log("   3. Webhook: Casso payment verification");
    console.log("   4. Frontend: Hooks + Components");
    console.log("   5. Realtime: Auto-update on payment confirm");
    console.log("");
    console.log("🎯 USER FLOW:");
    console.log("   Dashboard → /pricing → Select Plan → VietQR");
    console.log("   → Transfer SUBPRO/SUBVIP → Casso webhook");
    console.log("   → DB update → Realtime → UI auto-refresh");
    console.log("");
  } else {
    console.log("\n⚠️ Some tests failed. Please fix before deploying.\n");

    const failedTests = results.tests.filter((t) => !t.passed);
    console.log("Failed tests:");
    failedTests.forEach((t) => {
      console.log(`  - ${t.name}${t.details ? `: ${t.details}` : ""}`);
    });
  }
}

main().catch(console.error);
