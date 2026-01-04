/**
 * 🔧 UPDATE COMPANY SETTINGS HELPER
 *
 * Usage:
 *   node scripts/update-company-setting.cjs <key> <value>
 *   node scripts/update-company-setting.cjs current_promotion '{"active": false}'
 *   node scripts/update-company-setting.cjs --list
 */

const config = require("./_config.cjs");

async function main() {
  const args = process.argv.slice(2);
  const supabase = config.getSupabaseClient();

  // List all settings
  if (args[0] === "--list" || args[0] === "-l") {
    console.log("\n📋 COMPANY SETTINGS\n");

    const { data, error } = await supabase
      .from("company_settings")
      .select("key, category, description, updated_at")
      .order("category");

    if (error) {
      console.error("❌ Error:", error.message);
      return;
    }

    const byCategory = {};
    data.forEach((s) => {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s);
    });

    Object.entries(byCategory).forEach(([cat, settings]) => {
      console.log(`\n${cat.toUpperCase()} (${settings.length}):`);
      settings.forEach((s) => {
        console.log(`  • ${s.key} - ${s.description || "No description"}`);
      });
    });

    console.log(`\n✅ Total: ${data.length} settings\n`);
    return;
  }

  // Get specific setting
  if (args[0] === "--get" || args[0] === "-g") {
    const key = args[1];
    if (!key) {
      console.error("❌ Usage: --get <key>");
      return;
    }

    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error) {
      console.error("❌ Error:", error.message);
      return;
    }

    console.log(`\n📄 ${key}`);
    console.log("=".repeat(50));
    console.log(JSON.stringify(data.value, null, 2));
    console.log("=".repeat(50));
    console.log(`Category: ${data.category}`);
    console.log(`Updated: ${data.updated_at}\n`);
    return;
  }

  // Update setting
  if (args.length < 2) {
    console.log(`
🔧 UPDATE COMPANY SETTINGS

Usage:
  node scripts/update-company-setting.cjs <key> <json-value>
  node scripts/update-company-setting.cjs --list
  node scripts/update-company-setting.cjs --get <key>

Examples:
  # Disable promotion
  node scripts/update-company-setting.cjs current_promotion '{"active": false}'

  # Update phone
  node scripts/update-company-setting.cjs contact_phone '{"phone": "0909999999", "display": "0909 999 999"}'

  # Update pricing
  node scripts/update-company-setting.cjs pricing_landing_page '{"name": "Landing Page", "price_display": "5-8 triệu", "price_from": 5000000, "price_to": 8000000, "timeline": "1-2 tuần"}'
    `);
    return;
  }

  const key = args[0];
  let value;

  try {
    value = JSON.parse(args.slice(1).join(" "));
  } catch (e) {
    console.error("❌ Invalid JSON. Make sure to use single quotes around the JSON value.");
    console.error('Example: node scripts/update-company-setting.cjs key \'{"field": "value"}\'');
    return;
  }

  console.log(`\n🔄 Updating: ${key}`);
  console.log("New value:", JSON.stringify(value, null, 2));

  // Check if key exists
  const { data: existing } = await supabase
    .from("company_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (!existing) {
    console.error(`❌ Key not found: ${key}`);
    console.log("Use --list to see available keys");
    return;
  }

  // Merge with existing value (partial update)
  const mergedValue = { ...existing.value, ...value };

  const { error } = await supabase
    .from("company_settings")
    .update({ value: mergedValue })
    .eq("key", key);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log("✅ Updated successfully!");
  console.log("\n📝 Note: AI cache will refresh in 5 minutes.");
}

main().catch(console.error);
