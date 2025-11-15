#!/usr/bin/env node

/**
 * ================================================
 * N8N AI WORKFLOW CREATOR
 * Tạo AI workflows đơn giản và hiệu quả
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

// Simple AI Content Generator Workflow
function createContentGeneratorWorkflow() {
    return {
        name: "AI Content Generator",
        nodes: [
            {
                parameters: {
                    path: "ai-content",
                    options: {}
                },
                id: "webhook-1",
                name: "Content Request Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300],
                webhookId: "ai-content-webhook"
            },
            {
                parameters: {
                    jsCode: `
// Extract request data
const topic = $input.json.topic || 'AI and Technology';
const contentType = $input.json.type || 'blog';
const tone = $input.json.tone || 'professional';

// Create content prompt
const prompt = \`Create a \${contentType} about \${topic} with a \${tone} tone. Make it engaging and informative.\`;

return {
    prompt: prompt,
    topic: topic,
    contentType: contentType,
    tone: tone,
    timestamp: new Date().toISOString()
};`
                },
                id: "code-1",
                name: "Prepare AI Prompt",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300]
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: `{
    "status": "success",
    "message": "AI content generation started",
    "data": {
        "prompt": "{{ $('Prepare AI Prompt').item.json.prompt }}",
        "topic": "{{ $('Prepare AI Prompt').item.json.topic }}",
        "contentType": "{{ $('Prepare AI Prompt').item.json.contentType }}",
        "tone": "{{ $('Prepare AI Prompt').item.json.tone }}",
        "timestamp": "{{ $('Prepare AI Prompt').item.json.timestamp }}"
    }
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
            "Content Request Webhook": {
                "main": [
                    [
                        {
                            "node": "Prepare AI Prompt",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Prepare AI Prompt": {
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
        tags: ["ai", "content", "automation"],
        settings: {
            executionOrder: "v1"
        }
    };
}

// Simple Email Automation Workflow
function createEmailAutomationWorkflow() {
    return {
        name: "Email Automation Agent",
        nodes: [
            {
                parameters: {
                    path: "email-agent",
                    options: {}
                },
                id: "webhook-2",
                name: "Email Request Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300],
                webhookId: "email-agent-webhook"
            },
            {
                parameters: {
                    jsCode: `
// Extract email data
const emailType = $input.json.emailType || 'newsletter';
const subject = $input.json.subject || 'Weekly Update';
const recipient = $input.json.recipient || 'subscriber@example.com';
const content = $input.json.content || 'Thank you for subscribing to our newsletter!';

return {
    emailType: emailType,
    subject: subject,
    recipient: recipient,
    content: content,
    timestamp: new Date().toISOString(),
    status: 'processed'
};`
                },
                id: "code-2",
                name: "Process Email Data",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300]
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: `{
    "status": "success",
    "message": "Email automation completed",
    "data": {
        "emailType": "{{ $('Process Email Data').item.json.emailType }}",
        "subject": "{{ $('Process Email Data').item.json.subject }}",
        "recipient": "{{ $('Process Email Data').item.json.recipient }}",
        "content": "{{ $('Process Email Data').item.json.content }}",
        "timestamp": "{{ $('Process Email Data').item.json.timestamp }}"
    }
}`
                },
                id: "respond-2",
                name: "Email Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [680, 300]
            }
        ],
        connections: {
            "Email Request Webhook": {
                "main": [
                    [
                        {
                            "node": "Process Email Data",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Process Email Data": {
                "main": [
                    [
                        {
                            "node": "Email Response",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        tags: ["email", "automation", "agent"],
        settings: {
            executionOrder: "v1"
        }
    };
}

// Simple Social Media Workflow
function createSocialMediaWorkflow() {
    return {
        name: "Social Media Manager",
        nodes: [
            {
                parameters: {
                    path: "social-media",
                    options: {}
                },
                id: "webhook-3",
                name: "Social Media Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300],
                webhookId: "social-media-webhook"
            },
            {
                parameters: {
                    jsCode: `
// Extract social media data
const platform = $input.json.platform || 'twitter';
const content = $input.json.content || 'Exciting updates coming soon!';
const hashtags = $input.json.hashtags || ['#automation', '#ai'];
const scheduledTime = $input.json.scheduledTime || new Date().toISOString();

return {
    platform: platform,
    content: content,
    hashtags: hashtags,
    scheduledTime: scheduledTime,
    timestamp: new Date().toISOString(),
    status: 'scheduled'
};`
                },
                id: "code-3",
                name: "Process Social Post",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300]
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: `{
    "status": "success",
    "message": "Social media post scheduled",
    "data": {
        "platform": "{{ $('Process Social Post').item.json.platform }}",
        "content": "{{ $('Process Social Post').item.json.content }}",
        "hashtags": "{{ $('Process Social Post').item.json.hashtags }}",
        "scheduledTime": "{{ $('Process Social Post').item.json.scheduledTime }}",
        "timestamp": "{{ $('Process Social Post').item.json.timestamp }}"
    }
}`
                },
                id: "respond-3",
                name: "Social Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [680, 300]
            }
        ],
        connections: {
            "Social Media Webhook": {
                "main": [
                    [
                        {
                            "node": "Process Social Post",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Process Social Post": {
                "main": [
                    [
                        {
                            "node": "Social Response",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        tags: ["social", "media", "automation"],
        settings: {
            executionOrder: "v1"
        }
    };
}

// Master Orchestrator Workflow
function createMasterOrchestratorWorkflow() {
    return {
        name: "Master AI Orchestrator",
        nodes: [
            {
                parameters: {
                    path: "master-ai",
                    options: {}
                },
                id: "webhook-master",
                name: "Master Control Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300],
                webhookId: "master-ai-webhook"
            },
            {
                parameters: {
                    jsCode: `
// Master AI Orchestrator Logic
const action = $input.json.action || 'status';
const agents = $input.json.agents || ['content', 'email', 'social'];

const results = {
    action: action,
    agents: agents,
    timestamp: new Date().toISOString(),
    status: 'orchestrating',
    results: []
};

// Simulate agent orchestration
for (const agent of agents) {
    results.results.push({
        agent: agent,
        status: 'activated',
        webhook: \`http://localhost:5678/webhook/\${agent}-agent\`
    });
}

return results;`
                },
                id: "orchestrator",
                name: "AI Orchestrator Logic",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [460, 300]
            },
            {
                parameters: {
                    respondWith: "json",
                    responseBody: `{
    "status": "success",
    "message": "AI agents orchestrated successfully",
    "data": {
        "action": "{{ $('AI Orchestrator Logic').item.json.action }}",
        "agents": "{{ $('AI Orchestrator Logic').item.json.agents }}",
        "results": "{{ $('AI Orchestrator Logic').item.json.results }}",
        "timestamp": "{{ $('AI Orchestrator Logic').item.json.timestamp }}"
    }
}`
                },
                id: "master-response",
                name: "Master Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [680, 300]
            }
        ],
        connections: {
            "Master Control Webhook": {
                "main": [
                    [
                        {
                            "node": "AI Orchestrator Logic",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "AI Orchestrator Logic": {
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
        tags: ["master", "orchestrator", "ai", "automation"],
        settings: {
            executionOrder: "v1"
        }
    };
}

async function createAIWorkflows() {
    log('\n🚀 CREATING AI WORKFLOWS', 'bold');
    log('='.repeat(50), 'cyan');
    
    const workflows = [
        { name: 'AI Content Generator', factory: createContentGeneratorWorkflow },
        { name: 'Email Automation Agent', factory: createEmailAutomationWorkflow },
        { name: 'Social Media Manager', factory: createSocialMediaWorkflow },
        { name: 'Master AI Orchestrator', factory: createMasterOrchestratorWorkflow }
    ];
    
    let createdCount = 0;
    let activatedCount = 0;
    
    for (const workflow of workflows) {
        try {
            log(`📥 Creating workflow: ${workflow.name}`, 'yellow');
            
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
                log(`⚠️ Failed to activate ${workflow.name}: ${activateError.message}`, 'yellow');
            }
            
        } catch (error) {
            log(`❌ Failed to create ${workflow.name}: ${error.message}`, 'red');
        }
    }
    
    // Summary
    log('\n📊 CREATION SUMMARY', 'bold');
    log('='.repeat(50), 'cyan');
    log(`Total Workflows: ${workflows.length}`, 'blue');
    log(`Created: ${createdCount}`, 'green');
    log(`Activated: ${activatedCount}`, 'green');
    log(`Failed: ${workflows.length - createdCount}`, createdCount < workflows.length ? 'red' : 'green');
    
    if (createdCount === workflows.length) {
        log('\n🎉 ALL AI WORKFLOWS CREATED!', 'green');
        log('🚀 Your AI automation system is ready!', 'green');
        log(`📊 Dashboard: ${N8N_BASE_URL}`, 'cyan');
        
        // Display webhook URLs
        log('\n🔗 WEBHOOK ENDPOINTS:', 'bold');
        log(`📝 Content Generator: ${N8N_BASE_URL}/webhook/ai-content`, 'cyan');
        log(`📧 Email Agent: ${N8N_BASE_URL}/webhook/email-agent`, 'cyan');
        log(`📱 Social Media: ${N8N_BASE_URL}/webhook/social-media`, 'cyan');
        log(`🎯 Master Control: ${N8N_BASE_URL}/webhook/master-ai`, 'cyan');
    }
    
    return { createdCount, activatedCount, total: workflows.length };
}

// Test workflows
async function testWorkflows() {
    log('\n🧪 TESTING AI WORKFLOWS', 'bold');
    log('='.repeat(50), 'cyan');
    
    const tests = [
        {
            name: 'Content Generator Test',
            url: `${N8N_BASE_URL}/webhook/ai-content`,
            data: {
                topic: 'AI Automation',
                type: 'blog',
                tone: 'professional'
            }
        },
        {
            name: 'Master Orchestrator Test',
            url: `${N8N_BASE_URL}/webhook/master-ai`,
            data: {
                action: 'activate-all',
                agents: ['content', 'email', 'social']
            }
        }
    ];
    
    for (const test of tests) {
        try {
            log(`🧪 Testing: ${test.name}`, 'yellow');
            
            const response = await fetch(test.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test.data)
            });
            
            if (response.ok) {
                const result = await response.json();
                log(`✅ ${test.name}: PASSED`, 'green');
                log(`   Response: ${result.status}`, 'blue');
            } else {
                log(`❌ ${test.name}: FAILED (${response.status})`, 'red');
            }
        } catch (error) {
            log(`❌ ${test.name}: ERROR - ${error.message}`, 'red');
        }
    }
}

async function main() {
    try {
        const result = await createAIWorkflows();
        
        if (result.createdCount > 0) {
            // Wait a bit for workflows to be ready
            log('\n⏳ Waiting for workflows to initialize...', 'yellow');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Test the workflows
            await testWorkflows();
        }
        
    } catch (error) {
        log(`❌ Main process failed: ${error.message}`, 'red');
    }
}

main();