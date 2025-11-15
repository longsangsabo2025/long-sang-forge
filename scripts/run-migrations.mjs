// ================================================
// Run Supabase Migrations via PostgreSQL
// ================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY';

console.log('\n================================================');
console.log('  Supabase Migrations Runner');
console.log('================================================\n');

console.log(`Project URL: ${SUPABASE_URL}`);

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get migrations directory
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Read all migration files
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log(`\nFound ${migrationFiles.length} migration files\n`);

async function runMigration(filename) {
  const filepath = path.join(migrationsDir, filename);
  const sqlContent = fs.readFileSync(filepath, 'utf8');
  
  console.log(`[${filename}] Running...`);
  
  try {
    // Execute SQL using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      console.log(`  ❌ FAILED: ${error.message}`);
      return false;
    }
    
    console.log(`  ✅ SUCCESS`);
    return true;
  } catch (err) {
    console.log(`  ❌ ERROR: ${err.message}`);
    return false;
  }
}

async function main() {
  let successCount = 0;
  let failCount = 0;
  
  console.log('⚠️  NOTE: REST API cannot directly execute DDL SQL');
  console.log('    This script requires a custom RPC function or Supabase CLI\n');
  
  console.log('================================================');
  console.log('Migration Files:');
  console.log('================================================\n');
  
  migrationFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  console.log('\n================================================');
  console.log('Recommended Actions:');
  console.log('================================================\n');
  
  console.log('Option 1: Use Supabase Dashboard (Easiest)');
  console.log('  1. Go to: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/editor/sql');
  console.log(`  2. Open migration files from: ${migrationsDir}`);
  console.log('  3. Copy and paste each SQL file content');
  console.log('  4. Click "Run" for each migration\n');
  
  console.log('Option 2: Use Supabase CLI');
  console.log('  npm install -g supabase');
  console.log('  supabase link --project-ref diexsbzqwsbpilsymnfb');
  console.log('  supabase db push\n');
  
  console.log('Option 3: Manual SQL Execution');
  console.log('  Connect to PostgreSQL using:');
  console.log('  postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres\n');
  
  console.log('================================================\n');
}

main().catch(console.error);
