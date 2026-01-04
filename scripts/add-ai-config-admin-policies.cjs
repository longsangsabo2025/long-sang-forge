// ================================================
// ADD ADMIN RLS POLICIES FOR AI CONFIG
// ================================================

const { Client } = require("pg");
require("dotenv").config();

async function addAdminPolicies() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Add UPDATE policy for admins
    const sql = `
      -- Drop existing update policy if any
      DROP POLICY IF EXISTS ai_config_admin_update ON ai_sales_config;

      -- Create update policy for admin users
      CREATE POLICY ai_config_admin_update ON ai_sales_config
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'owner')
        )
      );

      -- Also allow INSERT for admin
      DROP POLICY IF EXISTS ai_config_admin_insert ON ai_sales_config;
      CREATE POLICY ai_config_admin_insert ON ai_sales_config
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'owner')
        )
      );

      -- Allow DELETE for admin (for cleanup)
      DROP POLICY IF EXISTS ai_config_admin_delete ON ai_sales_config;
      CREATE POLICY ai_config_admin_delete ON ai_sales_config
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'owner')
        )
      );
    `;

    await client.query(sql);
    console.log("✅ Admin RLS policies added for ai_sales_config");
    console.log("   - UPDATE policy for admin/owner");
    console.log("   - INSERT policy for admin/owner");
    console.log("   - DELETE policy for admin/owner");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addAdminPolicies();
