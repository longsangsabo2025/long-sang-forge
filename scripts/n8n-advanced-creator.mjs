#!/usr/bin/env node

/**
 * 🚀 N8N ADVANCED WORKFLOW CREATOR
 * Based on official n8n documentation và community best practices
 * Supports local authentication và advanced workflow creation
 */

const N8N_BASE_URL = 'http://localhost:5678';

// 🔐 Authentication với owner credentials
async function authenticateN8n() {
  try {
    // Login với owner account đã setup
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

    if (loginResponse.ok) {
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('✅ Authentication successful!');
      return cookies;
    } else {
      console.log('⚠️ Direct API access, checking public endpoints...');
      return null;
    }
  } catch (error) {
    console.log('📋 Using public API mode...');
    return null;
  }
}

// 📊 Get system status
async function getSystemInfo(authCookie) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authCookie) headers['Cookie'] = authCookie;

    const response = await fetch(`${N8N_BASE_URL}/rest/settings`, {
      method: 'GET',
      headers
    });

    if (response.ok) {
      const settings = await response.json();
      console.log('🔧 N8n System Info:');
      console.log(`   Version: ${settings.versionCli || 'Unknown'}`);
      console.log(`   Timezone: ${settings.timezone || 'UTC'}`);
      console.log(`   Editor URL: ${N8N_BASE_URL}`);
      return settings;
    }
  } catch (error) {
    console.log('⚠️ Could not fetch system info');
  }
}

// 📋 List existing workflows
async function listWorkflows(authCookie) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authCookie) headers['Cookie'] = authCookie;

    const response = await fetch(`${N8N_BASE_URL}/rest/workflows`, {
      method: 'GET',
      headers
    });

    if (response.ok) {
      const workflows = await response.json();
      console.log(`📋 Found ${workflows.length} existing workflows`);
      workflows.forEach(wf => {
        console.log(`   • ${wf.name} (ID: ${wf.id}) - ${wf.active ? 'Active' : 'Inactive'}`);
      });
      return workflows;
    }
  } catch (error) {
    console.log('⚠️ Could not list workflows');
  }
  return [];
}

// 🛠️ Advanced workflow templates từ n8n community
const advancedWorkflows = [
  {
    name: "🤖 AI Content Pipeline",
    active: false,
    settings: {
      executionOrder: "v1"
    },
    nodes: [
      {
        "parameters": {},
        "id": "start-trigger",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.2,
        "position": [240, 300],
        "webhookId": "",
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "hours",
                "hoursInterval": 6
              }
            ]
          }
        }
      },
      {
        "parameters": {
          "content": "=// 🤖 AI Content Generation Pipeline\nconst topics = [\n  'Automation trends in 2024',\n  'N8n workflow best practices', \n  'AI integration strategies',\n  'Business process optimization'\n];\n\nconst randomTopic = topics[Math.floor(Math.random() * topics.length)];\n\nreturn [\n  {\n    json: {\n      topic: randomTopic,\n      timestamp: new Date().toISOString(),\n      contentType: 'blog-post',\n      status: 'generated'\n    }\n  }\n];",
          "options": {}
        },
        "id": "content-generator",
        "name": "AI Content Generator",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [460, 300]
      },
      {
        "parameters": {
          "content": "=// 📧 Content Distribution Logic\nconst content = $json;\nconst distributionChannels = ['email', 'social', 'website'];\n\nreturn distributionChannels.map(channel => ({\n  json: {\n    ...content,\n    channel,\n    scheduled: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now\n    content: `Generated content for ${content.topic} via ${channel}`\n  }\n}));",
          "options": {}
        },
        "id": "content-distributor", 
        "name": "Content Distributor",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [680, 300]
      }
    ],
    connections: {
      "Schedule Trigger": {
        "main": [[{ "node": "AI Content Generator", "type": "main", "index": 0 }]]
      },
      "AI Content Generator": {
        "main": [[{ "node": "Content Distributor", "type": "main", "index": 0 }]]
      }
    }
  },
  {
    name: "📧 Smart Email Automation",
    active: false,
    settings: {
      executionOrder: "v1"
    },
    nodes: [
      {
        "parameters": {
          "pollTimes": {
            "item": [
              {
                "mode": "everyMinute"
              }
            ]
          }
        },
        "id": "email-trigger",
        "name": "Email Trigger (IMAP)",
        "type": "n8n-nodes-base.emailimap",
        "typeVersion": 2,
        "position": [240, 300]
      },
      {
        "parameters": {
          "content": "=// 📧 Smart Email Processing\nconst email = $json;\nconst subject = email.subject || 'No Subject';\nconst from = email.from || 'Unknown Sender';\nconst body = email.body || '';\n\n// Smart categorization\nlet category = 'general';\nlet priority = 'normal';\nlet autoResponse = false;\n\nif (subject.toLowerCase().includes('urgent') || subject.includes('!!!')) {\n  priority = 'high';\n}\n\nif (subject.toLowerCase().includes('support') || subject.toLowerCase().includes('help')) {\n  category = 'support';\n  autoResponse = true;\n}\n\nif (subject.toLowerCase().includes('sales') || subject.toLowerCase().includes('quote')) {\n  category = 'sales';\n  autoResponse = true;\n}\n\nreturn [{\n  json: {\n    originalEmail: email,\n    processedAt: new Date().toISOString(),\n    category,\n    priority,\n    autoResponse,\n    from,\n    subject,\n    summary: body.substring(0, 200) + '...',\n    action: autoResponse ? 'send_auto_reply' : 'forward_to_team'\n  }\n}];",
          "options": {}
        },
        "id": "email-processor",
        "name": "Smart Email Processor", 
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [460, 300]
      },
      {
        "parameters": {
          "content": "=// 🔄 Auto Response Generator\nconst processed = $json;\n\nif (!processed.autoResponse) {\n  return [];\n}\n\nlet responseTemplate = '';\n\nswitch (processed.category) {\n  case 'support':\n    responseTemplate = `Hi there!\\n\\nThank you for contacting our support team. We've received your message regarding: ${processed.subject}\\n\\nOur team will review your request and respond within 24 hours.\\n\\nBest regards,\\nAutomation Support Team`;\n    break;\n  case 'sales':\n    responseTemplate = `Hello!\\n\\nThank you for your interest in our services. We've received your inquiry about: ${processed.subject}\\n\\nOur sales team will contact you within 2 business hours to discuss your requirements.\\n\\nBest regards,\\nSales Team`;\n    break;\n  default:\n    responseTemplate = `Thank you for your email. We've received your message and will respond soon.\\n\\nBest regards,\\nTeam`;\n}\n\nreturn [{\n  json: {\n    to: processed.from,\n    subject: `Re: ${processed.subject}`,\n    body: responseTemplate,\n    sentAt: new Date().toISOString(),\n    originalCategory: processed.category\n  }\n}];",
          "options": {}
        },
        "id": "auto-responder",
        "name": "Auto Responder",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [680, 300]
      }
    ],
    connections: {
      "Email Trigger (IMAP)": {
        "main": [[{ "node": "Smart Email Processor", "type": "main", "index": 0 }]]
      },
      "Smart Email Processor": {
        "main": [[{ "node": "Auto Responder", "type": "main", "index": 0 }]]
      }
    }
  },
  {
    name: "📱 Multi-Platform Social Media Manager",
    active: false,
    settings: {
      executionOrder: "v1"
    },
    nodes: [
      {
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "cronExpression",
                "cronExpression": "0 9,13,17 * * *"
              }
            ]
          }
        },
        "id": "social-trigger",
        "name": "Social Schedule",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.2,
        "position": [240, 300]
      },
      {
        "parameters": {
          "content": "=// 📱 Social Media Content Strategy\nconst now = new Date();\nconst hour = now.getHours();\n\n// Content themes based on time\nlet theme, hashtags, platforms;\n\nif (hour === 9) {\n  theme = 'Morning Motivation';\n  hashtags = '#MondayMotivation #Productivity #Automation #WorkflowOptimization';\n  platforms = ['linkedin', 'twitter'];\n} else if (hour === 13) {\n  theme = 'Lunch Learning';\n  hashtags = '#TechTips #N8nWorkflows #AutomationTips #LunchAndLearn';\n  platforms = ['twitter', 'facebook'];\n} else if (hour === 17) {\n  theme = 'End of Day Insights';\n  hashtags = '#DailyInsights #AutomationSuccess #TechThoughts #WorkDone';\n  platforms = ['linkedin', 'instagram'];\n}\n\nconst contentIdeas = [\n  `🚀 Transform your workflow with automation! Here's how we saved 20 hours this week using smart processes.`,\n  `💡 Pro tip: Automate your repetitive tasks and focus on what matters most. What's your biggest time-waster?`,\n  `🔧 Building efficient workflows isn't just about tools - it's about thinking differently about processes.`,\n  `📈 Data-driven decisions made easy: How automation helps us track KPIs in real-time.`,\n  `🎯 Success story: From manual chaos to automated clarity in 3 steps.`\n];\n\nconst randomContent = contentIdeas[Math.floor(Math.random() * contentIdeas.length)];\n\nreturn platforms.map(platform => ({\n  json: {\n    platform,\n    content: randomContent,\n    hashtags,\n    theme,\n    scheduledTime: now.toISOString(),\n    engagement_target: platform === 'linkedin' ? 'professional' : 'general',\n    post_type: 'text',\n    status: 'ready_to_post'\n  }\n}));",
          "options": {}
        },
        "id": "content-strategy",
        "name": "Content Strategy Engine",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [460, 300]
      },
      {
        "parameters": {
          "content": "=// 📊 Post Performance Tracker\nconst post = $json;\n\n// Simulate posting and track performance\nconst baseEngagement = {\n  linkedin: { likes: 15, comments: 3, shares: 2 },\n  twitter: { likes: 25, retweets: 8, comments: 5 },\n  facebook: { likes: 30, comments: 7, shares: 4 },\n  instagram: { likes: 50, comments: 12, saves: 8 }\n};\n\nconst platformBase = baseEngagement[post.platform] || baseEngagement.twitter;\n\n// Add some randomness for realistic metrics\nconst randomMultiplier = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3\n\nconst projectedMetrics = {\n  likes: Math.floor(platformBase.likes * randomMultiplier),\n  comments: Math.floor((platformBase.comments || 0) * randomMultiplier),\n  shares: Math.floor((platformBase.shares || platformBase.retweets || 0) * randomMultiplier),\n  reach: Math.floor(500 * randomMultiplier),\n  impressions: Math.floor(1200 * randomMultiplier)\n};\n\nreturn [{\n  json: {\n    ...post,\n    postedAt: new Date().toISOString(),\n    metrics: projectedMetrics,\n    performance_score: Object.values(projectedMetrics).reduce((a, b) => a + b, 0),\n    next_optimal_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later\n    status: 'posted_and_tracked'\n  }\n}];",
          "options": {}
        },
        "id": "performance-tracker",
        "name": "Performance Tracker",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [680, 300]
      }
    ],
    connections: {
      "Social Schedule": {
        "main": [[{ "node": "Content Strategy Engine", "type": "main", "index": 0 }]]
      },
      "Content Strategy Engine": {
        "main": [[{ "node": "Performance Tracker", "type": "main", "index": 0 }]]
      }
    }
  }
];

// 🔨 Create advanced workflow with proper error handling
async function createAdvancedWorkflow(workflow, authCookie) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authCookie) headers['Cookie'] = authCookie;

    console.log(`🛠️ Creating: ${workflow.name}...`);

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
      const errorText = await response.text();
      console.log(`❌ Failed to create ${workflow.name}: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 200)}...`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating ${workflow.name}:`, error.message);
    return null;
  }
}

// 🧪 Test workflow execution
async function testWorkflowExecution(workflowId, authCookie) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authCookie) headers['Cookie'] = authCookie;

    console.log(`🧪 Testing workflow ${workflowId}...`);

    const response = await fetch(`${N8N_BASE_URL}/rest/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: { test: true, triggeredAt: new Date().toISOString() }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Test execution completed for workflow ${workflowId}`);
      return result;
    } else {
      console.log(`⚠️ Test execution failed for workflow ${workflowId}: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Test execution error for workflow ${workflowId}:`, error.message);
  }
}

// 🚀 Main execution function
async function main() {
  console.log('🚀 Starting N8N Advanced Workflow Creator...\n');
  
  // Step 1: Authentication
  const authCookie = await authenticateN8n();
  
  // Step 2: System info
  await getSystemInfo(authCookie);
  
  // Step 3: List existing workflows
  const existingWorkflows = await listWorkflows(authCookie);
  
  // Step 4: Create advanced workflows
  console.log('\n🛠️ Creating advanced workflows...');
  const createdWorkflows = [];
  
  for (const workflow of advancedWorkflows) {
    // Check if workflow already exists
    const existing = existingWorkflows.find(wf => wf.name === workflow.name);
    if (existing) {
      console.log(`⚠️ Workflow "${workflow.name}" already exists (ID: ${existing.id})`);
      createdWorkflows.push(existing);
      continue;
    }
    
    const result = await createAdvancedWorkflow(workflow, authCookie);
    if (result) {
      createdWorkflows.push(result);
    }
    
    // Wait between requests để tránh rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Step 5: Test workflows (optional)
  if (createdWorkflows.length > 0) {
    console.log('\n🧪 Testing workflows...');
    for (const workflow of createdWorkflows.slice(0, 1)) { // Test only first workflow
      await testWorkflowExecution(workflow.id, authCookie);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Step 6: Summary
  console.log('\n📊 Summary:');
  console.log(`   • Total workflows available: ${existingWorkflows.length + createdWorkflows.length}`);
  console.log(`   • New workflows created: ${createdWorkflows.length}`);
  console.log(`   • N8n Dashboard: ${N8N_BASE_URL}`);
  
  console.log('\n🎉 Advanced workflow creation complete!');
  console.log('👀 Check your n8n dashboard to see the new workflows.');
  console.log('🔧 You can now activate and customize these workflows as needed.');
}

// Run the script
await main();