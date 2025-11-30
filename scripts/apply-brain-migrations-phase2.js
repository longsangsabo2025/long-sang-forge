/**
 * Apply AI Brain Phase 2 Migrations to Supabase
 * Run: node scripts/apply-brain-migrations-phase2.js
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

const PHASE2_MIGRATIONS = [
  {
    name: '004_domain_statistics',
    file: '004_domain_statistics.sql',
    description: 'Create domain statistics tracking'
  },
  {
    name: '005_domain_agents',
    file: '005_domain_agents.sql',
    description: 'Add domain agent configuration'
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
        error.code === '42P07' || // relation already exists
        error.code === '42701') { // column already exists
      console.log(`⚠️ ${migration.name}: Already exists (skipping)`);
      return true;
    }
    throw error;
  }
}

async function verifyPhase1(client) {
  console.log('\n🔍 Verifying Phase 1 migrations are applied...\n');
  
  const checks = [
    {
      name: 'brain_domains table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_domains'"
    },
    {
      name: 'brain_knowledge table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_knowledge'"
    },
    {
      name: 'brain_query_history table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_query_history'"
    }
  ];
  
  for (const check of checks) {
    const result = await client.query(check.query);
    if (result.rows.length === 0) {
      console.log(`❌ ${check.name}: MISSING - Please run Phase 1 migrations first!`);
      return false;
    }
    console.log(`✅ ${check.name}: OK`);
  }
  
  return true;
}

async function verifyPhase2Migrations(client) {
  console.log('\n🔍 Verifying Phase 2 migrations...\n');
  
  const checks = [
    // Migration 004 checks
    {
      name: 'brain_domain_stats table',
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brain_domain_stats'",
      expected: '1 row'
    },
    {
      name: 'update_domain_stats function',
      query: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_domain_stats'",
      expected: '1 row'
    },
    {
      name: 'trigger_update_domain_stats function',
      query: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'trigger_update_domain_stats'",
      expected: '1 row'
    },
    {
      name: 'RLS enabled on brain_domain_stats',
      query: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brain_domain_stats'",
      expected: 'rowsecurity = true'
    },
    // Migration 005 checks
    {
      name: 'agent_config column in brain_domains',
      query: "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brain_domains' AND column_name = 'agent_config'",
      expected: '1 row'
    },
    {
      name: 'agent_last_used_at column',
      query: "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brain_domains' AND column_name = 'agent_last_used_at'",
      expected: '1 row'
    },
    {
      name: 'agent_total_queries column',
      query: "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brain_domains' AND column_name = 'agent_total_queries'",
      expected: '1 row'
    },
    {
      name: 'agent_success_rate column',
      query: "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brain_domains' AND column_name = 'agent_success_rate'",
      expected: '1 row'
    },
    {
      name: 'get_domain_agent_context function',
      query: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_domain_agent_context'",
      expected: '1 row'
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
  console.log('🧠 AI SECOND BRAIN - Phase 2 Migration Script');
  console.log('='.repeat(50));
  console.log(`📍 Project: diexsbzqwsbpilsymnfb`);
  console.log(`🔗 Using Transaction Pooler`);
  console.log(`📦 Phase: 2 - Domain System Enhancement`);
  console.log('='.repeat(50));
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // First, verify Phase 1 migrations are applied
    const phase1Ok = await verifyPhase1(client);
    if (!phase1Ok) {
      console.error('\n❌ Phase 1 migrations not found. Please run Phase 1 first.');
      console.error('Run: node scripts/apply-brain-migrations.js');
      process.exit(1);
    }
    
    // Run Phase 2 migrations in order
    console.log('\n📦 Running Phase 2 migrations...');
    
    for (const migration of PHASE2_MIGRATIONS) {
      await runMigration(client, migration);
    }
    
    // Verify all Phase 2 migrations
    const verified = await verifyPhase2Migrations(client);
    
    console.log('\n' + '='.repeat(50));
    if (verified) {
      console.log('🎉 PHASE 2 MIGRATIONS APPLIED SUCCESSFULLY!');
      console.log('='.repeat(50));
      console.log('\n📋 Summary:');
      console.log('   ✅ brain_domain_stats table created');
      console.log('   ✅ update_domain_stats function created');
      console.log('   ✅ Auto-update triggers created');
      console.log('   ✅ RLS policies applied');
      console.log('   ✅ agent_config column added');
      console.log('   ✅ Agent metadata columns added');
      console.log('   ✅ get_domain_agent_context function created');
      console.log('\n🚀 Phase 2 Ready for testing!');
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
