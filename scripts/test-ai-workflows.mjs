#!/usr/bin/env node

/**
 * ================================================
 * AI WORKFLOWS TESTER
 * Test các AI workflows đã tạo
 * ================================================
 */

import fetch from 'node-fetch';

// N8n Configuration
const N8N_BASE_URL = 'http://localhost:5678';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YmZjOTUxMC02ZjI3LTRiYzEtYThhYS0xOTc0ZTk5MmI1OWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxOTg4Nzg4LCJleHAiOjE3NjQ1NDcyMDB9.JqulrcvFmPUfgtoXDJb5P-HOnhZfLsHLl34C0q4F-6s';

// ANSI Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

async function makeN8nRequest(endpoint) {
    const url = `${N8N_BASE_URL}${endpoint}`;
    const options = {
        headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        log(`❌ API Request failed: ${error.message}`, 'red');
        return null;
    }
}

async function getWorkflows() {
    log('🔍 Getting workflows from n8n...', 'yellow');
    
    const workflows = await makeN8nRequest('/api/v1/workflows');
    
    if (workflows && workflows.data) {
        log(`Found ${workflows.data.length} workflows:`, 'blue');
        
        for (const workflow of workflows.data) {
            const status = workflow.active ? '🟢' : '🔴';
            log(`${status} ${workflow.name} (ID: ${workflow.id})`, 'cyan');
        }
        
        return workflows.data;
    }
    
    return [];
}

async function testWebhook(url, data, name) {
    try {
        log(`🧪 Testing ${name}...`, 'yellow');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            log(`✅ ${name}: SUCCESS`, 'green');
            log(`   Response: ${result.status || 'OK'}`, 'blue');
            log(`   Message: ${result.message || 'No message'}`, 'blue');
            return true;
        } else {
            log(`❌ ${name}: HTTP ${response.status}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ ${name}: ${error.message}`, 'red');
        return false;
    }
}

async function getAllWorkflows() {
    const workflows = await makeN8nRequest('/api/v1/workflows');
    return workflows?.data || [];
}

async function findWebhookUrls() {
    log('\n🔍 Finding webhook URLs...', 'yellow');
    
    const workflows = await getAllWorkflows();
    const webhookUrls = [];
    
    for (const workflow of workflows) {
        try {
            // Get workflow details
            const workflowDetail = await makeN8nRequest(`/api/v1/workflows/${workflow.id}`);
            
            if (workflowDetail && workflowDetail.nodes) {
                // Find webhook nodes
                const webhookNodes = workflowDetail.nodes.filter(node => 
                    node.type === 'n8n-nodes-base.webhook'
                );
                
                for (const webhookNode of webhookNodes) {
                    const path = webhookNode.parameters?.path;
                    if (path) {
                        const url = `${N8N_BASE_URL}/webhook/${path}`;
                        webhookUrls.push({
                            workflow: workflow.name,
                            path: path,
                            url: url,
                            active: workflow.active
                        });
                        
                        const status = workflow.active ? '🟢' : '🔴';
                        log(`${status} ${workflow.name}: /webhook/${path}`, 'cyan');
                    }
                }
            }
        } catch (error) {
            log(`❌ Error getting details for ${workflow.name}`, 'red');
        }
    }
    
    return webhookUrls;
}

async function runTests() {
    log('\n🚀 AI WORKFLOWS TESTING', 'bold');
    log('='.repeat(50), 'cyan');
    
    // Get workflows
    await getWorkflows();
    
    // Find webhook URLs
    const webhookUrls = await findWebhookUrls();
    
    if (webhookUrls.length === 0) {
        log('\n❌ No webhook URLs found!', 'red');
        return;
    }
    
    log('\n🧪 TESTING WEBHOOKS', 'bold');
    log('='.repeat(50), 'cyan');
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Test each webhook
    for (const webhook of webhookUrls) {
        if (!webhook.active) {
            log(`⚠️ Skipping inactive workflow: ${webhook.workflow}`, 'yellow');
            continue;
        }
        
        totalTests++;
        
        // Prepare test data based on webhook path
        let testData = {};
        
        if (webhook.path.includes('ai-agent')) {
            testData = {
                action: 'test',
                data: { message: 'Hello AI Agent!' }
            };
        } else if (webhook.path.includes('content')) {
            testData = {
                topic: 'AI and Automation',
                type: 'blog post'
            };
        } else if (webhook.path.includes('master')) {
            testData = {
                command: 'status',
                agents: ['ai-agent', 'content-gen']
            };
        } else {
            testData = {
                test: true,
                message: 'Test request'
            };
        }
        
        const success = await testWebhook(webhook.url, testData, webhook.workflow);
        if (success) passedTests++;
    }
    
    // Summary
    log('\n📊 TEST SUMMARY', 'bold');
    log('='.repeat(50), 'cyan');
    log(`Total Tests: ${totalTests}`, 'blue');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${totalTests - passedTests}`, totalTests > passedTests ? 'red' : 'green');
    
    if (passedTests === totalTests && totalTests > 0) {
        log('\n🎉 ALL TESTS PASSED!', 'green');
        log('✅ Your AI automation system is working!', 'green');
    } else if (passedTests > 0) {
        log('\n⚠️ Some tests failed', 'yellow');
        log('Check the workflow configurations', 'yellow');
    } else {
        log('\n❌ All tests failed', 'red');
        log('Check if workflows are active and properly configured', 'red');
    }
    
    // Usage instructions
    log('\n📋 USAGE INSTRUCTIONS:', 'bold');
    log('='.repeat(50), 'cyan');
    
    for (const webhook of webhookUrls.filter(w => w.active)) {
        log(`📝 ${webhook.workflow}:`, 'yellow');
        log(`   curl -X POST ${webhook.url} \\`, 'cyan');
        log(`   -H "Content-Type: application/json" \\`, 'cyan');
        log(`   -d '{"test": true}'`, 'cyan');
        log('');
    }
}

runTests().catch(console.error);