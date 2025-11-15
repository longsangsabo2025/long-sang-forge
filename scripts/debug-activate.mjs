#!/usr/bin/env node

/**
 * 🔍 Debug Script - Check Activate Agent Error
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://apbhzsppxthdhmihihgz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwYmh6c3BweHRoZGhtaWhpaGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyNzgzMDUsImV4cCI6MjA0NTg1NDMwNX0.JbQVZqWnUP-Soo3u_Y0gvY3KaTJAhfLPd33j3PqAm_M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugActivateAgent() {
  console.log('\n🔍 Debugging Agent Activation...\n');
  
  // Test 1: Check database connection
  console.log('1️⃣ Testing database connection...');
  try {
    const { data, error } = await supabase.from('agents').select('count').limit(1);
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    console.log('✅ Database connected\n');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }
  
  // Test 2: Check agents table structure
  console.log('2️⃣ Checking agents table structure...');
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table error:', error);
      console.log('\n📋 Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Table structure:');
      console.log(Object.keys(data[0]).join(', '));
    } else {
      console.log('⚠️ Table is empty');
    }
    console.log();
  } catch (err) {
    console.error('❌ Query failed:', err.message);
    return;
  }
  
  // Test 3: Try to insert a test agent
  console.log('3️⃣ Testing agent insertion...');
  try {
    const testAgent = {
      name: 'test-agent-' + Date.now(),
      role: 'Test Agent',
      agent_type: 'sales',
      description: 'Test agent for debugging',
      status: 'active',
      config: {
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 1000,
      },
    };
    
    console.log('📤 Inserting:', testAgent);
    
    const { data, error } = await supabase
      .from('agents')
      .insert(testAgent)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Insert failed:', error);
      console.log('\n📋 Error details:');
      console.log('  Code:', error.code);
      console.log('  Message:', error.message);
      console.log('  Details:', error.details);
      console.log('  Hint:', error.hint);
      
      // Check for common issues
      if (error.code === '42501') {
        console.log('\n💡 Solution: Row Level Security (RLS) is blocking the insert.');
        console.log('   Go to Supabase dashboard → Authentication → Policies');
        console.log('   Add policy to allow INSERT on agents table');
      } else if (error.code === '23505') {
        console.log('\n💡 Solution: Duplicate key - agent already exists');
      } else if (error.code === '42703') {
        console.log('\n💡 Solution: Column doesn\'t exist - check table schema');
      }
      
      return;
    }
    
    console.log('✅ Agent inserted successfully!');
    console.log('   ID:', data.id);
    
    // Cleanup
    await supabase.from('agents').delete().eq('id', data.id);
    console.log('🧹 Test agent cleaned up\n');
    
  } catch (err) {
    console.error('❌ Insertion failed:', err.message);
    return;
  }
  
  // Test 4: Check RLS policies
  console.log('4️⃣ Checking Row Level Security...');
  try {
    const { data: policies, error } = await supabase
      .rpc('get_table_policies', { table_name: 'agents' })
      .single();
    
    if (error && error.code !== '42883') {
      console.log('⚠️ Cannot check RLS (need custom function)');
    }
  } catch (err) {
    console.log('⚠️ RLS check skipped');
  }
  console.log();
  
  console.log('✅ Debug complete!\n');
}

debugActivateAgent();
