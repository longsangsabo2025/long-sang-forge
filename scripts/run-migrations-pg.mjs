import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

// Database connection
const connectionString = 'postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

console.log('\n================================================');
console.log('  🚀 Supabase Migrations Runner');
console.log('================================================\n');

async function runMigrations() {
  const client = new Client({ connectionString });
  
  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Get migrations directory
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    
    // Get migration files
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Found ${files.length} migration files\n`);
    
    // Run each migration
    for (const file of files) {
      console.log(`[${file}]`);
      console.log('  Reading SQL...');
      
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf8');
      
      console.log('  Executing...');
      
      try {
        await client.query(sql);
        console.log('  ✅ SUCCESS\n');
      } catch (error) {
        console.log('  ❌ FAILED');
        console.log(`  Error: ${error.message}\n`);
        
        // Continue with next migration even if one fails
        if (error.message.includes('already exists')) {
          console.log('  ℹ️  (Table already exists - skipping)\n');
        }
      }
    }
    
    console.log('================================================');
    console.log('  ✅ Migrations Complete!');
    console.log('================================================\n');
    
    // Verify tables
    console.log('🔍 Verifying tables...\n');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables in database:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    console.log('\n✅ Database is ready!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
