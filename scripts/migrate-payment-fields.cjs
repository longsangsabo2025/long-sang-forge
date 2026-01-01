const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

const sql = `
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS payment_amount INTEGER;

CREATE INDEX IF NOT EXISTS idx_consultations_payment_status ON consultations(payment_status);
CREATE INDEX IF NOT EXISTS idx_consultations_payment_tx ON consultations(payment_transaction_id);
`;

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to Supabase...');
    
    await client.query(sql);
    console.log('✅ Migration successful! Payment fields added to consultations table.');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await client.end();
  }
}

migrate();
