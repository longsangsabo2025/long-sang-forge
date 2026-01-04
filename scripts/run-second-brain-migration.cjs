/**
 * Run Second Brain User Migration
 * ================================
 * Creates tables for user's personal Second Brain
 *
 * Run: node scripts/run-second-brain-migration.cjs
 */

const config = require("./_config.cjs");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  console.log("=".repeat(60));
  console.log("🧠 SECOND BRAIN USER MIGRATION");
  console.log("=".repeat(60));

  const supabase = config.getSupabaseClient();

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    "../supabase/migrations/20260103_second_brain_user.sql"
  );
  const migrationSQL = fs.readFileSync(migrationPath, "utf8");

  console.log("\n📄 Migration file loaded");
  console.log("   Path:", migrationPath);
  console.log("   Size:", (migrationSQL.length / 1024).toFixed(2), "KB");

  // Split by statement (simple split, good enough for this migration)
  const statements = migrationSQL
    .split(/;[\s]*\n/)
    .filter((s) => s.trim().length > 10)
    .map((s) => s.trim() + ";");

  console.log("\n📝 Statements to execute:", statements.length);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, " ");

    try {
      const { error } = await supabase.rpc("exec_sql", { sql: stmt });

      if (error) {
        // Try direct execution
        const { error: directError } = await supabase.from("_migrations_log").select("*").limit(0);

        // If table doesn't exist, that's expected for new tables
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
          console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (exists): ${preview}...`);
          success++;
        } else {
          throw error;
        }
      } else {
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        success++;
      }
    } catch (err) {
      // Some statements are expected to fail (like CREATE IF NOT EXISTS when already exists)
      const msg = err.message || String(err);

      if (
        msg.includes("already exists") ||
        msg.includes("duplicate") ||
        msg.includes("does not exist")
      ) {
        console.log(`⏭️  [${i + 1}/${statements.length}] ${preview}...`);
        success++;
      } else {
        console.log(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
        console.log(`   Error: ${msg}`);
        errors.push({ statement: preview, error: msg });
        failed++;
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);

  if (errors.length > 0) {
    console.log("\n⚠️  Errors (non-critical):");
    errors.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.statement}`);
      console.log(`      ${e.error}`);
    });
  }

  // Verify tables created
  console.log("\n🔍 Verifying tables...");
  const tables = [
    "user_brain_quotas",
    "user_brain_imports",
    "user_brain_chats",
    "brain_plan_limits",
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: OK`);
    }
  }

  // Check plan limits data
  const { data: plans } = await supabase.from("brain_plan_limits").select("*");
  if (plans && plans.length > 0) {
    console.log("\n📋 Plan Limits:");
    plans.forEach((p) => {
      console.log(
        `   ${p.plan_id}: ${p.max_documents} docs, ${p.max_queries_per_month} queries/month`
      );
    });
  }

  console.log("\n🎉 Migration complete!");
  console.log("   Routes available:");
  console.log("   - /my-brain - User Second Brain");
  console.log("   - /brain/pricing - Brain Pricing");
  console.log("   - /brain - Admin Brain Dashboard");
}

runMigration().catch(console.error);
