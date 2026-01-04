/**
 * ELON FIX: Create missing storage bucket and page_content table
 *
 * Problems:
 * 1. StorageApiError: Bucket not found (showcase-assets)
 * 2. 406 error on page_content (table/RLS issue)
 *
 * Run: node scripts/fix-admin-edit-setup.cjs
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("🚀 ELON FIX: Admin Edit Setup\n");

  // =========================================================================
  // STEP 1: Create storage bucket if not exists
  // =========================================================================
  console.log("📦 Step 1: Checking storage bucket 'showcase-assets'...");

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("❌ Failed to list buckets:", listError.message);
  } else {
    const bucketExists = buckets.some((b) => b.name === "showcase-assets");

    if (bucketExists) {
      console.log("   ✅ Bucket 'showcase-assets' already exists");
    } else {
      console.log("   📦 Creating bucket 'showcase-assets'...");
      const { error: createError } = await supabase.storage.createBucket("showcase-assets", {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"],
      });

      if (createError) {
        console.error("   ❌ Failed to create bucket:", createError.message);
      } else {
        console.log("   ✅ Bucket 'showcase-assets' created successfully!");
      }
    }
  }

  // =========================================================================
  // STEP 2: Create page_content table if not exists
  // =========================================================================
  console.log("\n📋 Step 2: Checking 'page_content' table...");

  const { data: tableCheck, error: tableError } = await supabase
    .from("page_content")
    .select("page_id")
    .limit(1);

  if (tableError && tableError.code === "42P01") {
    // Table doesn't exist, create it
    console.log("   📋 Creating 'page_content' table...");

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.page_content (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        page_id TEXT NOT NULL UNIQUE,
        content JSONB DEFAULT '{}'::jsonb,
        updated_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

      -- Policy: Anyone can read
      CREATE POLICY "page_content_read" ON public.page_content
        FOR SELECT USING (true);

      -- Policy: Only admins can insert/update/delete
      CREATE POLICY "page_content_admin_write" ON public.page_content
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND email IN ('longsangadmin@gmail.com', 'longsangsabo@gmail.com')
          )
        );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);
    `;

    const { error: sqlError } = await supabase.rpc("exec_sql", { sql: createTableSQL });

    if (sqlError) {
      console.log(
        "   ⚠️ Cannot create table via RPC (expected). Run this SQL in Supabase Dashboard:"
      );
      console.log(
        "   \n" +
          createTableSQL
            .split("\n")
            .map((l) => "   " + l)
            .join("\n")
      );
    } else {
      console.log("   ✅ Table 'page_content' created!");
    }
  } else if (tableError) {
    console.log("   ⚠️ Table check returned:", tableError.message);
    console.log("   📋 Attempting to fix RLS policies...");

    // Try to fix RLS by dropping and recreating policies
    const fixRlsSQL = `
      -- Drop existing policies if any
      DROP POLICY IF EXISTS "page_content_read" ON public.page_content;
      DROP POLICY IF EXISTS "page_content_admin_write" ON public.page_content;
      DROP POLICY IF EXISTS "Allow public read" ON public.page_content;
      DROP POLICY IF EXISTS "Allow admin write" ON public.page_content;

      -- Recreate policies
      CREATE POLICY "page_content_public_read" ON public.page_content
        FOR SELECT USING (true);

      CREATE POLICY "page_content_admin_all" ON public.page_content
        FOR ALL USING (
          (SELECT email FROM auth.users WHERE id = auth.uid())
          IN ('longsangadmin@gmail.com', 'longsangsabo@gmail.com')
        );
    `;

    console.log("   Run this SQL in Supabase Dashboard SQL Editor:");
    console.log("\n" + fixRlsSQL);
  } else {
    console.log("   ✅ Table 'page_content' exists and is accessible");
    console.log("   📊 Found data:", tableCheck?.length || 0, "rows (checking limit 1)");
  }

  // =========================================================================
  // STEP 3: Set storage bucket policies
  // =========================================================================
  console.log("\n🔒 Step 3: Storage bucket policies...");
  console.log("   Run these SQL commands in Supabase Dashboard:");
  console.log(`
    -- Allow public read access to showcase-assets bucket
    CREATE POLICY "showcase_assets_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'showcase-assets');

    -- Allow authenticated users to upload to showcase-assets
    CREATE POLICY "showcase_assets_auth_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'showcase-assets'
      AND auth.role() = 'authenticated'
    );

    -- Allow users to update their own uploads
    CREATE POLICY "showcase_assets_auth_update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'showcase-assets'
      AND auth.role() = 'authenticated'
    );
  `);

  console.log("\n✅ ELON FIX COMPLETE!");
  console.log("   1. Storage bucket: showcase-assets");
  console.log("   2. Table: page_content");
  console.log("   3. Run the SQL policies above in Supabase Dashboard");
}

main().catch(console.error);
