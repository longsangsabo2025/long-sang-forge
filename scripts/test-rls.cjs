const { createClient } = require("@supabase/supabase-js");
const config = require("./_config.cjs");

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

async function test() {
  console.log("🔍 Testing saved_features table...\n");

  // 1. Test SELECT với service key
  const { data: selectData, error: selectError } = await supabase
    .from("saved_features")
    .select("*")
    .limit(5);

  console.log("1. SELECT (service key):", selectError ? "❌ " + selectError.message : "✅ OK");
  console.log("   Records:", selectData?.length || 0);

  // 2. Test INSERT với service key
  const testInsert = {
    user_id: "test-user-id",
    showcase_slug: "test-slug",
    showcase_name: "Test",
    feature_index: 0,
    feature_title: "Test Feature",
    feature_points: ["Point 1"],
    priority: "medium",
    status: "saved",
  };

  const { error: insertError } = await supabase.from("saved_features").insert(testInsert);

  console.log("\n2. INSERT (service key):", insertError ? "❌ " + insertError.message : "✅ OK");

  // Cleanup test record
  if (!insertError) {
    await supabase.from("saved_features").delete().eq("user_id", "test-user-id");
    console.log("   Cleaned up test record");
  }

  // 3. Check RLS status
  console.log("\n3. Checking RLS policies...");
  const { data: policies, error: policyError } = await supabase.rpc("exec_sql", {
    sql: `
      SELECT schemaname, tablename, policyname, cmd, qual
      FROM pg_policies 
      WHERE tablename = 'saved_features'
    `,
  });

  if (policyError) {
    console.log("   Cannot query policies (normal if no exec_sql function)");
    console.log("\n⚠️  RLS policies might be missing!");
    console.log("   Run this SQL in Supabase Dashboard:\n");
    console.log(`
-- Enable RLS
ALTER TABLE saved_features ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own saved features
CREATE POLICY "Users can view own saved features" 
ON saved_features FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own saved features
CREATE POLICY "Users can insert own saved features" 
ON saved_features FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own saved features
CREATE POLICY "Users can update own saved features" 
ON saved_features FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own saved features
CREATE POLICY "Users can delete own saved features" 
ON saved_features FOR DELETE 
USING (auth.uid() = user_id);
    `);
  } else {
    console.log("   Policies:", policies);
  }
}

test();
