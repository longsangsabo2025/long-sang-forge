const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addMultiProjectSupport() {
  console.log('🚀 Adding multi-project support to app_showcase table...');

  try {
    // Add columns using raw SQL
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add slug column
        ALTER TABLE app_showcase ADD COLUMN IF NOT EXISTS slug TEXT;
        
        -- Add icon column
        ALTER TABLE app_showcase ADD COLUMN IF NOT EXISTS icon TEXT;
        
        -- Add production_url column
        ALTER TABLE app_showcase ADD COLUMN IF NOT EXISTS production_url TEXT;
        
        -- Create unique index on slug
        CREATE UNIQUE INDEX IF NOT EXISTS idx_app_showcase_slug ON app_showcase(slug);
        
        -- Update existing data
        UPDATE app_showcase SET slug = app_id WHERE slug IS NULL;
        UPDATE app_showcase SET icon = '🎮' WHERE icon IS NULL OR icon = '';
      `
    });

    if (alterError) {
      console.error('❌ Error adding columns:', alterError);
      return;
    }

    console.log('✅ Successfully added multi-project support columns!');
    
    // Update sabo-arena with production URL and icon
    const { error: updateError } = await supabase
      .from('app_showcase')
      .update({
        slug: 'sabo-arena',
        icon: '🎱',
        production_url: 'https://longsang.org'
      })
      .eq('app_id', 'sabo-arena');

    if (updateError) {
      console.error('❌ Error updating sabo-arena:', updateError);
    } else {
      console.log('✅ Updated sabo-arena with slug, icon, and production URL!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

addMultiProjectSupport();
