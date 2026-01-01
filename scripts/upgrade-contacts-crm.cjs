const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase!');
  
  const sql = `
    ALTER TABLE public.contacts 
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS budget VARCHAR(50),
    ADD COLUMN IF NOT EXISTS source VARCHAR(100),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS followed_up_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;
  `;
  
  await client.query(sql);
  console.log('✅ Added CRM columns to contacts table!');
  
  // Create indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);');
  await client.query('CREATE INDEX IF NOT EXISTS idx_contacts_source ON public.contacts(source);');
  console.log('✅ Created indexes!');
  
  // Verify
  const result = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'contacts' ORDER BY ordinal_position;`);
  console.log('Columns:', result.rows.map(r => r.column_name).join(', '));
  
  await client.end();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
