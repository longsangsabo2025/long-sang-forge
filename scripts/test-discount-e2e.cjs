/**
 * E2E Test: Discount Code + Subscription Flow
 * Tests: SANGDEPTRAI 90% discount on subscription pricing
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TESTS = [];
let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    failed++;
  }
  TESTS.push({ name, passed: condition });
}

async function runTests() {
  console.log("🧪 E2E Test: Discount Code + Subscription Flow\n");
  console.log("=".repeat(60));

  // Test 1: Discount code exists in database
  console.log("\n📋 Test 1: Discount Code Exists");
  const { data: discountCode, error: discountError } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", "SANGDEPTRAI")
    .single();

  test("SANGDEPTRAI exists in database", !!discountCode && !discountError);
  test("Discount is 90%", discountCode?.discount_value === 90);
  test("Discount type is percent", discountCode?.discount_type === "percent");
  test("Is active", discountCode?.is_active === true);
  test("Applies to Pro plan", discountCode?.applicable_plans?.includes("pro"));
  test("Applies to VIP plan", discountCode?.applicable_plans?.includes("vip"));
  test("Applies to monthly", discountCode?.applicable_cycles?.includes("monthly"));
  test("Applies to yearly", discountCode?.applicable_cycles?.includes("yearly"));

  // Test 2: Validate discount code function
  console.log("\n📋 Test 2: Validate Discount Code RPC");
  const { data: validation, error: validationError } = await supabase.rpc(
    "validate_discount_code",
    {
      p_code: "SANGDEPTRAI",
      p_plan_id: "pro",
      p_billing_cycle: "monthly",
      p_amount: 99000,
    }
  );

  test("RPC validate_discount_code works", !validationError);

  // RPC returns array, get first item
  const validationResult = Array.isArray(validation) ? validation[0] : validation;

  if (validationResult) {
    test("Validation returns is_valid=true", validationResult.is_valid === true);
    test("Discount type is percent", validationResult.discount_type === "percent");

    // discount_value from RPC is the actual discount amount, not percentage
    const originalPrice = 99000;
    const expectedDiscount = Math.floor(originalPrice * 0.9); // 90%
    test(
      "Discount amount is ~90% of price",
      Math.abs(validationResult.discount_value - expectedDiscount) < 100
    );

    console.log(`\n  💰 Price Calculation (Pro Monthly):`);
    console.log(`     Original: ${originalPrice.toLocaleString()}đ`);
    console.log(`     Discount (90%): -${validationResult.discount_value?.toLocaleString()}đ`);
    console.log(`     Final: ${validationResult.final_amount?.toLocaleString()}đ`);
  } else if (validationError) {
    console.log(`  ⚠️  RPC Error: ${validationError.message}`);
  } else {
    console.log(`  ⚠️  No validation result returned`);
    console.log(`  Debug: validation =`, JSON.stringify(validation));
  }

  // Test 3: Subscription plans exist
  console.log("\n📋 Test 3: Subscription Plans");
  const { data: plans, error: plansError } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true);

  test("Can fetch subscription plans", !plansError);
  test("Has active plans", plans && plans.length > 0);

  if (plans) {
    const proPlan = plans.find((p) => p.id === "pro");
    const vipPlan = plans.find((p) => p.id === "vip");
    test("Pro plan exists", !!proPlan);
    test("VIP plan exists", !!vipPlan);

    if (proPlan) {
      console.log(`\n  📦 Pro Plan: ${proPlan.price?.toLocaleString()}đ/month`);
    }
    if (vipPlan) {
      console.log(`  📦 VIP Plan: ${vipPlan.price?.toLocaleString()}đ/month`);
    }
  }

  // Test 4: Test invalid discount code
  console.log("\n📋 Test 4: Invalid Discount Code");
  const { data: invalidValidation } = await supabase.rpc("validate_discount_code", {
    p_code: "INVALID_CODE_123",
    p_plan_id: "pro",
    p_billing_cycle: "monthly",
    p_amount: 99000,
  });

  const invalidResult = Array.isArray(invalidValidation) ? invalidValidation[0] : invalidValidation;
  test("Invalid code returns is_valid=false", invalidResult?.is_valid === false);

  // Test 5: Yearly pricing with discount
  console.log("\n📋 Test 5: Yearly Pricing with 90% Discount");
  const { data: yearlyValidation } = await supabase.rpc("validate_discount_code", {
    p_code: "SANGDEPTRAI",
    p_plan_id: "vip",
    p_billing_cycle: "yearly",
    p_amount: 1990000, // VIP yearly (199K * 10)
  });

  const yearlyResult = Array.isArray(yearlyValidation) ? yearlyValidation[0] : yearlyValidation;

  if (yearlyResult?.is_valid) {
    const originalYearly = 1990000;
    console.log(`\n  💰 Price Calculation (VIP Yearly):`);
    console.log(`     Original: ${originalYearly.toLocaleString()}đ`);
    console.log(`     Discount (90%): -${yearlyResult.discount_value?.toLocaleString()}đ`);
    console.log(`     Final: ${yearlyResult.final_amount?.toLocaleString()}đ`);
    test("Yearly discount works", yearlyResult.is_valid === true);
  } else {
    test("Yearly discount works", false);
    console.log(`  ⚠️  Yearly validation failed:`, yearlyResult?.error_message);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Test Results: ${passed}/${passed + failed} passed`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Discount code SANGDEPTRAI is ready for testing.\n");
    console.log("📝 How to test:");
    console.log("   1. Go to /subscription or /pricing");
    console.log("   2. Select Pro or VIP plan");
    console.log("   3. Enter code: SANGDEPTRAI");
    console.log("   4. See 90% discount applied!");
    console.log("   5. Complete payment with discounted price\n");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please check the issues above.\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
