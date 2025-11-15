/**
 * Deploy Academy Foundation via Direct SQL Execution
 * Uses Supabase REST API to run SQL
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log('🚀 Deploying Academy Foundation Tables...\n');

// Read SQL file
const sqlPath = path.join(__dirname, '../supabase/migrations/20251114000001_academy_foundation_tables.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('📄 SQL file loaded');
console.log('📏 Size:', (sql.length / 1024).toFixed(2), 'KB\n');

// Test connection
console.log('🔗 Testing Supabase connection...');
const { data: testData, error: testError } = await supabase.from('courses').select('id').limit(1);

if (testError) {
  console.error('❌ Connection failed:', testError.message);
  console.log('\n💡 Please run this SQL manually in Supabase SQL Editor:');
  console.log('👉 https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new');
  console.log('\n📋 SQL file location:', sqlPath);
  process.exit(1);
} else {
  console.log('✅ Connected to Supabase!\n');
}

console.log('=' .repeat(60));
console.log('⚠️  MANUAL DEPLOYMENT REQUIRED');
console.log('='.repeat(60));
console.log('\nSupabase REST API does not support direct SQL execution.');
console.log('Please follow these steps:\n');
console.log('1. Open Supabase SQL Editor:');
console.log('   👉 https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new\n');
console.log('2. Copy the SQL from:');
console.log(`   📁 ${sqlPath}\n`);
console.log('3. Paste into SQL Editor and click "RUN"\n');
console.log('4. Wait for success message\n');
console.log('=' .repeat(60));
console.log('\n📋 Quick Copy Command:');
console.log(`   Get-Content "${sqlPath}" | Set-Clipboard`);
console.log('\nThen paste in SQL Editor (Ctrl+V) and run!\n');

// Show preview of SQL
console.log('📝 SQL Preview (first 500 chars):');
console.log('─'.repeat(60));
console.log(sql.substring(0, 500) + '...');
console.log('─'.repeat(60));
console.log(`\n📊 Total SQL length: ${sql.length} characters\n`);
