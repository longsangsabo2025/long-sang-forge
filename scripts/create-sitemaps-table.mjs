#!/usr/bin/env node
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

console.log('🚀 Creating seo_sitemaps table...\n');

const pool = new Pool({
  connectionString: process.env.VITE_SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

const createSitemapsSQL = `
CREATE TABLE IF NOT EXISTS public.seo_sitemaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    total_urls INTEGER DEFAULT 0,
    last_generated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, url)
);
`;

const enableRLSSQL = `
ALTER TABLE public.seo_sitemaps ENABLE ROW LEVEL SECURITY;
`;

const createPolicies = [
  `DROP POLICY IF EXISTS "Anyone can view sitemaps" ON public.seo_sitemaps`,
  `CREATE POLICY "Anyone can view sitemaps" ON public.seo_sitemaps FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Authenticated users can manage sitemaps" ON public.seo_sitemaps`,
  `CREATE POLICY "Authenticated users can manage sitemaps" ON public.seo_sitemaps FOR ALL USING (auth.role() = 'authenticated')`
];

const createIndexSQL = `
CREATE INDEX IF NOT EXISTS idx_seo_sitemaps_domain ON public.seo_sitemaps(domain_id);
`;

const createTriggerSQL = `
DROP TRIGGER IF EXISTS update_seo_sitemaps_updated_at ON public.seo_sitemaps;
`;

const createTriggerSQL2 = `
CREATE TRIGGER update_seo_sitemaps_updated_at 
BEFORE UPDATE ON public.seo_sitemaps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

const grantSQL = `
GRANT ALL ON public.seo_sitemaps TO authenticated;
`;

try {
  console.log('1️⃣  Creating table...');
  await pool.query(createSitemapsSQL);
  console.log('✅ Table created\n');

  console.log('2️⃣  Enabling RLS...');
  await pool.query(enableRLSSQL);
  console.log('✅ RLS enabled\n');

  console.log('3️⃣  Creating policies...');
  for (const policy of createPolicies) {
    try {
      await pool.query(policy);
      process.stdout.write('.');
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error('\n❌', err.message);
      }
    }
  }
  console.log(' ✅ Policies created\n');

  console.log('4️⃣  Creating index...');
  await pool.query(createIndexSQL);
  console.log('✅ Index created\n');

  console.log('5️⃣  Creating trigger...');
  await pool.query(createTriggerSQL);
  await pool.query(createTriggerSQL2);
  console.log('✅ Trigger created\n');

  console.log('6️⃣  Granting permissions...');
  await pool.query(grantSQL);
  console.log('✅ Permissions granted\n');

  // Verify
  console.log('🔍 Verifying table...');
  await pool.query('SELECT 1 FROM public.seo_sitemaps LIMIT 0');
  console.log('✅ seo_sitemaps table verified!\n');

  console.log('🎉 SUCCESS! seo_sitemaps table created!\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await pool.end();
}

console.log('✨ Done! All 6 SEO tables are now ready!\n');
console.log('Next steps:');
console.log('  1. Generate types: npx supabase gen types typescript --project-id diexsbzqwsbpilsymnfb');
console.log('  2. Restart dev server: npm run dev');
console.log('  3. Visit: http://localhost:8080/admin/seo-center\n');
