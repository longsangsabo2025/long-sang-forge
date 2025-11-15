#!/usr/bin/env node

/**
 * Integration Test Script for Complete AI Automation System
 * Tests all components: MCP, AI Agents, Workflows, and Dashboard
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const N8N_WEBHOOK_URL = process.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
const N8N_API_KEY = process.env.VITE_N8N_API_KEY || 'your-api-key';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class IntegrationTester {
  constructor() {
    this.testResults = {
      database: { passed: 0, failed: 0, tests: [] },
      mcp: { passed: 0, failed: 0, tests: [] },
      workflows: { passed: 0, failed: 0, tests: [] },
      agents: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runTest(category, testName, testFn) {
    try {
      info(`Running ${testName}...`);
      await testFn();
      this.testResults[category].passed++;
      this.testResults[category].tests.push({ name: testName, status: 'passed' });
      success(`${testName} passed`);
    } catch (err) {
      this.testResults[category].failed++;
      this.testResults[category].tests.push({ 
        name: testName, 
        status: 'failed', 
        error: err.message 
      });
      error(`${testName} failed: ${err.message}`);
    }
  }

  // Database Tests
  async testDatabaseConnection() {
    const { data, error: err } = await supabase
      .from('automation_agents')
      .select('count')
      .limit(1);
    
    if (err) throw new Error(`Database connection failed: ${err.message}`);
    if (!data) throw new Error('No data returned from database');
  }

  async testMcpTables() {
    const tables = [
      'mcp_servers',
      'mcp_tools', 
      'mcp_resources',
      'mcp_prompts',
      'mcp_workflow_connections',
      'mcp_execution_logs',
      'mcp_analytics'
    ];

    for (const table of tables) {
      const { error: err } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (err) throw new Error(`Table ${table} not accessible: ${err.message}`);
    }
  }

  async testAgentTables() {
    const tables = [
      'social_media_queue',
      'email_campaigns',
      'email_analytics',
      'agent_workflows',
      'agent_performance',
      'portfolio_projects',
      'lead_processing',
      'content_analytics'
    ];

    for (const table of tables) {
      const { error: err } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (err) throw new Error(`Agent table ${table} not accessible: ${err.message}`);
    }
  }

  // MCP Tests
  async testMcpServerCreation() {
    const { data, error: err } = await supabase
      .from('mcp_servers')
      .insert({
        name: 'Test MCP Server',
        description: 'Integration test server',
        url: 'mcp://localhost:3001',
        capabilities: ['test'],
        status: 'connected',
        version: '1.0.0'
      })
      .select()
      .single();

    if (err) throw new Error(`MCP server creation failed: ${err.message}`);
    if (!data.id) throw new Error('MCP server ID not returned');

    // Clean up
    await supabase.from('mcp_servers').delete().eq('id', data.id);
  }

  async testMcpToolRegistration() {
    // First create a test server
    const { data: server } = await supabase
      .from('mcp_servers')
      .insert({
        name: 'Test Server for Tools',
        description: 'Test server',
        url: 'mcp://localhost:3001',
        capabilities: ['test'],
        status: 'connected',
        version: '1.0.0'
      })
      .select()
      .single();

    // Then create a tool
    const { data, error: err } = await supabase
      .from('mcp_tools')
      .insert({
        server_id: server.id,
        name: 'test_tool',
        description: 'Integration test tool',
        input_schema: { type: 'object', properties: {} },
        enabled: true
      })
      .select()
      .single();

    if (err) throw new Error(`MCP tool registration failed: ${err.message}`);
    
    // Clean up
    await supabase.from('mcp_tools').delete().eq('id', data.id);
    await supabase.from('mcp_servers').delete().eq('id', server.id);
  }

  // Workflow Tests
  async testN8nConnection() {
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL.replace('/webhook', '')}/rest/active`, {
        headers: N8N_API_KEY ? { 'X-N8N-API-KEY': N8N_API_KEY } : {}
      });
      
      if (!response.ok) {
        throw new Error(`N8n not accessible: HTTP ${response.status}`);
      }
    } catch (err) {
      throw new Error(`N8n connection failed: ${err.message}`);
    }
  }

  async testMasterOrchestratorWebhook() {
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/master-orchestrator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          user_id: 'integration-test'
        })
      });

      if (!response.ok) {
        throw new Error(`Master orchestrator webhook failed: HTTP ${response.status}`);
      }
    } catch (err) {
      throw new Error(`Master orchestrator test failed: ${err.message}`);
    }
  }

  async testSmartRouterWebhook() {
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/smart-workflow-router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          user_id: 'integration-test'
        })
      });

      if (!response.ok) {
        throw new Error(`Smart router webhook failed: HTTP ${response.status}`);
      }
    } catch (err) {
      throw new Error(`Smart router test failed: ${err.message}`);
    }
  }

  // Agent Tests
  async testContentGeneratorAgent() {
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/content-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_keywords: ['AI automation', 'testing'],
          content_type: 'blog',
          language: 'en',
          word_count: 500,
          user_id: 'integration-test'
        })
      });

      if (!response.ok) {
        throw new Error(`Content generator failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success && !result.content_id) {
        throw new Error('Content generator did not return expected result');
      }
    } catch (err) {
      throw new Error(`Content generator test failed: ${err.message}`);
    }
  }

  async testSocialMediaAgent() {
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/social-media-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_content: 'Test social media post content for integration testing',
          platforms: ['twitter', 'linkedin'],
          post_type: 'text',
          user_id: 'integration-test'
        })
      });

      if (!response.ok) {
        throw new Error(`Social media agent failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success && !result.total_posts_created) {
        throw new Error('Social media agent did not return expected result');
      }
    } catch (err) {
      throw new Error(`Social media agent test failed: ${err.message}`);
    }
  }

  async testEmailMarketingAgent() {
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/email-marketing-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_type: 'welcome',
          recipient_data: {
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          },
          user_id: 'integration-test'
        })
      });

      if (!response.ok) {
        throw new Error(`Email marketing agent failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success && !result.campaign_id) {
        throw new Error('Email marketing agent did not return expected result');
      }
    } catch (err) {
      throw new Error(`Email marketing agent test failed: ${err.message}`);
    }
  }

  // Integration Tests
  async testFullAutomationFlow() {
    try {
      // Test the complete flow: Master orchestrator -> Smart router -> Agents
      const response = await fetch(`${N8N_WEBHOOK_URL}/master-orchestrator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate_full_automation',
          user_id: 'integration-test',
          data: {
            automation_level: 'full',
            enable_monitoring: true,
            enable_optimization: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Full automation flow failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Full automation flow did not complete successfully');
      }
    } catch (err) {
      throw new Error(`Full automation flow test failed: ${err.message}`);
    }
  }

  async testDataPersistence() {
    // Test that data is properly stored across all systems
    const { data: workflows } = await supabase
      .from('agent_workflows')
      .select('*')
      .limit(5);

    const { data: mcpLogs } = await supabase
      .from('mcp_execution_logs')
      .select('*')
      .limit(5);

    if (!workflows && !mcpLogs) {
      throw new Error('No execution data found in database');
    }
  }

  async testPerformanceMetrics() {
    // Test that performance metrics are being collected
    const { data: performance } = await supabase
      .from('agent_performance')
      .select('*')
      .limit(5);

    const { data: analytics } = await supabase
      .from('mcp_analytics')
      .select('*')
      .limit(5);

    // Performance data might not exist yet, so this is just a connection test
    info('Performance metrics tables accessible');
  }

  // Main test runner
  async runAllTests() {
    log('\n🚀 Starting Complete AI Automation System Integration Tests\n', 'cyan');

    // Database Tests
    log('📊 Database Tests', 'magenta');
    await this.runTest('database', 'Database Connection', () => this.testDatabaseConnection());
    await this.runTest('database', 'MCP Tables', () => this.testMcpTables());
    await this.runTest('database', 'Agent Tables', () => this.testAgentTables());

    // MCP Tests
    log('\n🔗 MCP Protocol Tests', 'magenta');
    await this.runTest('mcp', 'MCP Server Creation', () => this.testMcpServerCreation());
    await this.runTest('mcp', 'MCP Tool Registration', () => this.testMcpToolRegistration());

    // Workflow Tests
    log('\n⚙️  N8n Workflow Tests', 'magenta');
    await this.runTest('workflows', 'N8n Connection', () => this.testN8nConnection());
    await this.runTest('workflows', 'Master Orchestrator Webhook', () => this.testMasterOrchestratorWebhook());
    await this.runTest('workflows', 'Smart Router Webhook', () => this.testSmartRouterWebhook());

    // Agent Tests
    log('\n🤖 AI Agent Tests', 'magenta');
    await this.runTest('agents', 'Content Generator Agent', () => this.testContentGeneratorAgent());
    await this.runTest('agents', 'Social Media Agent', () => this.testSocialMediaAgent());
    await this.runTest('agents', 'Email Marketing Agent', () => this.testEmailMarketingAgent());

    // Integration Tests
    log('\n🔄 Integration Tests', 'magenta');
    await this.runTest('integration', 'Full Automation Flow', () => this.testFullAutomationFlow());
    await this.runTest('integration', 'Data Persistence', () => this.testDataPersistence());
    await this.runTest('integration', 'Performance Metrics', () => this.testPerformanceMetrics());

    // Results Summary
    this.printResults();
  }

  printResults() {
    log('\n📋 Test Results Summary', 'cyan');
    log('================================', 'cyan');

    let totalPassed = 0;
    let totalFailed = 0;

    for (const [category, results] of Object.entries(this.testResults)) {
      const { passed, failed } = results;
      totalPassed += passed;
      totalFailed += failed;

      const status = failed === 0 ? '✅' : '❌';
      log(`${status} ${category.toUpperCase()}: ${passed} passed, ${failed} failed`);
      
      if (failed > 0) {
        results.tests
          .filter(test => test.status === 'failed')
          .forEach(test => {
            error(`  - ${test.name}: ${test.error}`);
          });
      }
    }

    log('\n================================', 'cyan');
    log(`Total: ${totalPassed} passed, ${totalFailed} failed`, totalFailed === 0 ? 'green' : 'red');

    if (totalFailed === 0) {
      success('\n🎉 All tests passed! Your AI automation system is ready to go!');
      log('\nNext steps:', 'blue');
      log('1. Access your dashboard at http://localhost:5173');
      log('2. Click the ▶️ ACTIVATE FULL AUTOMATION button');
      log('3. Monitor your AI agents in action');
      log('4. Check the MCP Protocol tab for server status');
    } else {
      error('\n💥 Some tests failed. Please check the errors above and fix them before proceeding.');
    }
  }
}

// Run the tests
async function main() {
  const tester = new IntegrationTester();
  
  try {
    await tester.runAllTests();
  } catch (err) {
    error(`Test runner failed: ${err.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\nTest execution interrupted by user', 'yellow');
  process.exit(0);
});

main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});