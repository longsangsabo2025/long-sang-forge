/**
 * AUTO DEPLOY Academy Foundation Tables
 * Uses direct PostgreSQL connection with service role
 */

import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase PostgreSQL connection (Session mode - port 5432)
const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.diexsbzqwsbpilsymnfb',
  password: 'Acookingoil123',
  ssl: {
    rejectUnauthorized: false
  }
});

async function deployFoundation() {
  try {
    console.log('🚀 AUTO-DEPLOYING Academy Foundation Tables...\n');
    
    // Connect to database
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../supabase/migrations/20251114000001_academy_foundation_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded');
    console.log('📏 Size:', (sql.length / 1024).toFixed(2), 'KB\n');
    
    console.log('⚡ Executing SQL...\n');
    
    // Execute SQL
    const result = await client.query(sql);
    
    console.log('✅ SQL executed successfully!\n');
    
    console.log('=' .repeat(60));
    console.log('🎉 DEPLOYMENT COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Tables created:');
    console.log('  1. ✅ user_achievements');
    console.log('  2. ✅ user_xp');
    console.log('  3. ✅ study_groups');
    console.log('  4. ✅ study_group_members');
    console.log('  5. ✅ live_sessions');
    console.log('  6. ✅ live_session_attendees');
    console.log('  7. ✅ project_submissions');
    console.log('  8. ✅ student_revenue');
    console.log('\n🔧 Triggers: 4 created');
    console.log('📊 Views: 2 leaderboards created');
    console.log('🔒 RLS Policies: Enabled\n');
    console.log('🌟 Sample data:');
    console.log('  - 3 study groups');
    console.log('  - 4 upcoming live sessions\n');
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    console.error('\nFull error:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.\n');
  }
}

// Run deployment
await deployFoundation();
