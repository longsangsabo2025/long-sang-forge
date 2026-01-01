/**
 * Simplify Plan Features Structure
 * Boolean + Number only - no complex strings
 *
 * Run: node scripts/simplify-plan-features.cjs
 */

const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

// Simplified features structure
const SIMPLIFIED_FEATURES = {
  free: {
    // Boolean features
    showcase_premium: false, // Xem showcase cao cấp
    investment_access: false, // Mở khóa thông tin đầu tư
    priority_support: false, // Hỗ trợ ưu tiên
    community_pro: false, // Cộng đồng Pro/VIP
    beta_access: false, // Truy cập beta test
    direct_chat: false, // Chat trực tiếp với founder
    roadmap_strategy: false, // Xem chiến lược roadmap

    // Number features
    showcase_limit: 3, // Số dự án được xem (0 = none, -1 = unlimited)
    consultation_discount: 0, // % giảm giá tư vấn
    early_access_days: 0, // Số ngày truy cập sớm sản phẩm
    support_response_hours: 0, // Thời gian phản hồi (0 = không có)
  },

  pro: {
    // Boolean features
    showcase_premium: true,
    investment_access: false, // Chỉ notify, chưa full access
    priority_support: false,
    community_pro: true,
    beta_access: false,
    direct_chat: false,
    roadmap_strategy: false,

    // Number features
    showcase_limit: -1, // Unlimited standard projects
    consultation_discount: 10,
    early_access_days: 3,
    support_response_hours: 48,
  },

  vip: {
    // Boolean features
    showcase_premium: true,
    investment_access: true, // Full access + priority terms
    priority_support: true,
    community_pro: true,
    beta_access: true,
    direct_chat: true,
    roadmap_strategy: true,

    // Number features
    showcase_limit: -1, // Unlimited + source hints
    consultation_discount: 20,
    early_access_days: 7,
    support_response_hours: 24,
  },
};

async function main() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase\n");

    console.log("📋 SIMPLIFIED FEATURES STRUCTURE:");
    console.log("─".repeat(50));

    for (const [planId, features] of Object.entries(SIMPLIFIED_FEATURES)) {
      console.log(`\n${planId.toUpperCase()}:`);

      // Boolean features
      const booleans = Object.entries(features)
        .filter(([_, v]) => typeof v === "boolean")
        .map(([k, v]) => `  ${v ? "✓" : "✗"} ${k}`);
      console.log("  Boolean:", booleans.length);
      booleans.forEach((b) => console.log(b));

      // Number features
      const numbers = Object.entries(features)
        .filter(([_, v]) => typeof v === "number")
        .map(([k, v]) => `  ${k}: ${v === -1 ? "∞" : v}`);
      console.log("  Numbers:", numbers.length);
      numbers.forEach((n) => console.log(n));
    }

    console.log("\n" + "─".repeat(50));
    console.log("🔄 Updating database...\n");

    // Update each plan
    for (const [planId, features] of Object.entries(SIMPLIFIED_FEATURES)) {
      const result = await client.query(
        `UPDATE subscription_plans
         SET features = $1::jsonb, updated_at = NOW()
         WHERE id = $2
         RETURNING id, name`,
        [JSON.stringify(features), planId]
      );

      if (result.rows.length > 0) {
        console.log(`✅ Updated: ${result.rows[0].name}`);
      } else {
        console.log(`⚠️ Plan not found: ${planId}`);
      }
    }

    // Verify
    console.log("\n📊 Verification:");
    const verify = await client.query(
      `SELECT id, name, features FROM subscription_plans ORDER BY sort_order`
    );

    verify.rows.forEach((row) => {
      const featureCount = Object.keys(row.features).length;
      const boolCount = Object.values(row.features).filter((v) => typeof v === "boolean").length;
      const numCount = Object.values(row.features).filter((v) => typeof v === "number").length;
      console.log(`  ${row.name}: ${featureCount} features (${boolCount} bool, ${numCount} num)`);
    });

    console.log("\n🎉 Done! Features simplified successfully.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main();
