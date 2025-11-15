#!/usr/bin/env node

/**
 * ================================================
 * SIMPLE N8N AI WORKFLOW CREATOR
 * Tạo AI workflows cơ bản và hoạt động
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

async function makeN8nRequest(endpoint, method = 'GET', body = null) {
    const url = `${N8N_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const text = await response.text();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        
        return text ? JSON.parse(text) : {};
    } catch (error) {
        log(`❌ API Request failed: ${error.message}`, 'red');
        throw error;
    }
}

// Simple AI Content Generator
function createSimpleAIWorkflow() {
    return {
        name: "Simple AI Agent",
        nodes: [
            {
                parameters: {
                    path: "ai-agent",
                    options: {}
                },
                id: "webhook-1",
                name: "AI Agent Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300]
            },
            {
                parameters: {
                    jsCode: `
// Simple AI agent logic
const request = $input.json;
const action = request.action || 'process';
const data = request.data || {};

// Process the request
const result = {
    status: 'success',
    action: action,
    data: data,
    message: 'AI agent processed successfully',
    timestamp: new Date().toISOString(),
    agent: 'Simple AI Agent'
};

return result;`
                },
                id: "code-1",
                name: "AI Logic",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300]
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: `{
    "status": "{{ $('AI Logic').item.json.status }}",
    "message": "{{ $('AI Logic').item.json.message }}",
    "action": "{{ $('AI Logic').item.json.action }}",
    "data": "{{ JSON.stringify($('AI Logic').item.json.data) }}",
    "timestamp": "{{ $('AI Logic').item.json.timestamp }}",
    "agent": "{{ $('AI Logic').item.json.agent }}"
}`
                },
                id: "respond-1",
                name: "Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [680, 300]
            }
        ],
        connections: {
            "AI Agent Webhook": {
                "main": [
                    [
                        {
                            "node": "AI Logic",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "AI Logic": {
                "main": [
                    [
                        {
                            "node": "Response",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        settings: {
            executionOrder: "v1"
        }
    };
}

// Content Generator
function createContentWorkflow() {
    return {
        name: "Content Generator",
        nodes: [
            {
                parameters: {
                    path: "content-gen",
                    options: {}
                },
                id: "webhook-2",
                name: "Content Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300]
            },
            {
                parameters: {
                    jsCode: `
// Content generation logic
const request = $input.json;
const topic = request.topic || 'Technology';
const type = request.type || 'article';

// Generate content
const content = {
    title: \`\${type.charAt(0).toUpperCase() + type.slice(1)} about \${topic}\`,
    content: \`This is a generated \${type} about \${topic}. It covers the latest trends and insights in the field.\`,
    type: type,
    topic: topic,
    timestamp: new Date().toISOString(),
    status: 'generated'
};

return content;`
                },
                id: "code-2",
                name: "Generate Content",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300]
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: `{
    "status": "success",
    "message": "Content generated successfully",
    "content": {
        "title": "{{ $('Generate Content').item.json.title }}",
        "content": "{{ $('Generate Content').item.json.content }}",
        "type": "{{ $('Generate Content').item.json.type }}",
        "topic": "{{ $('Generate Content').item.json.topic }}",
        "timestamp": "{{ $('Generate Content').item.json.timestamp }}"
    }
}`
                },
                id: "respond-2",
                name: "Content Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [680, 300]
            }
        ],
        connections: {
            "Content Webhook": {
                "main": [
                    [
                        {
                            "node": "Generate Content",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Generate Content": {
                "main": [
                    [
                        {
                            "node": "Content Response",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        settings: {
            executionOrder: "v1"
        }
    };
}

// Master Controller
function createMasterWorkflow() {
    return {
        name: "Master Controller",
        nodes: [
            {
                parameters: {
                    path: "master",
                    options: {}
                },
                id: "webhook-3",
                name: "Master Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300]
            },
            {
                parameters: {
                    jsCode: `
// Master controller logic
const request = $input.json;
const command = request.command || 'status';
const agents = request.agents || ['ai-agent', 'content-gen'];

// Process master command
const result = {
    status: 'success',
    command: command,
    message: 'Master controller executed',
    agents: agents,
    results: agents.map(agent => ({
        agent: agent,
        status: 'activated',
        webhook: \`\${N8N_BASE_URL}/webhook/\${agent}\`
    })),
    timestamp: new Date().toISOString()
};

return result;`
                },
                id: "code-3",
                name: "Master Logic",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300]
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: `{
    "status": "{{ $('Master Logic').item.json.status }}",
    "message": "{{ $('Master Logic').item.json.message }}",
    "command": "{{ $('Master Logic').item.json.command }}",
    "agents": "{{ JSON.stringify($('Master Logic').item.json.agents) }}",
    "results": "{{ JSON.stringify($('Master Logic').item.json.results) }}",
    "timestamp": "{{ $('Master Logic').item.json.timestamp }}"
}`
                },
                id: "respond-3",
                name: "Master Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [680, 300]
            }
        ],
        connections: {
            "Master Webhook": {
                "main": [
                    [
                        {
                            "node": "Master Logic",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Master Logic": {
                "main": [
                    [
                        {
                            "node": "Master Response",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        settings: {
            executionOrder: "v1"
        }
    };
}

async function createWorkflows() {
    log('\n🚀 CREATING SIMPLE AI WORKFLOWS', 'bold');
    log('='.repeat(50), 'cyan');
    
    const workflows = [
        { name: 'Simple AI Agent', factory: createSimpleAIWorkflow },
        { name: 'Content Generator', factory: createContentWorkflow },
        { name: 'Master Controller', factory: createMasterWorkflow }
    ];
    
    let createdCount = 0;
    let activatedCount = 0;
    
    for (const workflow of workflows) {
        try {
            log(`📥 Creating: ${workflow.name}`, 'yellow');
            
            const workflowData = workflow.factory();
            const result = await makeN8nRequest('/api/v1/workflows', 'POST', workflowData);
            
            log(`✅ Created: ${workflow.name} (ID: ${result.id})`, 'green');
            createdCount++;
            
            // Activate workflow
            try {
                await makeN8nRequest(`/api/v1/workflows/${result.id}/activate`, 'POST');
                log(`🚀 Activated: ${workflow.name}`, 'green');
                activatedCount++;
            } catch (activateError) {
                log(`⚠️ Failed to activate ${workflow.name}`, 'yellow');
            }
            
        } catch (error) {
            log(`❌ Failed to create ${workflow.name}: ${error.message}`, 'red');
        }
    }
    
    // Summary
    log('\n📊 CREATION SUMMARY', 'bold');
    log('='.repeat(50), 'cyan');
    log(`Created: ${createdCount}/${workflows.length}`, 'green');
    log(`Activated: ${activatedCount}/${createdCount}`, 'green');
    
    if (createdCount > 0) {
        log('\n🎉 AI WORKFLOWS CREATED!', 'green');
        log(`📊 Dashboard: ${N8N_BASE_URL}`, 'cyan');
        
        // Display webhook URLs
        log('\n🔗 WEBHOOK ENDPOINTS:', 'bold');
        log(`🤖 AI Agent: ${N8N_BASE_URL}/webhook/ai-agent`, 'cyan');
        log(`📝 Content Gen: ${N8N_BASE_URL}/webhook/content-gen`, 'cyan');
        log(`🎯 Master: ${N8N_BASE_URL}/webhook/master`, 'cyan');
    }
    
    return { createdCount, activatedCount, total: workflows.length };
}

async function testWorkflows() {
    log('\n🧪 TESTING WORKFLOWS', 'bold');
    log('='.repeat(50), 'cyan');
    
    const tests = [
        {
            name: 'AI Agent Test',
            url: `${N8N_BASE_URL}/webhook/ai-agent`,
            data: { action: 'test', data: { message: 'Hello AI!' } }
        },
        {
            name: 'Content Generator Test',
            url: `${N8N_BASE_URL}/webhook/content-gen`,
            data: { topic: 'AI Automation', type: 'blog' }
        },
        {
            name: 'Master Controller Test',
            url: `${N8N_BASE_URL}/webhook/master`,
            data: { command: 'activate-all', agents: ['ai-agent', 'content-gen'] }
        }
    ];
    
    for (const test of tests) {
        try {
            log(`🧪 Testing: ${test.name}`, 'yellow');
            
            const response = await fetch(test.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.data)
            });
            
            if (response.ok) {
                const result = await response.json();
                log(`✅ ${test.name}: SUCCESS`, 'green');
                log(`   Status: ${result.status}`, 'blue');
            } else {
                log(`❌ ${test.name}: FAILED (${response.status})`, 'red');
            }
        } catch (error) {
            log(`❌ ${test.name}: ERROR`, 'red');
        }
    }
}

async function main() {
    try {
        const result = await createWorkflows();
        
        if (result.createdCount > 0) {
            log('\n⏳ Waiting for workflows to initialize...', 'yellow');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            await testWorkflows();
        }
        
        log('\n🎯 SYSTEM READY!', 'bold');
        log('Bạn có thể test các AI agents ngay bây giờ!', 'green');
        
    } catch (error) {
        log(`❌ Process failed: ${error.message}`, 'red');
    }
}

main();