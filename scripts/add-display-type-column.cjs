/**
 * Script to add display_type column to project_showcase table
 * Run with: node scripts/add-display-type-column.cjs
 */

const { Client } = require("pg");

// Use session mode (port 5432) from .env - aws-1-us-east-2
const DATABASE_URL =
  "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // 1. Add column if not exists
    console.log("\n📦 Adding display_type column...");
    await client.query(`
      ALTER TABLE public.project_showcase
      ADD COLUMN IF NOT EXISTS display_type VARCHAR(20) DEFAULT NULL
    `);
    console.log("✅ Column added");

    // 2. Add constraint (ignore if exists)
    console.log("\n🔒 Adding constraint...");
    try {
      await client.query(`
        ALTER TABLE public.project_showcase
        ADD CONSTRAINT check_display_type
        CHECK (display_type IS NULL OR display_type IN ('phone', 'browser', 'tablet', 'responsive'))
      `);
      console.log("✅ Constraint added");
    } catch (e) {
      if (e.code === "42710") {
        console.log("⚠️ Constraint already exists, skipping");
      } else {
        throw e;
      }
    }

    // 3. Add comment
    console.log("\n📝 Adding column comment...");
    await client.query(`
      COMMENT ON COLUMN public.project_showcase.display_type IS
      'Override mockup display type. If NULL, auto-detect from category. Options: phone, browser, tablet, responsive'
    `);
    console.log("✅ Comment added");

    // 4. Update existing projects based on category
    console.log("\n🔄 Updating existing projects...");

    // Set phone for mobile apps
    const phoneResult = await client.query(`
      UPDATE public.project_showcase
      SET display_type = 'phone'
      WHERE (category ILIKE '%mobile%' OR (category ILIKE '%app%' AND category NOT ILIKE '%web%'))
        AND display_type IS NULL
      RETURNING name, category
    `);
    console.log(
      `  📱 Set phone mockup for: ${phoneResult.rows.map((r) => r.name).join(", ") || "none"}`
    );

    // Set browser for web apps/platforms
    const browserResult = await client.query(`
      UPDATE public.project_showcase
      SET display_type = 'browser'
      WHERE (category ILIKE '%web%' OR category ILIKE '%platform%' OR category ILIKE '%website%')
        AND display_type IS NULL
      RETURNING name, category
    `);
    console.log(
      `  🖥️ Set browser mockup for: ${browserResult.rows.map((r) => r.name).join(", ") || "none"}`
    );

    // 5. Show final state
    console.log("\n📊 Final state:");
    const { rows } = await client.query(`
      SELECT name, category, display_type
      FROM public.project_showcase
      WHERE is_active = true
      ORDER BY display_order
    `);
    rows.forEach((r) => {
      const icon = r.display_type === "phone" ? "📱" : r.display_type === "browser" ? "🖥️" : "❓";
      console.log(`  ${icon} ${r.name}: ${r.category} → ${r.display_type || "auto"}`);
    });

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

run();
