import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrationViaRPC() {
  console.log('🚀 Running Multi-Project Migration via Supabase RPC...');
  console.log('📍 URL:', supabaseUrl);

  try {
    // Method 1: Try using raw SQL via supabase-js
    console.log('\n📝 Attempting to add columns via direct query...');
    
    // We'll do this in steps since Supabase client doesn't support ALTER TABLE directly
    // Instead, we'll just update the existing record and let you add columns manually
    
    console.log('⚠️  Note: ALTER TABLE commands need to be run in Supabase SQL Editor');
    console.log('📋 Please run this SQL in Supabase Dashboard:');
    console.log(`
-- Add new columns
ALTER TABLE app_showcase 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS production_url TEXT;

-- Create index
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_showcase_slug ON app_showcase(slug);
    `);

    // But we can update the data using Supabase client
    console.log('\n📝 Updating sabo-arena data with Supabase client...');
    
    const { data, error } = await supabase
      .from('app_showcase')
      .update({
        slug: 'sabo-arena',
        icon: '🎱',
        production_url: 'https://longsang.org'
      })
      .eq('app_id', 'sabo-arena')
      .select();

    if (error) {
      console.error('❌ Error:', error.message);
      
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('\n⚠️  Columns do not exist yet!');
        console.log('📋 Please run the SQL above in Supabase SQL Editor first.');
        console.log('🔗 Go to: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new');
        return;
      }
      
      throw error;
    }

    console.log('✅ Successfully updated sabo-arena!');
    console.log('📦 Updated data:', data);

    // Verify
    const { data: verifyData, error: verifyError } = await supabase
      .from('app_showcase')
      .select('app_id, app_name, slug, icon, production_url')
      .eq('app_id', 'sabo-arena')
      .single();

    if (verifyError) {
      console.error('❌ Verify error:', verifyError);
      return;
    }

    console.log('\n🔍 Verification:');
    console.log(verifyData);
    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ Test URLs:');
    console.log('   - http://localhost:8082/app-showcase');
    console.log('   - http://localhost:8082/app-showcase/sabo-arena');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigrationViaRPC();
