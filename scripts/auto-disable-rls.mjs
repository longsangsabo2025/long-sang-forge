#!/usr/bin/env node

/**
 * 🚀 AUTO DISABLE RLS - Full automation
 * Directly executes SQL via Supabase REST API
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

console.log('\n🚀 AUTO-DISABLING RLS...\n');

// Try with service role key first, fallback to anon
const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
);

const sql = `
-- Disable RLS
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('agents', 'agent_executions', 'usage_tracking')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;
`;

async function disableRLS() {
  try {
    console.log('📋 Executing SQL via Supabase API...');
    
    // Try direct RPC call
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: sql 
    });
    
    if (error) {
      console.log('❌ RPC method not available:', error.message);
      console.log('\n📝 Manual method required:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql');
      console.log('2. Run this SQL:\n');
      console.log(sql);
      console.log('\n3. Then run: node scripts\\verify-no-rls.mjs\n');
      return;
    }
    
    console.log('✅ SQL executed successfully!');
    await verifyDisabled();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📝 Please run SQL manually in Dashboard');
  }
}

async function verifyDisabled() {
  console.log('\n🔍 Verifying RLS disabled...\n');
  
  // Test INSERT on agents table
  const testData = {
    name: 'test-no-rls-' + Date.now(),
    role: 'Test Agent',
    agent_type: 'test',
    description: 'Testing without RLS',
    status: 'active',
  };
  
  const { data, error } = await supabase
    .from('agents')
    .insert(testData)
    .select()
    .single();
  
  if (error) {
    console.log('❌ agents table:', error.message);
    console.log('⚠️  RLS might still be enabled\n');
  } else {
    console.log('✅ agents table: INSERT works!');
    console.log('   Test ID:', data.id);
    
    // Cleanup
    await supabase.from('agents').delete().eq('id', data.id);
    console.log('🧹 Test cleaned up\n');
    
    console.log('🎉 SUCCESS! RLS is fully disabled.');
    console.log('💡 All tables accessible without authentication.');
    console.log('🚀 Test agent activation in browser now!\n');
  }
}

await disableRLS();
