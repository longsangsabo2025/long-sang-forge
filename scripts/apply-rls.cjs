const { createClient } = require("@supabase/supabase-js");
const config = require("./_config.cjs");

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

async function applyRLS() {
  console.log("🔧 Applying RLS policies for saved_features...\n");

  const policies = [
    {
      name: "Users can view own saved features",
      sql: `CREATE POLICY "Users can view own saved features" ON saved_features FOR SELECT USING (auth.uid() = user_id);`,
    },
    {
      name: "Users can insert own saved features",
      sql: `CREATE POLICY "Users can insert own saved features" ON saved_features FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    },
    {
      name: "Users can update own saved features",
      sql: `CREATE POLICY "Users can update own saved features" ON saved_features FOR UPDATE USING (auth.uid() = user_id);`,
    },
    {
      name: "Users can delete own saved features",
      sql: `CREATE POLICY "Users can delete own saved features" ON saved_features FOR DELETE USING (auth.uid() = user_id);`,
    },
  ];

  // Enable RLS first
  console.log("1. Enabling RLS on saved_features...");
  const { error: rlsError } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE saved_features ENABLE ROW LEVEL SECURITY;",
  });

  if (rlsError) {
    // Try direct SQL via REST API (need to use service role key)
    console.log("   Using direct approach...");

    // Use fetch to Supabase REST API
    const response = await fetch(`${config.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: config.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${config.SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: "ALTER TABLE saved_features ENABLE ROW LEVEL SECURITY;",
      }),
    });

    if (!response.ok) {
      console.log("   ⚠️ Cannot enable RLS via API, might need manual SQL");
      console.log("\n📋 Run this SQL in Supabase Dashboard SQL Editor:\n");
      console.log("ALTER TABLE saved_features ENABLE ROW LEVEL SECURITY;");
      policies.forEach((p) => console.log(p.sql));
      return;
    }
  }

  console.log("   ✅ RLS enabled");

  // Apply each policy
  for (const policy of policies) {
    console.log(`2. Creating policy: ${policy.name}...`);
    const { error } = await supabase.rpc("exec_sql", { sql: policy.sql });
    if (error) {
      if (error.message.includes("already exists")) {
        console.log(`   ⏭️ Already exists`);
      } else {
        console.log(`   ❌ ${error.message}`);
      }
    } else {
      console.log(`   ✅ Created`);
    }
  }

  console.log("\n✅ Done! Please refresh the app and try saving a feature.");
}

applyRLS();
