#!/usr/bin/env node

/**
 * 🔧 Auto-Fix Marketplace RLS Policies
 * Applies the RLS fix to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

console.log('\n🔧 Fixing Marketplace RLS Policies...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read SQL file
const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20251112000001_fix_marketplace_rls.sql');
let sql;

try {
  sql = readFileSync(sqlPath, 'utf-8');
} catch (error) {
  console.error('❌ Cannot read SQL file:', error.message);
  console.log('\n💡 Manual fix required:');
  console.log('   Go to Supabase Dashboard → SQL Editor');
  console.log('   Run this SQL:\n');
  console.log(`
-- Allow demo mode access to agents table
CREATE POLICY "Allow anon insert agents" ON agents
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon select agents" ON agents
FOR SELECT TO anon
USING (true);

-- Allow demo mode access to agent_executions
CREATE POLICY "Allow anon insert executions" ON agent_executions
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon update executions" ON agent_executions
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);
  `);
  process.exit(1);
}

async function applyFix() {
  console.log('📋 SQL file loaded successfully');
  console.log('🚀 Applying RLS policies...\n');
  
  try {
    // Split SQL into statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    let success = 0;
    let skipped = 0;
    
    for (const statement of statements) {
      if (!statement) {
        skipped++;
        continue;
      }
      
      // Use rpc or direct SQL execution
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // If rpc doesn't exist, we need to do it manually
        if (error.code === '42883') {
          console.log('⚠️  Cannot execute SQL via API');
          console.log('📋 Please run the migration manually:\n');
          console.log('   1. Go to Supabase Dashboard');
          console.log('   2. SQL Editor');
          console.log('   3. Run: supabase/migrations/20251112000001_fix_marketplace_rls.sql\n');
          process.exit(0);
        }
        
        // Some errors are OK (policy already exists, etc)
        if (!error.message.includes('already exists')) {
          console.error(`❌ Error executing statement: ${error.message}`);
        }
      } else {
        success++;
      }
    }
    
    console.log(`✅ Applied ${success} policies successfully`);
    if (skipped > 0) console.log(`ℹ️  Skipped ${skipped} empty statements`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual fix required - see instructions above');
    process.exit(1);
  }
}

async function verifyFix() {
  console.log('\n🔍 Verifying RLS policies...\n');
  
  // Test 1: Try to query agents table
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('count')
    .limit(1);
  
  if (agentsError) {
    console.error('❌ agents table:', agentsError.message);
  } else {
    console.log('✅ agents table: Accessible');
  }
  
  // Test 2: Try to insert a test agent
  const { data: testAgent, error: insertError } = await supabase
    .from('agents')
    .insert({
      name: 'test-policy-' + Date.now(),
      role: 'Test Agent',
      agent_type: 'test',
      description: 'Testing RLS policy',
      status: 'active',
    })
    .select()
    .single();
  
  if (insertError) {
    if (insertError.code === '42501') {
      console.error('❌ INSERT blocked: RLS policy issue');
      console.log('\n💡 Fix manually in Supabase Dashboard → SQL Editor:');
      console.log(`
CREATE POLICY "Allow anon insert agents" ON agents
FOR INSERT TO anon
WITH CHECK (true);
      `);
    } else {
      console.error('❌ INSERT error:', insertError.message);
    }
  } else {
    console.log('✅ INSERT test: Success');
    
    // Cleanup test agent
    await supabase.from('agents').delete().eq('id', testAgent.id);
    console.log('🧹 Test agent cleaned up');
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (!agentsError && !insertError) {
    console.log('🎉 SUCCESS! Marketplace RLS is configured correctly.');
    console.log('\n✅ You can now:');
    console.log('   1. Refresh the marketplace page');
    console.log('   2. Click "Activate" on any agent');
    console.log('   3. Agent should activate without errors');
  } else {
    console.log('⚠️  Some issues detected. Manual fix required.');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. Authentication → Policies');
    console.log('   3. Add policies for agents, agent_executions, usage_tracking tables');
  }
  console.log('='.repeat(60) + '\n');
}

// Run
applyFix().then(() => verifyFix());
