#!/usr/bin/env node

/**
 * 🚀 DISABLE ALL RLS - DEV MODE
 * Remove all restrictions for fast development
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

console.log('\n🚀 DISABLING ALL RLS FOR DEV MODE...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function disableRLS() {
  console.log('📋 Manual steps required:\n');
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project: diexsbzqwsbpilsymnfb');
  console.log('3. SQL Editor');
  console.log('4. Run this SQL:\n');
  
  console.log('-- Disable RLS on all marketplace tables');
  console.log('ALTER TABLE agents DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE agent_executions DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE usage_tracking DISABLE ROW LEVEL SECURITY;\n');
  
  console.log('✅ Or run the migration file:');
  console.log('   supabase/migrations/20251112000002_disable_all_rls.sql\n');
}

async function verifyRLS() {
  console.log('🔍 Testing after RLS disabled...\n');
  
  // Test INSERT without authentication
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
    console.error('❌ Still blocked:', error.message);
    console.log('\n⚠️ RLS might still be enabled. Run SQL manually.\n');
  } else {
    console.log('✅ SUCCESS! Can insert without RLS');
    console.log('   Test agent ID:', data.id);
    
    // Cleanup
    await supabase.from('agents').delete().eq('id', data.id);
    console.log('🧹 Test agent cleaned up\n');
    
    console.log('🎉 RLS DISABLED! Full access enabled.');
    console.log('💡 All tables now accessible without authentication.\n');
  }
}

disableRLS().then(() => {
  console.log('⏱️  After running SQL, test with:');
  console.log('   node scripts/verify-no-rls.mjs\n');
});
