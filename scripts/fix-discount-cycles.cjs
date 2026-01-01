// Script to ensure all discount codes have 'monthly' in applicable_cycles
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function fixDiscountCycles() {
  console.log("Fetching discount codes...");

  // Get all discount codes
  const { data: codes, error: fetchError } = await supabase
    .from("discount_codes")
    .select("id, code, applicable_plans, applicable_cycles");

  if (fetchError) {
    console.error("Error fetching discount codes:", fetchError);
    return;
  }

  if (!codes || codes.length === 0) {
    console.log("No discount codes found in database");
    return;
  }

  console.log(`Found ${codes.length} discount codes\n`);

  for (const code of codes) {
    const plans = code.applicable_plans || [];
    const cycles = code.applicable_cycles || [];

    console.log(`📋 ${code.code}:`);
    console.log(`   Plans: ${plans.join(", ") || "(none)"}`);
    console.log(`   Cycles: ${cycles.join(", ") || "(none)"}`);

    let needsUpdate = false;
    let newPlans = [...plans];
    let newCycles = [...cycles];

    // Ensure 'consultation' is in plans
    if (!plans.includes("consultation")) {
      newPlans.push("consultation");
      needsUpdate = true;
    }

    // Ensure 'monthly' is in cycles (for consultation to work)
    if (!cycles.includes("monthly")) {
      newCycles.push("monthly");
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from("discount_codes")
        .update({
          applicable_plans: newPlans,
          applicable_cycles: newCycles,
        })
        .eq("id", code.id);

      if (updateError) {
        console.error(`   ❌ Error updating: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated!`);
        console.log(`   New Plans: ${newPlans.join(", ")}`);
        console.log(`   New Cycles: ${newCycles.join(", ")}`);
      }
    } else {
      console.log(`   ⏭️ Already has consultation + monthly`);
    }
    console.log("");
  }

  console.log("Done! Discount codes should now work for consultations.");
}

fixDiscountCycles();
