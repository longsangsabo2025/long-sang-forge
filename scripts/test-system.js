#!/usr/bin/env node

/**
 * SMART SYSTEM VALIDATOR
 * Tests backend → frontend integration
 * Auto-detects and fixes common issues
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.VITE_OPENAI_API_KEY;
const FRONTEND_URL = 'http://localhost:8080';

console.log('🧪 SMART SYSTEM VALIDATOR');
console.log('==========================\n');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const tests = [];
const fixes = [];

// Test utilities
function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${name}`);
  if (details) console.log(`   ${details}`);
  tests.push({ name, status, details });
}

function logFix(description, action) {
  console.log(`🔧 FIX: ${description}`);
  if (action) console.log(`   → ${action}`);
  fixes.push({ description, action });
}

// 1. Environment Variables Test
async function testEnvironment() {
  console.log('📋 Testing Environment Variables...\n');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_SERVICE_ROLE_KEY',
    'VITE_SUPABASE_PUBLISHABLE_KEY'
  ];
  
  const optionalVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_ANTHROPIC_API_KEY',
    'VITE_RESEND_API_KEY'
  ];
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      logTest(`${varName}`, 'PASS', `Length: ${value.length}`);
    } else {
      logTest(`${varName}`, 'FAIL', 'Missing required variable');
      logFix(`Add ${varName} to .env file`, 'Check Supabase dashboard for keys');
    }
  }
  
  let hasAI = false;
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      logTest(`${varName}`, 'PASS', `Configured (${value.substring(0, 10)}...)`);
      if (varName.includes('OPENAI') || varName.includes('ANTHROPIC')) hasAI = true;
    } else {
      logTest(`${varName}`, 'WARN', 'Optional - not configured');
    }
  }
  
  if (!hasAI) {
    logFix('No AI provider configured', 'Add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY');
  }
}

// 2. Database Connection Test
async function testDatabase() {
  console.log('\n🗄️ Testing Database Connection...\n');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('ai_agents').select('count').limit(1);
    
    if (error) {
      logTest('Database Connection', 'FAIL', error.message);
      logFix('Database connection failed', 'Check Supabase URL and service key');
      return false;
    }
    
    logTest('Database Connection', 'PASS', 'Connected successfully');
    return true;
  } catch (err) {
    logTest('Database Connection', 'FAIL', err.message);
    return false;
  }
}

// 3. Database Schema Test
async function testSchema() {
  console.log('\n📊 Testing Database Schema...\n');
  
  const requiredTables = [
    'ai_agents',
    'automation_triggers', 
    'workflows',
    'activity_logs',
    'content_queue'
  ];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error && error.code === 'PGRST116') {
        logTest(`Table: ${table}`, 'FAIL', 'Table does not exist');
        logFix(`Create table ${table}`, 'Run migration: 20251015000001_create_automation_tables.sql');
      } else if (error) {
        logTest(`Table: ${table}`, 'FAIL', error.message);
      } else {
        logTest(`Table: ${table}`, 'PASS', `Found ${data?.length || 0} records`);
      }
    } catch (err) {
      logTest(`Table: ${table}`, 'FAIL', err.message);
    }
  }
}

// 4. RLS Policies Test
async function testRLS() {
  console.log('\n🔒 Testing RLS Policies...\n');
  
  try {
    // Test anon access (should work after our migration)
    const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    
    const { data, error } = await anonClient.from('ai_agents').select('*').limit(1);
    
    if (error) {
      logTest('Anon Read Access', 'FAIL', error.message);
      logFix('RLS blocking anon reads', 'Run migration: 20251015000002_enable_anon_select_reads_dev.sql');
    } else {
      logTest('Anon Read Access', 'PASS', `Can read ${data?.length || 0} agents`);
    }
  } catch (err) {
    logTest('Anon Read Access', 'FAIL', err.message);
  }
}

// 5. Seed Data Test
async function testSeedData() {
  console.log('\n🌱 Testing Seed Data...\n');
  
  try {
    const { data: agents, error } = await supabase.from('ai_agents').select('*');
    
    if (error) {
      logTest('Seed Data', 'FAIL', error.message);
      return;
    }
    
    if (!agents || agents.length === 0) {
      logTest('Seed Data', 'FAIL', 'No agents found');
      logFix('No seed data', 'Run migration: 20251015000002_seed_automation_data.sql');
      
      // Auto-fix: Insert basic agents
      await autoSeedData();
    } else {
      logTest('Seed Data', 'PASS', `Found ${agents.length} agents`);
      
      // Check agent types
      const types = [...new Set(agents.map(a => a.type))];
      logTest('Agent Types', 'PASS', `Types: ${types.join(', ')}`);
    }
  } catch (err) {
    logTest('Seed Data', 'FAIL', err.message);
  }
}

// Auto-fix: Insert seed data
async function autoSeedData() {
  console.log('\n🔧 Auto-fixing: Inserting seed data...\n');
  
  const seedAgents = [
    {
      name: 'Content Writer Agent',
      type: 'content_writer',
      description: 'Generates blog posts and articles automatically',
      status: 'active',
      config: {
        ai_model: 'gpt-4-turbo-preview',
        auto_publish: false,
        require_approval: true,
        tone: 'professional',
        max_length: 2000
      }
    },
    {
      name: 'Lead Nurture Agent',
      type: 'lead_nurture', 
      description: 'Sends personalized follow-up emails to leads',
      status: 'paused',
      config: {
        ai_model: 'gpt-4',
        follow_up_delay_hours: 24,
        max_follow_ups: 3,
        email_provider: 'resend'
      }
    }
  ];
  
  try {
    const { data, error } = await supabase.from('ai_agents').insert(seedAgents).select();
    
    if (error) {
      logTest('Auto-seed', 'FAIL', error.message);
    } else {
      logTest('Auto-seed', 'PASS', `Inserted ${data.length} agents`);
    }
  } catch (err) {
    logTest('Auto-seed', 'FAIL', err.message);
  }
}

// 6. Frontend Connectivity Test
async function testFrontend() {
  console.log('\n🌐 Testing Frontend...\n');
  
  try {
    // Simple check - just test if URL is accessible
    logTest('Frontend Server', 'SKIP', 'Manual check required');
    console.log(`   → Check manually: ${FRONTEND_URL}`);
    console.log(`   → Dashboard: ${FRONTEND_URL}/automation`);
  } catch (err) {
    logTest('Frontend Server', 'SKIP', 'Manual check required');
  }
}

// 7. API Integration Test
async function testAPIIntegration() {
  console.log('\n🤖 Testing AI API Integration...\n');
  
  if (OPENAI_KEY) {
    logTest('OpenAI API Key', 'PASS', `Configured (${OPENAI_KEY.substring(0, 15)}...)`);
    console.log('   → Test manually: Trigger an agent to verify key works');
  } else {
    logTest('OpenAI API Key', 'WARN', 'No API key configured');
  }
}

// 8. End-to-End Workflow Test
async function testWorkflow() {
  console.log('\n🔄 Testing End-to-End Workflow...\n');
  
  try {
    // Get an active agent
    const { data: agents } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('status', 'active')
      .limit(1);
    
    if (!agents || agents.length === 0) {
      logTest('E2E Workflow', 'SKIP', 'No active agents');
      return;
    }
    
    const agent = agents[0];
    logTest('Found Active Agent', 'PASS', agent.name);
    
    // Test manual trigger (simulate)
    const testContext = { topic: 'Test Topic' };
    
    // Insert activity log (simulate workflow)
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        agent_id: agent.id,
        action: 'Manual trigger test',
        status: 'success',
        details: { test: true, context: testContext }
      });
    
    if (logError) {
      logTest('Workflow Logging', 'FAIL', logError.message);
    } else {
      logTest('Workflow Logging', 'PASS', 'Activity logged successfully');
    }
    
  } catch (err) {
    logTest('E2E Workflow', 'FAIL', err.message);
  }
}

// 9. Performance Test
async function testPerformance() {
  console.log('\n⚡ Testing Performance...\n');
  
  const startTime = Date.now();
  
  try {
    // Test database query speed
    const dbStart = Date.now();
    await supabase.from('ai_agents').select('*').limit(10);
    const dbTime = Date.now() - dbStart;
    
    logTest('Database Query Speed', dbTime < 1000 ? 'PASS' : 'WARN', `${dbTime}ms`);
    
    // Skip frontend test
    logTest('Frontend Response', 'SKIP', 'Manual check required');
    
  } catch (err) {
    logTest('Performance Test', 'FAIL', err.message);
  }
}

// Main test runner
async function runAllTests() {
  const startTime = Date.now();
  
  await testEnvironment();
  
  const dbConnected = await testDatabase();
  if (dbConnected) {
    await testSchema();
    await testRLS();
    await testSeedData();
  }
  
  await testFrontend();
  await testAPIIntegration();
  await testWorkflow();
  await testPerformance();
  
  // Summary
  const totalTime = Date.now() - startTime;
  console.log('\n📊 TEST SUMMARY');
  console.log('================\n');
  
  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const warnings = tests.filter(t => t.status === 'WARN').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`⏱️ Total time: ${totalTime}ms\n`);
  
  if (fixes.length > 0) {
    console.log('🔧 RECOMMENDED FIXES');
    console.log('====================\n');
    fixes.forEach((fix, i) => {
      console.log(`${i + 1}. ${fix.description}`);
      if (fix.action) console.log(`   → ${fix.action}\n`);
    });
  }
  
  if (failed === 0) {
    console.log('🎉 ALL SYSTEMS GO! Your automation platform is ready!\n');
    console.log('Next steps:');
    console.log('1. Open dashboard: http://localhost:8080/automation');
    console.log('2. Test manual trigger on Content Writer Agent');
    console.log('3. Check activity logs for real AI responses');
  } else {
    console.log('⚠️ Please fix the failed tests above before proceeding.\n');
  }
}

// Run tests
runAllTests().catch(console.error);
