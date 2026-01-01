require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addReminderMetadata() {
  // Test if column already exists by trying to select it
  const { error: testError } = await supabase
    .from("consultations")
    .select("reminder_metadata")
    .limit(1);

  if (!testError) {
    console.log("✅ reminder_metadata column already exists");
    process.exit(0);
    return;
  }

  // Column doesn't exist, need to add via SQL Editor in Supabase Dashboard
  console.log("⚠️  Column reminder_metadata does not exist.");
  console.log("Please run this SQL in Supabase Dashboard SQL Editor:");
  console.log("");
  console.log(
    `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS reminder_metadata JSONB DEFAULT '{}'::jsonb;`
  );
  console.log("");
  process.exit(1);
}

addReminderMetadata();
