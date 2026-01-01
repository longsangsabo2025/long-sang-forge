/**
 * Script to add new columns to project_showcase table
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://diexsbzqwsbpilsymnfb.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.log("⚠️ SUPABASE_SERVICE_KEY not set. Run migration manually in Supabase Dashboard:");
  console.log(`
=== RUN THIS SQL IN SUPABASE DASHBOARD ===

ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS my_role TEXT DEFAULT 'Full-stack Developer';
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_project_showcase_is_active ON project_showcase(is_active);

=======================================
  `);
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const sql = `
    ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS video_url TEXT;
    ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS github_url TEXT;
    ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS my_role TEXT DEFAULT 'Full-stack Developer';
    ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS end_date DATE;
    ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;
    ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    CREATE INDEX IF NOT EXISTS idx_project_showcase_is_active ON project_showcase(is_active);
  `;

  const { error } = await supabase.rpc("exec_sql", { sql });

  if (error) {
    console.error("Migration error:", error);
  } else {
    console.log("✅ Migration successful!");
  }
}

runMigration();
