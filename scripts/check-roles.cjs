const { Client } = require("pg");
const client = new Client({
  connectionString:
    "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
});

async function run() {
  await client.connect();

  console.log("=== CHECKING USER ROLES (raw_user_meta_data) ===\n");

  const users = await client.query(`
    SELECT
      email,
      role as supabase_role,
      raw_user_meta_data->>'role' as app_role,
      raw_user_meta_data
    FROM auth.users
    ORDER BY created_at DESC
  `);

  users.rows.forEach((u) => {
    console.log(`📧 ${u.email}`);
    console.log(`   Supabase Role: ${u.supabase_role}`);
    console.log(`   App Role: ${u.app_role || "(not set)"}`);
    console.log(`   Metadata: ${JSON.stringify(u.raw_user_meta_data)}`);
    console.log("");
  });

  await client.end();
}
run().catch((e) => console.error(e.message));
