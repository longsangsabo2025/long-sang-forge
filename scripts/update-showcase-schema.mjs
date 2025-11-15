import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function updateSchema() {
  console.log('🚀 Updating app_showcase table schema...');
  console.log('📍 Supabase URL:', process.env.VITE_SUPABASE_URL);

  try {
    // Check current table structure
    console.log('\n📊 Checking current table structure...');
    const { data: existingData, error: checkError } = await supabase
      .from('app_showcase')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking table:', checkError);
      return;
    }

    console.log('✅ Table exists. Current data sample:', existingData);

    // Update sabo-arena with new fields
    console.log('\n📝 Updating sabo-arena with slug, icon, and production_url...');
    const { data: updateData, error: updateError } = await supabase
      .from('app_showcase')
      .update({
        slug: 'sabo-arena',
        icon: '🎱',
        production_url: 'https://longsang.org'
      })
      .eq('app_id', 'sabo-arena')
      .select();

    if (updateError) {
      console.error('❌ Error updating sabo-arena:', updateError);
      console.log('\n⚠️  Columns might not exist yet. Please run this SQL in Supabase SQL Editor:');
      console.log(`
-- Add new columns to app_showcase table
ALTER TABLE app_showcase 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS production_url TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_showcase_slug ON app_showcase(slug);

-- Update sabo-arena
UPDATE app_showcase 
SET 
  slug = 'sabo-arena',
  icon = '🎱',
  production_url = 'https://longsang.org'
WHERE app_id = 'sabo-arena';
      `);
      return;
    }

    console.log('✅ Successfully updated sabo-arena!');
    console.log('📦 Updated data:', updateData);

    // Verify the update
    console.log('\n🔍 Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('app_showcase')
      .select('app_id, app_name, slug, icon, production_url')
      .eq('app_id', 'sabo-arena')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      return;
    }

    console.log('✅ Verification successful!');
    console.log('📋 Current data:', verifyData);
    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateSchema();
