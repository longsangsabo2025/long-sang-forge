// Fix RLS for token_usage - Direct SQL approach
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://diexsbzqwsbpilsymnfb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY"
);

async function testAndFix() {
  console.log("🔧 Testing token_usage table...\n");

  // Test 1: Check if table exists and can be read
  console.log("📊 Test 1: Read table...");
  const { data: readTest, error: readErr } = await supabase
    .from("token_usage")
    .select("id, model, total_tokens, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  if (readErr) {
    console.error("❌ Read failed:", readErr.message);
  } else {
    console.log("✅ Read OK, records:", readTest?.length || 0);
    if (readTest?.length > 0) {
      console.log("   Latest:", readTest[0]);
    }
  }

  // Test 2: Insert test record
  console.log("\n📝 Test 2: Insert record...");
  const testRecord = {
    user_id: "27e1a7af-6cc3-4e8f-a989-46e993a119c2",
    model: "gpt-4o-mini",
    prompt_tokens: 200,
    completion_tokens: 60,
    total_tokens: 260,
    cost_usd: 0.0000666,
    intent: "e2e-test",
    source: "brain-report",
  };

  const { data: insertTest, error: insertErr } = await supabase
    .from("token_usage")
    .insert(testRecord)
    .select();

  if (insertErr) {
    console.error("❌ Insert failed:", insertErr.message);
    console.log("   This might be an RLS issue");
  } else {
    console.log("✅ Insert OK:", insertTest[0]?.id);
  }

  // Test 3: Count total records
  console.log("\n📈 Test 3: Count all records...");
  const { count, error: countErr } = await supabase
    .from("token_usage")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    console.error("❌ Count failed:", countErr.message);
  } else {
    console.log("✅ Total records:", count);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 SUMMARY");
  console.log("=".repeat(50));
  console.log("Table exists:", !readErr);
  console.log("Can read:", !readErr);
  console.log("Can insert:", !insertErr);
  console.log("Total records:", count || "N/A");

  if (!insertErr) {
    console.log("\n✅ TOKEN_USAGE TABLE IS WORKING CORRECTLY!");
    console.log("   Edge Functions should be able to save tokens.");
  } else {
    console.log("\n⚠️ NEED TO FIX RLS IN SUPABASE DASHBOARD:");
    console.log("   1. Go to Supabase Dashboard > SQL Editor");
    console.log("   2. Run: ALTER TABLE token_usage DISABLE ROW LEVEL SECURITY;");
    console.log('   Or add policy: CREATE POLICY "allow_all" ON token_usage FOR ALL USING (true);');
  }
}

testAndFix();
