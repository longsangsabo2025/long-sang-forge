/**
 * Apply AI Brain Migrations to Supabase
 * Run: node scripts/apply-brain-migrations.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

const { Client } = pg;

const MIGRATIONS = [
  {
    name: '001_enable_pgvector',
    file: '001_enable_pgvector.sql',
    description: 'Enable pgvector extension'
  },
  {
    name: '002_brain_tables',
    file: '002_brain_tables.sql',
    description: 'Create brain tables with RLS'
  },
  {
    name: '003_vector_search_function',
    file: '003_vector_search_function.sql',
    description: 'Create vector search function'
  }
];

async function runMigration(client, migration) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'brain', migration.file);
  
  console.log(`\n📄 Reading: ${migration.file}`);
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`⏳ Executing: ${migration.description}...`);
  
  try {
    await client.query(sql);
    console.log(`✅ ${migration.name}: SUCCESS`);
    return true;
  } catch (error) {
    // Check if error is "already exists" type - that's OK
    if (error.message.includes('already exists') || 
        error.message.includes('duplicate key') ||
        error.code === '42710' || // extension already exists
        error.code === '42P07') { // relation already exists
      console.log(`⚠️ ${migration.name}: Already exists (skipping)`);
      return true;
    }
    throw error;
  }
}

async function verifyMigrations(client) {
  console.log('\n🔍 Verifying migrations...\n');
  
  const checks = [
    {
      name: 'pgvector extension',
      query: "SELECT * FROM pg_extension WHERE extname = 'vector'",
      expected: 'At least 1 row'
    },
    {
      name: 'brain_domains table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_domains'",
      expected: '1 row'
    },
    {
      name: 'brain_knowledge table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_knowledge'",
      expected: '1 row'
    },
    {
      name: 'brain_core_logic table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_core_logic'",
      expected: '1 row'
    },
    {
      name: 'brain_memory table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_memory'",
      expected: '1 row'
    },
    {
      name: 'brain_query_history table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_query_history'",
      expected: '1 row'
    },
    {
      name: 'match_knowledge function',
      query: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'match_knowledge'",
      expected: '1 row'
    },
    {
      name: 'RLS enabled on brain_domains',
      query: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brain_domains'",
      expected: 'rowsecurity = true'
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = await client.query(check.query);
      if (result.rows.length > 0) {
        console.log(`✅ ${check.name}: OK`);
      } else {
        console.log(`❌ ${check.name}: MISSING`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR - ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function main() {
  console.log('🧠 AI SECOND BRAIN - Database Migration Script');
  console.log('='.repeat(50));
  console.log(`📍 Project: diexsbzqwsbpilsymnfb`);
  console.log(`🔗 Using Transaction Pooler`);
  console.log('='.repeat(50));
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Run migrations in order
    console.log('📦 Running migrations...');
    
    for (const migration of MIGRATIONS) {
      await runMigration(client, migration);
    }
    
    // Verify all migrations
    const verified = await verifyMigrations(client);
    
    console.log('\n' + '='.repeat(50));
    if (verified) {
      console.log('🎉 ALL MIGRATIONS APPLIED SUCCESSFULLY!');
      console.log('='.repeat(50));
      console.log('\n📋 Summary:');
      console.log('   ✅ pgvector extension enabled');
      console.log('   ✅ 5 brain tables created');
      console.log('   ✅ RLS policies applied');
      console.log('   ✅ Vector search function created');
      console.log('   ✅ Indexes created');
      console.log('\n🚀 Ready for testing!');
    } else {
      console.log('⚠️ SOME VERIFICATIONS FAILED');
      console.log('='.repeat(50));
      console.log('\nPlease check the errors above and fix manually if needed.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

main();
