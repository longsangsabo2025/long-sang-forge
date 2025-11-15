#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

console.log('🚀 Creating missing seo_sitemaps table...\n');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL for seo_sitemaps table
const createTableSQL = `
-- Create seo_sitemaps table
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

-- Enable RLS
ALTER TABLE public.seo_sitemaps ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view sitemaps" ON public.seo_sitemaps;
CREATE POLICY "Anyone can view sitemaps"
    ON public.seo_sitemaps FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage sitemaps" ON public.seo_sitemaps;
CREATE POLICY "Authenticated users can manage sitemaps"
    ON public.seo_sitemaps FOR ALL
    USING (auth.role() = 'authenticated');

-- Create index
CREATE INDEX IF NOT EXISTS idx_seo_sitemaps_domain ON public.seo_sitemaps(domain_id);

-- Create trigger
DROP TRIGGER IF EXISTS update_seo_sitemaps_updated_at ON public.seo_sitemaps;
CREATE TRIGGER update_seo_sitemaps_updated_at BEFORE UPDATE ON public.seo_sitemaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.seo_sitemaps TO authenticated;
`;

console.log('⚙️  Creating table via direct database connection...\n');

// Try to create table using REST API to execute SQL
try {
  // Use fetch to call Supabase REST API directly
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      query: createTableSQL
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  console.log('✅ Table creation query sent!\n');
} catch (error) {
  console.log('⚠️  REST API method failed:', error.message);
  console.log('\n📝 Please create manually via Supabase Dashboard:\n');
  console.log('SQL to run:');
  console.log('='.repeat(60));
  console.log(createTableSQL);
  console.log('='.repeat(60));
  console.log('\nSteps:');
  console.log('1. Go to: https://app.supabase.com/project/diexsbzqwsbpilsymnfb/sql');
  console.log('2. Click "New Query"');
  console.log('3. Copy the SQL above');
  console.log('4. Paste and click RUN ▶️\n');
}

// Verify
console.log('🔍 Verifying seo_sitemaps table...\n');

const { data, error } = await supabase
  .from('seo_sitemaps')
  .select('*')
  .limit(0);

if (error) {
  console.log('❌ Table NOT found:', error.message);
  console.log('\n💡 Manual creation required. See instructions above.\n');
  process.exit(1);
} else {
  console.log('✅ seo_sitemaps table exists!\n');
  console.log('🎉 ALL SEO TABLES CREATED SUCCESSFULLY!\n');
  
  console.log('Next steps:');
  console.log('  1. Generate TypeScript types:');
  console.log('     npx supabase gen types typescript --project-id diexsbzqwsbpilsymnfb > src/integrations/supabase/types.gen.ts\n');
  console.log('  2. Restart dev server (if running)');
  console.log('  3. Visit: http://localhost:8080/admin/seo-center\n');
}
