const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://postgres.qzmwzpfrqkfbdwbwytxb:LongSang%40Supabase2024@aws-0-us-east-2.pooler.supabase.com:6543/postgres",
});

(async () => {
  await client.connect();

  // Get current metadata for longsangsabo@gmail.com
  const result = await client.query(`
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE email = 'longsangsabo@gmail.com'
  `);

  console.log("Current user metadata for longsangsabo@gmail.com:");
  if (result.rows.length > 0) {
    const user = result.rows[0];
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Metadata:", JSON.stringify(user.raw_user_meta_data, null, 2));
  } else {
    console.log("User not found!");
  }

  await client.end();
})();
