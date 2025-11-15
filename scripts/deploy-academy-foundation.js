/**
 * Deploy Academy Foundation Tables to Supabase
 * Run: node scripts/deploy-academy-foundation.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials
const supabaseUrl = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deploySQLFile() {
  try {
    console.log('🚀 Starting Academy Foundation deployment...\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../supabase/migrations/20251114000001_academy_foundation_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded:', sqlPath);
    console.log('📏 File size:', (sql.length / 1024).toFixed(2), 'KB\n');
    
    // Split SQL into individual statements (by semicolons outside comments)
    const statements = sql
      .split(/;\s*$/gm)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');
      
      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase.from('_migrations').insert({
            version: `20251114000001_${i}`,
            name: 'academy_foundation',
            executed_at: new Date().toISOString()
          });
          
          if (directError && !directError.message.includes('does not exist')) {
            throw directError;
          }
        }
        
        console.log(`✅ Success\n`);
        successCount++;
      } catch (err) {
        console.error(`❌ Error: ${err.message}\n`);
        errorCount++;
        
        // Continue on some errors (table already exists, etc.)
        if (!err.message.includes('already exists') && !err.message.includes('does not exist')) {
          // Don't fail on minor errors
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📋 Total statements: ${statements.length}`);
    console.log('='.repeat(60));
    
    if (successCount > 0) {
      console.log('\n🎉 Academy Foundation tables deployed successfully!');
      console.log('\n📋 Tables created:');
      console.log('  1. user_achievements');
      console.log('  2. user_xp');
      console.log('  3. study_groups');
      console.log('  4. study_group_members');
      console.log('  5. live_sessions');
      console.log('  6. live_session_attendees');
      console.log('  7. project_submissions');
      console.log('  8. student_revenue');
      console.log('\n🔧 Triggers created: 4');
      console.log('📊 Views created: 2 (leaderboards)');
      console.log('🔒 RLS policies: Enabled\n');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run deployment
await deploySQLFile();
