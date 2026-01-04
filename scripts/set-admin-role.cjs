/**
 * Script to update user role to admin
 * Uses Supabase Admin API with service_role key
 */

const config = require("./_config.cjs");

// Validate required keys
config.validate(["SUPABASE_SERVICE_KEY"]);

const SUPABASE_URL = config.SUPABASE_URL;
const SERVICE_ROLE_KEY = config.SUPABASE_SERVICE_KEY;
const TARGET_EMAIL = "longsangsabo@gmail.com";

async function main() {
  console.log("🔍 Checking user:", TARGET_EMAIL);

  // Step 1: Get all users to find the target
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
  });

  if (!listRes.ok) {
    console.error("Failed to list users:", await listRes.text());
    return;
  }

  const { users } = await listRes.json();
  const targetUser = users.find((u) => u.email === TARGET_EMAIL);

  if (!targetUser) {
    console.error("❌ User not found:", TARGET_EMAIL);
    console.log("Available users:", users.map((u) => u.email).join(", "));
    return;
  }

  console.log("\n📋 Current user info:");
  console.log("  ID:", targetUser.id);
  console.log("  Email:", targetUser.email);
  console.log("  Current metadata:", JSON.stringify(targetUser.user_metadata, null, 2));

  // Step 2: Update user metadata to add admin role
  console.log("\n🔧 Updating user_metadata to add role: admin...");

  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${targetUser.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_metadata: {
        ...targetUser.user_metadata,
        role: "admin",
      },
    }),
  });

  if (!updateRes.ok) {
    console.error("❌ Failed to update user:", await updateRes.text());
    return;
  }

  const updatedUser = await updateRes.json();

  console.log("\n✅ SUCCESS! Updated user metadata:");
  console.log("  New metadata:", JSON.stringify(updatedUser.user_metadata, null, 2));

  console.log("\n🎉 User", TARGET_EMAIL, "is now an ADMIN!");
  console.log("   Please log out and log back in for changes to take effect.");
}

main().catch(console.error);
