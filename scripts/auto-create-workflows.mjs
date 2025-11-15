// ================================================
// AUTO CREATE N8N WORKFLOWS
// Script to automatically create workflows via n8n API
// ================================================

import { n8nService } from '../src/lib/automation/n8n-service.js';

const N8N_BASE_URL = 'http://localhost:5678';

// ================================================
// Sample Workflow Definitions
// ================================================

const SAMPLE_WORKFLOWS = [
  {
    name: "Auto Content Writer",
    description: "Automatically generate and publish blog content using OpenAI",
    nodes: [
      {
        id: "webhook",
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        position: [240, 300],
        parameters: {
          httpMethod: "POST",
          path: "content-writer"
        }
      },
      {
        id: "openai",
        name: "Generate Content",
        type: "n8n-nodes-base.openAi",
        position: [460, 300],
        parameters: {
          resource: "chat",
          operation: "message",
          model: "gpt-4o-mini",
          messages: {
            values: [
              {
                role: "system",
                content: "You are a professional content writer. Create engaging blog posts."
              },
              {
                role: "user", 
                content: "Write a blog post about: {{ $json.topic }}"
              }
            ]
          },
          maxTokens: 1000,
          temperature: 0.7
        }
      },
      {
        id: "supabase",
        name: "Save to Database",
        type: "n8n-nodes-base.supabase",
        position: [680, 300],
        parameters: {
          operation: "insert",
          table: "content_queue",
          fieldsUi: {
            fieldValues: [
              {
                fieldId: "title",
                fieldValue: "{{ $json.topic }}"
              },
              {
                fieldId: "content", 
                fieldValue: "{{ $node['Generate Content'].json.choices[0].message.content }}"
              },
              {
                fieldId: "status",
                fieldValue: "generated"
              },
              {
                fieldId: "type",
                fieldValue: "blog_post"
              }
            ]
          }
        }
      }
    ],
    connections: {
      "webhook": {
        "main": [["openai"]]
      },
      "openai": {
        "main": [["supabase"]]
      }
    }
  },
  
  {
    name: "Email Automation Sequence",
    description: "Multi-step email drip campaign with personalization",
    nodes: [
      {
        id: "schedule",
        name: "Daily Schedule",
        type: "n8n-nodes-base.cron",
        position: [240, 300],
        parameters: {
          rule: {
            hour: 9,
            minute: 0
          }
        }
      },
      {
        id: "supabase_query",
        name: "Get Leads",
        type: "n8n-nodes-base.supabase",
        position: [460, 300],
        parameters: {
          operation: "select",
          table: "contacts",
          filterType: "manual",
          conditions: {
            values: [
              {
                keyName: "email_sequence_step",
                condition: "smallerEqual",
                keyValue: 3
              },
              {
                keyName: "subscribed",
                condition: "equal", 
                keyValue: true
              }
            ]
          }
        }
      },
      {
        id: "split",
        name: "Process Each Lead",
        type: "n8n-nodes-base.splitInBatches",
        position: [680, 300],
        parameters: {
          batchSize: 1
        }
      },
      {
        id: "email_send",
        name: "Send Personalized Email",
        type: "n8n-nodes-base.emailSend",
        position: [900, 300],
        parameters: {
          fromEmail: "noreply@automation.com",
          toEmail: "{{ $json.email }}",
          subject: "Day {{ $json.email_sequence_step + 1 }}: Your Automation Journey",
          message: `Hi {{ $json.first_name }},

Welcome to day {{ $json.email_sequence_step + 1 }} of your automation journey!

Today's tip: {{ $json.email_sequence_step === 0 ? 'Start with simple workflows' : $json.email_sequence_step === 1 ? 'Add AI to your processes' : 'Scale your automation' }}

Best regards,
Automation Team`
        }
      },
      {
        id: "update_step",
        name: "Update Sequence Step", 
        type: "n8n-nodes-base.supabase",
        position: [1120, 300],
        parameters: {
          operation: "update",
          table: "contacts",
          updateKey: "id",
          fieldsUi: {
            fieldValues: [
              {
                fieldId: "email_sequence_step",
                fieldValue: "{{ $json.email_sequence_step + 1 }}"
              },
              {
                fieldId: "last_email_sent",
                fieldValue: "{{ new Date().toISOString() }}"
              }
            ]
          }
        }
      }
    ],
    connections: {
      "schedule": {
        "main": [["supabase_query"]]
      },
      "supabase_query": {
        "main": [["split"]]
      },
      "split": {
        "main": [["email_send"]]
      },
      "email_send": {
        "main": [["update_step"]]
      }
    }
  },

  {
    name: "Social Media Auto Poster",
    description: "Cross-platform social media posting with optimal timing",
    nodes: [
      {
        id: "webhook",
        name: "Content Webhook",
        type: "n8n-nodes-base.webhook", 
        position: [240, 300],
        parameters: {
          httpMethod: "POST",
          path: "social-post"
        }
      },
      {
        id: "openai_optimize",
        name: "Optimize for Social",
        type: "n8n-nodes-base.openAi",
        position: [460, 300],
        parameters: {
          resource: "chat",
          operation: "message",
          model: "gpt-4o-mini",
          messages: {
            values: [
              {
                role: "system",
                content: "Optimize content for social media platforms. Make it engaging and add relevant hashtags."
              },
              {
                role: "user",
                content: "Optimize this content: {{ $json.content }}\nPlatform: {{ $json.platform }}"
              }
            ]
          }
        }
      },
      {
        id: "linkedin_post",
        name: "Post to LinkedIn",
        type: "n8n-nodes-base.linkedIn",
        position: [680, 200],
        parameters: {
          operation: "post",
          text: "{{ $node['Optimize for Social'].json.choices[0].message.content }}"
        }
      },
      {
        id: "facebook_post", 
        name: "Post to Facebook",
        type: "n8n-nodes-base.facebookGraphApi",
        position: [680, 300],
        parameters: {
          operation: "post",
          message: "{{ $node['Optimize for Social'].json.choices[0].message.content }}"
        }
      },
      {
        id: "twitter_post",
        name: "Post to Twitter",
        type: "n8n-nodes-base.twitter",
        position: [680, 400],
        parameters: {
          operation: "tweet",
          text: "{{ $node['Optimize for Social'].json.choices[0].message.content }}"
        }
      },
      {
        id: "log_activity",
        name: "Log Activity",
        type: "n8n-nodes-base.supabase",
        position: [900, 300],
        parameters: {
          operation: "insert",
          table: "activity_logs",
          fieldsUi: {
            fieldValues: [
              {
                fieldId: "agent_id",
                fieldValue: "{{ $json.agent_id }}"
              },
              {
                fieldId: "action",
                fieldValue: "social_media_post"
              },
              {
                fieldId: "status",
                fieldValue: "success"
              },
              {
                fieldId: "details",
                fieldValue: "Posted to multiple platforms: LinkedIn, Facebook, Twitter"
              }
            ]
          }
        }
      }
    ],
    connections: {
      "webhook": {
        "main": [["openai_optimize"]]
      },
      "openai_optimize": {
        "main": [["linkedin_post", "facebook_post", "twitter_post"]]
      },
      "linkedin_post": {
        "main": [["log_activity"]]
      },
      "facebook_post": {
        "main": [["log_activity"]]
      },
      "twitter_post": {
        "main": [["log_activity"]]
      }
    }
  }
];

// ================================================
// Auto Workflow Creator
// ================================================

class N8nWorkflowCreator {
  constructor(baseUrl = N8N_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiKey = process.env.N8N_API_KEY || '';
  }

  async createWorkflow(workflowDef) {
    try {
      console.log(`🔧 Creating workflow: ${workflowDef.name}`);
      
      const workflowData = {
        name: workflowDef.name,
        nodes: workflowDef.nodes.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          position: node.position,
          parameters: node.parameters || {}
        })),
        connections: workflowDef.connections,
        active: false,
        settings: {
          executionOrder: "v1"
        }
      };

      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey })
        },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Created workflow: ${result.name} (ID: ${result.id})`);
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to create workflow ${workflowDef.name}:`, error.message);
      throw error;
    }
  }

  async activateWorkflow(workflowId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to activate workflow: ${response.status}`);
      }

      console.log(`⚡ Activated workflow: ${workflowId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to activate workflow ${workflowId}:`, error.message);
      return false;
    }
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`);
      if (response.ok) {
        console.log('✅ N8N connection successful');
        return true;
      }
    } catch (error) {
      console.error('❌ N8N connection failed:', error.message);
      return false;
    }
  }

  async createAllSampleWorkflows() {
    console.log('\n🚀 Auto-creating sample workflows...\n');
    
    // Test connection first
    const connected = await this.testConnection();
    if (!connected) {
      console.log('❌ Cannot connect to n8n. Make sure it\'s running on http://localhost:5678');
      return;
    }

    const results = [];
    
    for (const workflowDef of SAMPLE_WORKFLOWS) {
      try {
        const workflow = await this.createWorkflow(workflowDef);
        results.push({
          name: workflow.name,
          id: workflow.id,
          success: true
        });
        
        // Small delay between creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          name: workflowDef.name,
          error: error.message,
          success: false
        });
      }
    }

    console.log('\n📊 Workflow Creation Summary:');
    console.log('================================');
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.name} (ID: ${result.id})`);
      } else {
        console.log(`❌ ${result.name} - ${result.error}`);
      }
    });

    console.log(`\n🎉 Created ${results.filter(r => r.success).length}/${results.length} workflows successfully!`);
    console.log('\n📍 Next steps:');
    console.log('1. Open n8n editor: http://localhost:5678');
    console.log('2. Configure API credentials for external services');
    console.log('3. Test and activate workflows');
    console.log('4. Access via automation dashboard: http://localhost:5173/automation → Workflows tab');
    
    return results;
  }
}

// ================================================
// Execute Auto Creation
// ================================================

async function main() {
  const creator = new N8nWorkflowCreator();
  await creator.createAllSampleWorkflows();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { N8nWorkflowCreator, SAMPLE_WORKFLOWS };