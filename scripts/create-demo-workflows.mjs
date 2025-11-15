#!/usr/bin/env node

/**
 * 🚀 N8N DEMO WORKFLOWS CREATOR
 * Tạo 3 workflows demo cho hệ thống automation
 */

const N8N_BASE_URL = 'http://localhost:5678';

// 🔐 Login và lấy auth cookie
async function loginToN8n() {
  try {
    const loginResponse = await fetch(`${N8N_BASE_URL}/rest/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'longsangsabo2025@gmail.com',
        password: 'Acookingoil123@'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed, trying without auth...');
      return null;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful!');
    return cookies;
    
  } catch (error) {
    console.log('⚠️ Auth not required, continuing...');
    return null;
  }
}

// 📋 Workflow templates
const workflows = [
  {
    name: "🤖 AI Content Writer",
    active: false,
    nodes: [
      {
        "parameters": {},
        "id": "start-node",
        "name": "Start",
        "type": "n8n-nodes-base.start",
        "typeVersion": 1,
        "position": [240, 300]
      },
      {
        "parameters": {
          "content": "=AI Content Generated at {{ $now.format('YYYY-MM-DD HH:mm') }}\n\nTopic: {{ $json.topic || 'Default topic' }}\nContent: {{ $json.content || 'Sample AI generated content for automation system' }}",
          "options": {}
        },
        "id": "content-node",
        "name": "Generate Content",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [460, 300]
      }
    ],
    connections: {
      "Start": {
        "main": [
          [
            {
              "node": "Generate Content",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  },
  {
    name: "📧 Email Automation",
    active: false,
    nodes: [
      {
        "parameters": {},
        "id": "start-node", 
        "name": "Start",
        "type": "n8n-nodes-base.start",
        "typeVersion": 1,
        "position": [240, 300]
      },
      {
        "parameters": {
          "content": "=Email sent at {{ $now.format('YYYY-MM-DD HH:mm') }}\n\nTo: {{ $json.email || 'user@example.com' }}\nSubject: {{ $json.subject || 'Automation Update' }}\nContent: {{ $json.message || 'Your automation system is working perfectly!' }}",
          "options": {}
        },
        "id": "email-node",
        "name": "Send Email",
        "type": "n8n-nodes-base.code", 
        "typeVersion": 2,
        "position": [460, 300]
      }
    ],
    connections: {
      "Start": {
        "main": [
          [
            {
              "node": "Send Email",
              "type": "main", 
              "index": 0
            }
          ]
        ]
      }
    }
  },
  {
    name: "📱 Social Media Poster",
    active: false,
    nodes: [
      {
        "parameters": {},
        "id": "start-node",
        "name": "Start", 
        "type": "n8n-nodes-base.start",
        "typeVersion": 1,
        "position": [240, 300]
      },
      {
        "parameters": {
          "content": "=Social post created at {{ $now.format('YYYY-MM-DD HH:mm') }}\n\nPlatform: {{ $json.platform || 'All platforms' }}\nContent: {{ $json.post || 'Check out our amazing automation system! 🚀 #automation #n8n' }}\nHashtags: {{ $json.hashtags || '#automation #productivity #n8n' }}",
          "options": {}
        },
        "id": "social-node",
        "name": "Create Post",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2, 
        "position": [460, 300]
      }
    ],
    connections: {
      "Start": {
        "main": [
          [
            {
              "node": "Create Post",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }
];

// 🔨 Tạo workflow
async function createWorkflow(workflow, authCookie) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authCookie) {
      headers['Cookie'] = authCookie;
    }

    const response = await fetch(`${N8N_BASE_URL}/rest/workflows`, {
      method: 'POST',
      headers,
      body: JSON.stringify(workflow)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created: ${workflow.name} (ID: ${result.id})`);
      return result;
    } else {
      const error = await response.text();
      console.log(`❌ Failed to create ${workflow.name}: ${response.status} ${error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating ${workflow.name}:`, error.message);
    return null;
  }
}

// 🎯 Test workflow execution
async function testWorkflow(workflowId, authCookie) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authCookie) {
      headers['Cookie'] = authCookie;
    }

    const response = await fetch(`${N8N_BASE_URL}/rest/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          topic: "Test automation",
          content: "This is a test execution from our demo script!"
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`🧪 Test executed for workflow ${workflowId}`);
      return result;
    } else {
      console.log(`⚠️ Test failed for workflow ${workflowId}: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Test error for workflow ${workflowId}:`, error.message);
    return null;
  }
}

// 🚀 Main execution
async function main() {
  console.log('🚀 Creating N8N Demo Workflows...\n');
  
  // Login
  const authCookie = await loginToN8n();
  
  // Create workflows
  const createdWorkflows = [];
  for (const workflow of workflows) {
    const result = await createWorkflow(workflow, authCookie);
    if (result) {
      createdWorkflows.push(result);
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between requests
  }
  
  console.log(`\n🎉 Created ${createdWorkflows.length}/${workflows.length} workflows successfully!`);
  
  // Test first workflow
  if (createdWorkflows.length > 0) {
    console.log('\n🧪 Testing first workflow...');
    await testWorkflow(createdWorkflows[0].id, authCookie);
  }
  
  console.log('\n✅ Demo workflows setup complete!');
  console.log('👀 Check your n8n dashboard at http://localhost:5678');
}

main().catch(console.error);