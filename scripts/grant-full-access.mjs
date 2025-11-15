#!/usr/bin/env node

/**
 * 🎯 SMART RLS BYPASS
 * Instead of disabling RLS, we grant FULL permissions to anon role
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

console.log('\n🎯 SMART APPROACH: Grant full access to anon role\n');
console.log('Instead of disabling RLS (requires admin),');
console.log('we create policies that allow EVERYTHING.\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createFullAccessPolicies() {
  console.log('📋 SQL to run in Dashboard:\n');
  console.log('https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql\n');
  
  const sql = `
-- ============================================
-- GRANT FULL ACCESS TO ANON (Dev Mode)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "dev_full_access_agents" ON agents;
DROP POLICY IF EXISTS "dev_full_access_executions" ON agent_executions;
DROP POLICY IF EXISTS "dev_full_access_tracking" ON usage_tracking;

-- Enable RLS (required for policies to work)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow EVERYTHING)
CREATE POLICY "dev_full_access_agents" ON agents
    FOR ALL 
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "dev_full_access_executions" ON agent_executions
    FOR ALL 
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "dev_full_access_tracking" ON usage_tracking
    FOR ALL 
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Verify
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename IN ('agents', 'agent_executions', 'usage_tracking')
ORDER BY tablename, policyname;
`;

  console.log(sql);
  console.log('\n✅ After running, test with: node scripts\\verify-no-rls.mjs\n');
}

async function testCurrentAccess() {
  console.log('🔍 Testing current access...\n');
  
  const testData = {
    name: 'test-agent-' + Date.now(),
    role: 'Test Agent',
    agent_type: 'test',
    description: 'Testing access',
    status: 'active',
  };
  
  const { data, error } = await supabase
    .from('agents')
    .insert(testData)
    .select()
    .single();
  
  if (error) {
    console.log('❌ Current access: BLOCKED');
    console.log('   Error:', error.message);
    console.log('\n👆 Run the SQL above to fix this!\n');
  } else {
    console.log('✅ Current access: WORKING');
    console.log('   Test ID:', data.id);
    await supabase.from('agents').delete().eq('id', data.id);
    console.log('🧹 Cleaned up\n');
    console.log('🎉 No changes needed! Access already working.\n');
  }
}

await createFullAccessPolicies();
await testCurrentAccess();
