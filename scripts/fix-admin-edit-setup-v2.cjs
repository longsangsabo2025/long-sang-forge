/**
 * ELON FIX V2: Auto-run SQL policies via transaction pooler
 *
 * Run: node scripts/fix-admin-edit-setup-v2.cjs
 */

require("dotenv").config();
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Missing DATABASE_URL in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function runSQL(sql, description) {
  try {
    await pool.query(sql);
    console.log(`   ✅ ${description}`);
    return true;
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log(`   ⏭️  ${description} (already exists)`);
      return true;
    }
    console.log(`   ⚠️  ${description}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 ELON FIX V2: Auto-setup via Transaction Pooler\n");

  // =========================================================================
  // STEP 1: Storage bucket policies
  // =========================================================================
  console.log("🔒 Step 1: Creating storage policies for 'showcase-assets'...");

  await runSQL(
    `
    CREATE POLICY "showcase_assets_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'showcase-assets');
  `,
    "Public read policy"
  );

  await runSQL(
    `
    CREATE POLICY "showcase_assets_auth_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'showcase-assets'
      AND auth.role() = 'authenticated'
    );
  `,
    "Authenticated upload policy"
  );

  await runSQL(
    `
    CREATE POLICY "showcase_assets_auth_update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'showcase-assets'
      AND auth.role() = 'authenticated'
    );
  `,
    "Authenticated update policy"
  );

  await runSQL(
    `
    CREATE POLICY "showcase_assets_auth_delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'showcase-assets'
      AND auth.role() = 'authenticated'
    );
  `,
    "Authenticated delete policy"
  );

  // =========================================================================
  // STEP 2: Ensure page_content table has correct RLS
  // =========================================================================
  console.log("\n📋 Step 2: Fixing page_content RLS policies...");

  // Drop old policies first
  await runSQL(
    `DROP POLICY IF EXISTS "page_content_read" ON public.page_content;`,
    "Drop old read policy"
  );
  await runSQL(
    `DROP POLICY IF EXISTS "page_content_admin_write" ON public.page_content;`,
    "Drop old write policy"
  );
  await runSQL(
    `DROP POLICY IF EXISTS "Allow public read" ON public.page_content;`,
    "Drop 'Allow public read'"
  );
  await runSQL(
    `DROP POLICY IF EXISTS "Allow admin write" ON public.page_content;`,
    "Drop 'Allow admin write'"
  );

  // Create new policies
  await runSQL(
    `
    CREATE POLICY "page_content_public_select"
    ON public.page_content FOR SELECT
    USING (true);
  `,
    "Public SELECT policy"
  );

  await runSQL(
    `
    CREATE POLICY "page_content_admin_insert"
    ON public.page_content FOR INSERT
    WITH CHECK (
      (SELECT email FROM auth.users WHERE id = auth.uid())
      IN ('longsangadmin@gmail.com', 'longsangsabo@gmail.com')
    );
  `,
    "Admin INSERT policy"
  );

  await runSQL(
    `
    CREATE POLICY "page_content_admin_update"
    ON public.page_content FOR UPDATE
    USING (
      (SELECT email FROM auth.users WHERE id = auth.uid())
      IN ('longsangadmin@gmail.com', 'longsangsabo@gmail.com')
    );
  `,
    "Admin UPDATE policy"
  );

  await runSQL(
    `
    CREATE POLICY "page_content_admin_delete"
    ON public.page_content FOR DELETE
    USING (
      (SELECT email FROM auth.users WHERE id = auth.uid())
      IN ('longsangadmin@gmail.com', 'longsangsabo@gmail.com')
    );
  `,
    "Admin DELETE policy"
  );

  // =========================================================================
  // STEP 3: Test query
  // =========================================================================
  console.log("\n🧪 Step 3: Testing page_content access...");

  try {
    const result = await pool.query("SELECT page_id, updated_at FROM public.page_content LIMIT 5");
    console.log(`   ✅ Query successful! Found ${result.rows.length} page(s)`);
    result.rows.forEach((row) => {
      console.log(`      - ${row.page_id} (updated: ${row.updated_at})`);
    });
  } catch (error) {
    console.log(`   ⚠️  Query failed: ${error.message}`);
  }

  await pool.end();
  console.log("\n✅ ELON FIX V2 COMPLETE! Reload your app.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  pool.end();
  process.exit(1);
});
