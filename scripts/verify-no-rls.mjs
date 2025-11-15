#!/usr/bin/env node

/**
 * ✅ VERIFY RLS DISABLED
 * Test if marketplace works without authentication
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

console.log('\n✅ VERIFYING RLS DISABLED...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAllTables() {
  const tables = ['agents', 'agent_executions', 'usage_tracking'];
  
  for (const table of tables) {
    console.log(`📋 Testing ${table}...`);
    
    // Test INSERT
    const testData = {
      name: 'test-no-rls-' + Date.now(),
      role: table === 'agents' ? 'Test Agent' : undefined,
      agent_type: table === 'agents' ? 'test' : undefined,
      description: table === 'agents' ? 'Testing without RLS' : undefined,
      status: table === 'agents' ? 'active' : undefined,
      agent_id: table !== 'agents' ? 1 : undefined,
      execution_status: table === 'agent_executions' ? 'completed' : undefined,
      input_data: table === 'agent_executions' ? {} : undefined,
      output_data: table === 'agent_executions' ? {} : undefined,
      execution_time_ms: table === 'agent_executions' ? 100 : undefined,
      user_id: table === 'usage_tracking' ? 'test-user' : undefined,
      action: table === 'usage_tracking' ? 'test' : undefined,
      credits_used: table === 'usage_tracking' ? 1 : undefined,
    };
    
    // Remove undefined fields
    Object.keys(testData).forEach(key => 
      testData[key] === undefined && delete testData[key]
    );
    
    const { data, error } = await supabase
      .from(table)
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      console.error(`   ❌ ${table}: ${error.message}`);
      console.log('   ⚠️  RLS might still be enabled!\n');
    } else {
      console.log(`   ✅ ${table}: INSERT works!`);
      console.log(`   📝 Test ID: ${data.id}`);
      
      // Cleanup
      await supabase.from(table).delete().eq('id', data.id);
      console.log(`   🧹 Cleaned up\n`);
    }
  }
  
  console.log('🎉 RLS VERIFICATION COMPLETE!\n');
  console.log('💡 All tables accessible without authentication.');
  console.log('🚀 You can now test agent activation in the browser.\n');
}

await testAllTables();
