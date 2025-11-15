#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Creating SEO Management Database Tables...\n');

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read SQL file
const sqlFilePath = join(__dirname, 'setup-seo-database.sql');
console.log(`📖 Reading SQL from: ${sqlFilePath}\n`);

let sqlContent;
try {
  sqlContent = readFileSync(sqlFilePath, 'utf-8');
} catch (error) {
  console.error('❌ Error reading SQL file:', error.message);
  process.exit(1);
}

// Execute SQL
console.log('⚙️  Executing SQL statements...\n');

try {
  // Use rpc to execute raw SQL
  const { data, error } = await supabase.rpc('exec', { sql: sqlContent });
  
  if (error) {
    // Try alternative: split and execute statements one by one
    console.log('⚠️  Batch execution failed, trying statement-by-statement...\n');
    
    // Split SQL into statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (!statement) continue;
      
      try {
        const { error: stmtError } = await supabase.rpc('exec', { 
          sql: statement + ';' 
        });
        
        if (stmtError) {
          console.error(`❌ Error:`, stmtError.message);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write('.');
        }
      } catch (err) {
        console.error(`❌ Exception:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n\n📊 Results: ${successCount} succeeded, ${errorCount} failed\n`);
    
    if (errorCount > 0) {
      console.log('⚠️  Some statements failed. This is normal if tables already exist.\n');
    }
  } else {
    console.log('✅ SQL executed successfully!\n');
  }
  
} catch (error) {
  console.error('❌ Execution error:', error.message);
  console.log('\n💡 Alternative: Run SQL manually in Supabase Dashboard:');
  console.log('   1. Go to https://app.supabase.com');
  console.log('   2. Open SQL Editor');
  console.log('   3. Copy & paste from: scripts/setup-seo-database.sql');
  console.log('   4. Click RUN\n');
  process.exit(1);
}

// Verify tables were created
console.log('🔍 Verifying tables...\n');

const tablesToCheck = [
  'seo_domains',
  'seo_indexing_queue', 
  'seo_keywords',
  'seo_analytics',
  'seo_settings',
  'seo_sitemaps'
];

let allTablesExist = true;

for (const table of tablesToCheck) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(0);
  
  if (error) {
    console.log(`❌ ${table} - NOT FOUND`);
    allTablesExist = false;
  } else {
    console.log(`✅ ${table} - OK`);
  }
}

console.log('\n');

if (allTablesExist) {
  console.log('🎉 SUCCESS! All SEO tables created!\n');
  console.log('Next steps:');
  console.log('  1. Generate TypeScript types:');
  console.log('     npx supabase gen types typescript --project-id diexsbzqwsbpilsymnfb > src/integrations/supabase/types.gen.ts\n');
  console.log('  2. Restart dev server:');
  console.log('     npm run dev\n');
  console.log('  3. Test UI:');
  console.log('     http://localhost:8080/admin/seo-center\n');
} else {
  console.log('⚠️  Some tables are missing. Please create them manually:\n');
  console.log('Option 1 - Supabase Dashboard (EASIEST):');
  console.log('  1. Go to: https://app.supabase.com/project/diexsbzqwsbpilsymnfb/sql');
  console.log('  2. Click "New Query"');
  console.log('  3. Copy ALL content from: scripts/setup-seo-database.sql');
  console.log('  4. Paste and click RUN ▶️\n');
  
  console.log('Option 2 - Run this script again:');
  console.log('  node scripts/create-seo-tables.mjs\n');
}
