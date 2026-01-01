// Script to add 'consultation' to all discount codes
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function updateDiscountCodes() {
  console.log("Fetching discount codes...");

  // Get all discount codes
  const { data: codes, error: fetchError } = await supabase
    .from("discount_codes")
    .select("id, code, applicable_plans");

  if (fetchError) {
    console.error("Error fetching discount codes:", fetchError);
    return;
  }

  console.log(`Found ${codes.length} discount codes`);

  for (const code of codes) {
    const plans = code.applicable_plans || [];

    if (!plans.includes("consultation")) {
      const newPlans = [...plans, "consultation"];

      const { error: updateError } = await supabase
        .from("discount_codes")
        .update({ applicable_plans: newPlans })
        .eq("id", code.id);

      if (updateError) {
        console.error(`Error updating ${code.code}:`, updateError);
      } else {
        console.log(`✅ Updated ${code.code}: ${plans.join(", ")} → ${newPlans.join(", ")}`);
      }
    } else {
      console.log(`⏭️ ${code.code} already has 'consultation'`);
    }
  }

  console.log("\nDone! SANGDEPTRAI and other codes should now work for consultations.");
}

updateDiscountCodes();
