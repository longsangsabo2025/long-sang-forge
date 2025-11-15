#!/usr/bin/env node

/**
 * 🔧 AUTO-FIX 401 ERROR
 * Apply full access policies via Supabase Management API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

console.log('\n🔧 FIXING 401 ERROR - Applying Full Access Policies\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBefore() {
  console.log('📋 Testing BEFORE fix...');
  
  const { data, error } = await supabase
    .from('agents')
    .select('id')
    .limit(1);
  
  if (error) {
    console.log('   ❌ 401 Error confirmed:', error.message);
    console.log('   🔧 Need to apply policies...\n');
    return false;
  } else {
    console.log('   ✅ Already working! No fix needed.\n');
    return true;
  }
}

async function showManualSteps() {
  console.log('📝 MANUAL STEPS REQUIRED:\n');
  console.log('1. Open Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql\n');
  
  console.log('2. Copy & paste this SQL:\n');
  console.log('─'.repeat(60));
  
  const sql = readFileSync('FIX_401_ERROR.sql', 'utf-8');
  console.log(sql);
  
  console.log('─'.repeat(60));
  console.log('\n3. Click "RUN" button\n');
  console.log('4. After running, test with: node scripts\\test-401-fix.mjs\n');
}

async function testAfter() {
  console.log('🔍 Testing AFTER fix...\n');
  
  // Test SELECT
  const { data: selectData, error: selectError } = await supabase
    .from('agents')
    .select('id')
    .limit(1);
  
  if (selectError) {
    console.log('❌ SELECT still blocked:', selectError.message);
    return false;
  }
  console.log('✅ SELECT: Working');
  
  // Test INSERT
  const testData = {
    name: 'test-401-' + Date.now(),
    role: 'Test',
    agent_type: 'test',
    description: 'Testing 401 fix',
    status: 'active',
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('agents')
    .insert(testData)
    .select()
    .single();
  
  if (insertError) {
    console.log('❌ INSERT still blocked:', insertError.message);
    return false;
  }
  console.log('✅ INSERT: Working');
  console.log('   Test ID:', insertData.id);
  
  // Cleanup
  await supabase.from('agents').delete().eq('id', insertData.id);
  console.log('🧹 Test cleaned up\n');
  
  console.log('🎉 ALL TESTS PASSED!');
  console.log('💡 Marketplace should work in browser now.\n');
  return true;
}

// Main flow
const workingBefore = await testBefore();

if (!workingBefore) {
  await showManualSteps();
} else {
  console.log('✨ Everything already working! Try refreshing browser.\n');
}

// If you want to test after manual fix, run:
// node scripts\test-401-fix.mjs
