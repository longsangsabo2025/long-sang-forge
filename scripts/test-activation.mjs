#!/usr/bin/env node

/**
 * 🧪 TEST AGENT ACTIVATION
 * Simulate the exact activation flow
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('\n🧪 TESTING AGENT ACTIVATION...\n');

// Simulate MVPAgent data
const testAgent = {
  id: 'lead-qualifier',
  name: 'AI Lead Qualifier',
  category: 'sales',
  description: 'Automatically qualify and score sales leads',
  icon: '🎯',
  tagline: 'Never miss a hot lead',
  features: ['Lead scoring', 'Qualification'],
  rating: 4.8,
  use_cases: ['Sales', 'Marketing'],
  system_prompt: 'You are a lead qualifier',
  config: {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1000,
  },
  pricing: {
    cost_per_run: 0.01,
    free_trial_runs: 10,
  }
};

async function testActivation() {
  const userId = 'demo-user-test-' + Date.now();
  
  console.log('👤 Demo User ID:', userId);
  console.log('🤖 Agent:', testAgent.name);
  console.log('');
  
  // Step 1: Check if agent exists
  console.log('📋 Step 1: Checking if agent exists...');
  const { data: existing } = await supabase
    .from('agents')
    .select('id')
    .eq('name', testAgent.id)
    .single();
  
  if (existing) {
    console.log('   ✅ Agent already exists:', existing.id);
    console.log('   🧹 Cleaning up for fresh test...');
    await supabase.from('agents').delete().eq('id', existing.id);
  } else {
    console.log('   📝 Agent not found - will create new');
  }
  
  // Step 2: Insert new agent
  console.log('\n📋 Step 2: Inserting agent...');
  const insertData = {
    name: testAgent.id,
    role: testAgent.name,
    agent_type: testAgent.category,
    description: testAgent.description,
    status: 'active',
    // Skip created_by for demo mode (not a valid UUID)
    config: {
      model: testAgent.config.model,
      temperature: testAgent.config.temperature,
      max_tokens: testAgent.config.max_tokens,
      system_prompt: testAgent.system_prompt,
      pricing: testAgent.pricing,
    },
    capabilities: testAgent.use_cases,
    metadata: {
      icon: testAgent.icon,
      tagline: testAgent.tagline,
      features: testAgent.features,
      rating: testAgent.rating,
    }
  };
  
  console.log('   📦 Data to insert:');
  console.log('   ', JSON.stringify(insertData, null, 2).split('\n').join('\n    '));
  
  const { data: newAgent, error } = await supabase
    .from('agents')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    console.log('\n❌ ACTIVATION FAILED!');
    console.log('   Error Code:', error.code);
    console.log('   Error Message:', error.message);
    console.log('   Error Details:', error.details);
    console.log('   Error Hint:', error.hint);
    console.log('\n🔍 This is the exact error from browser!\n');
    process.exit(1);
  }
  
  console.log('\n✅ ACTIVATION SUCCESS!');
  console.log('   Agent ID:', newAgent.id);
  console.log('   Agent Name:', newAgent.name);
  console.log('   Agent Status:', newAgent.status);
  
  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  await supabase.from('agents').delete().eq('id', newAgent.id);
  
  console.log('\n🎉 ALL TESTS PASSED!');
  console.log('💡 Agent activation should work in browser now.\n');
}

await testActivation();
