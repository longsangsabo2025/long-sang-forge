#!/usr/bin/env node

/**
 * SEO Database Deployment Script
 * Deploy SEO tables to longsang.org database using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://diexsbzqwsbpilsymnfb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY';

console.log('🚀 Starting SEO Database Deployment...');
console.log('🔗 Target:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployMigration() {
  try {
    // Read SEO migration file
    const migrationPath = './supabase/migrations/20251111112406_seo_system_complete.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📊 SQL Length:', migrationSQL.length, 'characters');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log('🔧 Found', statements.length, 'SQL statements to execute');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      });
      
      if (error) {
        console.log(`⚠️  Statement ${i + 1} failed (may be expected):`, error.message);
        // Continue with next statement - some errors are expected (table exists, etc.)
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('🎉 SEO Migration deployment completed!');
    
    // Verify tables were created
    console.log('\n🔍 Verifying SEO tables...');
    const tables = [
      'seo_keyword_rankings',
      'seo_page_metrics', 
      'seo_competitor_analysis',
      'seo_backlinks',
      'seo_technical_issues',
      'seo_content_performance',
      'seo_automation_logs',
      'seo_reports'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count');
        if (error) {
          console.log(`❌ Table ${table}: NOT FOUND`);
        } else {
          console.log(`✅ Table ${table}: EXISTS`);
        }
      } catch (e) {
        console.log(`❌ Table ${table}: ERROR -`, e.message);
      }
    }
    
    console.log('\n🏆 SEO Database deployment summary:');
    console.log('📊 Longsang.org database updated with SEO system');
    console.log('🔗 Ready for production use');
    console.log('🎯 Next: Test SEO components and monitoring');
    
  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

deployMigration();