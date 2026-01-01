const { Client } = require("pg");
const client = new Client({
  connectionString:
    "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
});

async function run() {
  await client.connect();

  // Check auth.users
  console.log("=== AUTH USERS ===");
  const users = await client.query(`
    SELECT id, email, role, created_at, last_sign_in_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10
  `);
  console.table(users.rows);

  // Check profiles
  console.log("\n=== USER PROFILES ===");
  try {
    const profiles = await client.query(`SELECT * FROM public.profiles LIMIT 10`);
    console.table(profiles.rows);
  } catch (e) {
    console.log("No profiles table or error:", e.message);
  }

  // Check user_roles
  console.log("\n=== USER ROLES ===");
  try {
    const roles = await client.query(`SELECT * FROM public.user_roles LIMIT 10`);
    console.table(roles.rows);
  } catch (e) {
    console.log("No user_roles table");
  }

  // Check contacts (leads)
  console.log("\n=== RECENT CONTACTS (LEADS) ===");
  const contacts = await client.query(`
    SELECT id, name, email, phone, service, budget, source, status, created_at
    FROM public.contacts
    ORDER BY created_at DESC
    LIMIT 5
  `);
  console.table(contacts.rows);

  await client.end();
}
run().catch((e) => console.error(e.message));
