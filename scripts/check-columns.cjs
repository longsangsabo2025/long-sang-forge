const { Client } = require("pg");
(async () => {
  const c = new Client({
    connectionString:
      "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
  });
  await c.connect();
  const { rows } = await c.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='token_usage' ORDER BY ordinal_position`
  );
  console.table(rows);
  await c.end();
})();
