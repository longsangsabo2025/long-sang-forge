const { createClient } = require("@supabase/supabase-js");
const config = require("./_config.cjs");

// Tạo client với service role để có quyền thực thi SQL
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
  db: { schema: "public" },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyRLS() {
  console.log("🔧 Applying RLS policies for saved_features via Postgres function...\n");

  // SQL commands to execute
  const sqlCommands = `
    -- Enable RLS
    ALTER TABLE IF EXISTS saved_features ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if any (to avoid conflicts)
    DROP POLICY IF EXISTS "Users can view own saved features" ON saved_features;
    DROP POLICY IF EXISTS "Users can insert own saved features" ON saved_features;
    DROP POLICY IF EXISTS "Users can update own saved features" ON saved_features;
    DROP POLICY IF EXISTS "Users can delete own saved features" ON saved_features;
    
    -- Create policies
    CREATE POLICY "Users can view own saved features" 
    ON saved_features FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own saved features" 
    ON saved_features FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own saved features" 
    ON saved_features FOR UPDATE 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete own saved features" 
    ON saved_features FOR DELETE 
    USING (auth.uid() = user_id);
  `;

  // Execute via database connection
  // Since we can't execute raw SQL directly, we need to use Supabase Dashboard
  // But let's check what we can do with the service key

  // Check if table exists
  const { data: tableCheck, error: tableError } = await supabase
    .from("saved_features")
    .select("id")
    .limit(0);

  if (tableError) {
    console.log("❌ Table saved_features does not exist or is not accessible");
    console.log("Error:", tableError.message);
    return;
  }

  console.log("✅ Table saved_features exists");

  // Try inserting a test record with service key (bypasses RLS)
  const testUserId = "00000000-0000-0000-0000-000000000001";
  const { error: insertError } = await supabase.from("saved_features").insert({
    user_id: testUserId,
    showcase_slug: "test",
    showcase_name: "Test",
    feature_index: 0,
    feature_title: "Test Feature",
    priority: "medium",
    status: "saved",
  });

  if (insertError) {
    console.log("⚠️ Insert test failed:", insertError.message);
  } else {
    console.log("✅ Service key insert works");
    // Clean up
    await supabase.from("saved_features").delete().eq("user_id", testUserId);
    console.log("✅ Cleaned up test record");
  }

  console.log("\n📋 IMPORTANT: Please run this SQL in Supabase Dashboard SQL Editor:");
  console.log("━".repeat(60));
  console.log(sqlCommands);
  console.log("━".repeat(60));
  console.log("\n🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new");
}

applyRLS();
