#!/usr/bin/env node

/**
 * 🧪 E2E Test Script for AI Marketplace
 * Tests: Activate → Execute → Track Usage
 */

import { createClient } from '@supabase/supabase-js';

// Config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://apbhzsppxthdhmihihgz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwYmh6c3BweHRoZGhtaWhpaGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyNzgzMDUsImV4cCI6MjA0NTg1NDMwNX0.JbQVZqWnUP-Soo3u_Y0gvY3KaTJAhfLPd33j3PqAm_M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const TEST_AGENT = {
  id: 'lead-qualifier',
  name: 'Lead Qualifier Agent',
  category: 'sales',
  description: 'AI Agent for lead scoring',
  pricing: {
    price: 0.01,
    free_trial_runs: 50,
  },
  config: {
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 1000,
  },
  system_prompt: 'You are a lead qualification expert.',
};

const TEST_INPUT = {
  name: 'Test User',
  email: 'test@example.com',
  company: 'Test Corp',
  position: 'CEO',
  message: 'Looking for automation solution',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, emoji, message) {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

function logStep(step, total, message) {
  console.log(`\n${colors.cyan}[${step}/${total}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log('green', '✅', message);
}

function logError(message) {
  log('red', '❌', message);
}

function logInfo(message) {
  log('blue', 'ℹ️', message);
}

function logWarning(message) {
  log('yellow', '⚠️', message);
}

// Test functions
async function testDatabaseConnection() {
  logStep(1, 5, 'Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    logSuccess('Database connection successful');
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function testActivateAgent() {
  logStep(2, 5, 'Testing agent activation...');
  
  try {
    // Check if agent exists
    const { data: existing } = await supabase
      .from('agents')
      .select('id, name')
      .eq('name', TEST_AGENT.id)
      .single();
    
    if (existing) {
      logInfo(`Agent already exists: ${existing.id}`);
      return existing.id;
    }
    
    // Create agent
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert({
        name: TEST_AGENT.id,
        role: TEST_AGENT.name,
        agent_type: TEST_AGENT.category,
        description: TEST_AGENT.description,
        status: 'active',
        config: TEST_AGENT.config,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    logSuccess(`Agent activated: ${newAgent.id}`);
    return newAgent.id;
  } catch (error) {
    logError(`Agent activation failed: ${error.message}`);
    throw error;
  }
}

async function testCreateExecution(agentId) {
  logStep(3, 5, 'Testing execution creation...');
  
  try {
    const demoUserId = 'demo-user-test-' + Date.now();
    
    const { data: execution, error } = await supabase
      .from('agent_executions')
      .insert({
        agent_id: agentId,
        created_by: demoUserId,
        status: 'pending',
        input_data: TEST_INPUT,
        cost_usd: TEST_AGENT.pricing.price,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    logSuccess(`Execution created: ${execution.id}`);
    logInfo(`Input: ${JSON.stringify(TEST_INPUT, null, 2)}`);
    
    return execution.id;
  } catch (error) {
    logError(`Execution creation failed: ${error.message}`);
    throw error;
  }
}

async function testUpdateExecution(executionId) {
  logStep(4, 5, 'Testing execution update...');
  
  try {
    const mockOutput = {
      lead_score: 85,
      quality: 'HOT',
      reason: 'CEO level, clear intent',
      next_action: 'Schedule call immediately',
    };
    
    const { error } = await supabase
      .from('agent_executions')
      .update({
        status: 'completed',
        output_data: mockOutput,
        execution_time_ms: 2500,
        completed_at: new Date().toISOString(),
      })
      .eq('id', executionId);
    
    if (error) throw error;
    
    logSuccess('Execution updated successfully');
    logInfo(`Output: ${JSON.stringify(mockOutput, null, 2)}`);
    
    return true;
  } catch (error) {
    logError(`Execution update failed: ${error.message}`);
    throw error;
  }
}

async function testUsageTracking() {
  logStep(5, 5, 'Testing usage tracking...');
  
  try {
    const demoUserId = 'demo-user-test-' + Date.now();
    
    const { data: usage, error } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: demoUserId,
        usage_type: 'agent_execution',
        usage_count: 1,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    logSuccess(`Usage tracked: ${usage.id}`);
    
    return true;
  } catch (error) {
    logError(`Usage tracking failed: ${error.message}`);
    throw error;
  }
}

async function cleanup(agentId, executionId) {
  logInfo('\n🧹 Cleaning up test data...');
  
  try {
    // Delete execution
    if (executionId) {
      await supabase
        .from('agent_executions')
        .delete()
        .eq('id', executionId);
      logInfo(`Deleted execution: ${executionId}`);
    }
    
    // Don't delete agent - keep for reuse
    logInfo('Agent kept for future tests');
    
  } catch (error) {
    logWarning(`Cleanup warning: ${error.message}`);
  }
}

// Main test runner
async function runE2ETests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🧪 AI MARKETPLACE E2E TEST SUITE${colors.reset}`);
  console.log('='.repeat(60) + '\n');
  
  let agentId, executionId;
  let passed = 0;
  let failed = 0;
  
  try {
    // Test 1: Database Connection
    if (await testDatabaseConnection()) {
      passed++;
    } else {
      failed++;
      throw new Error('Database connection failed - aborting tests');
    }
    
    // Test 2: Activate Agent
    agentId = await testActivateAgent();
    passed++;
    
    // Test 3: Create Execution
    executionId = await testCreateExecution(agentId);
    passed++;
    
    // Test 4: Update Execution
    await testUpdateExecution(executionId);
    passed++;
    
    // Test 5: Track Usage
    await testUsageTracking();
    passed++;
    
  } catch (error) {
    failed++;
    logError(`\nTest suite failed: ${error.message}`);
  } finally {
    // Cleanup
    if (agentId && executionId) {
      await cleanup(agentId, executionId);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}📈 Success Rate: ${((passed / 5) * 100).toFixed(1)}%${colors.reset}`);
  console.log('='.repeat(60) + '\n');
  
  if (failed === 0) {
    logSuccess('🎉 All tests passed! Marketplace is ready to use.');
    process.exit(0);
  } else {
    logError('⚠️ Some tests failed. Check logs above for details.');
    process.exit(1);
  }
}

// Run tests
runE2ETests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
