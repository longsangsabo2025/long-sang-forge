#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

console.log('🚀 Creating SEO Database Tables via Transaction Pooler...\n');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.VITE_SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Read SQL file
const sqlFilePath = join(__dirname, 'setup-seo-database.sql');
console.log(`📖 Reading SQL from: ${sqlFilePath}\n`);

const sqlContent = readFileSync(sqlFilePath, 'utf-8');

console.log('⚙️  Executing SQL via PostgreSQL Transaction Pooler...\n');

try {
  // Execute the entire SQL script
  const result = await pool.query(sqlContent);
  console.log('✅ SQL executed successfully!\n');
  console.log('Result:', result);
} catch (error) {
  console.log('⚠️  Batch execution encountered issues:', error.message);
  console.log('Trying statement-by-statement execution...\n');
  
  // Split into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    if (!statement) continue;
    
    try {
      await pool.query(statement + ';');
      successCount++;
      process.stdout.write('.');
    } catch (err) {
      // Ignore "already exists" errors
      if (err.message.includes('already exists') || 
          err.message.includes('duplicate') ||
          err.message.includes('does not exist')) {
        process.stdout.write('s'); // s = skipped
      } else {
        console.error(`\n❌ Error:`, err.message);
        errorCount++;
      }
    }
  }
  
  console.log(`\n\n📊 Results: ${successCount} succeeded, ${errorCount} errors\n`);
}

// Verify tables
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
  try {
    await pool.query(`SELECT 1 FROM ${table} LIMIT 0`);
    console.log(`✅ ${table} - OK`);
  } catch (error) {
    console.log(`❌ ${table} - NOT FOUND`);
    allTablesExist = false;
  }
}

console.log('\n');

if (allTablesExist) {
  console.log('🎉 SUCCESS! All 6 SEO tables created!\n');
  console.log('Tables created:');
  console.log('  ✅ seo_domains');
  console.log('  ✅ seo_indexing_queue');
  console.log('  ✅ seo_keywords');
  console.log('  ✅ seo_analytics');
  console.log('  ✅ seo_settings');
  console.log('  ✅ seo_sitemaps\n');
  
  console.log('Next steps:');
  console.log('  1. Generate TypeScript types:');
  console.log('     npx supabase gen types typescript --project-id diexsbzqwsbpilsymnfb > src/integrations/supabase/types.gen.ts\n');
  console.log('  2. Restart dev server:');
  console.log('     npm run dev\n');
  console.log('  3. Visit SEO Center:');
  console.log('     http://localhost:8080/admin/seo-center\n');
} else {
  console.log('⚠️  Some tables could not be verified.\n');
  console.log('This might be a permission issue. Try verifying in Supabase Dashboard.');
}

// Close pool
await pool.end();
console.log('✨ Done!\n');
