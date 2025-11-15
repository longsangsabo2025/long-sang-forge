// ================================================
// N8N API CONNECTION DEMO
// Simple demo of connecting to n8n API
// ================================================

const N8N_BASE_URL = 'http://localhost:5678';

async function testN8nConnection() {
  console.log('🔍 Testing n8n connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${N8N_BASE_URL}/healthz`);
    if (healthResponse.ok) {
      console.log('✅ N8N is running and healthy');
    } else {
      console.log('❌ N8N health check failed');
      return false;
    }

    // Test API endpoint
    const apiResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows`);
    if (apiResponse.ok) {
      const workflows = await apiResponse.json();
      console.log(`✅ API connection successful - Found ${workflows.data?.length || 0} workflows`);
      return true;
    } else {
      console.log('❌ API connection failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function createSimpleWorkflow() {
  console.log('🔧 Creating simple test workflow...');
  
  const simpleWorkflow = {
    name: "Test Webhook Workflow",
    nodes: [
      {
        id: "webhook-node",
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [240, 300],
        parameters: {
          httpMethod: "POST",
          path: "test-webhook"
        }
      },
      {
        id: "set-node",
        name: "Set Data",
        type: "n8n-nodes-base.set",
        position: [460, 300],
        parameters: {
          values: {
            string: [
              {
                name: "message",
                value: "Hello from n8n automation!"
              },
              {
                name: "timestamp",
                value: "{{ new Date().toISOString() }}"
              }
            ]
          }
        }
      }
    ],
    connections: {
      "webhook-node": {
        "main": [["set-node"]]
      }
    },
    active: false,
    settings: {
      executionOrder: "v1"
    }
  };

  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simpleWorkflow)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Workflow created successfully!`);
      console.log(`   - Name: ${result.name}`);
      console.log(`   - ID: ${result.id}`);
      console.log(`   - Webhook URL: ${N8N_BASE_URL}/webhook/test-webhook`);
      return result;
    } else {
      const error = await response.text();
      console.log('❌ Failed to create workflow:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating workflow:', error.message);
    return null;
  }
}

async function listWorkflows() {
  console.log('📋 Listing existing workflows...');
  
  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`);
    if (response.ok) {
      const result = await response.json();
      const workflows = result.data || [];
      
      if (workflows.length === 0) {
        console.log('📝 No workflows found');
      } else {
        console.log(`📊 Found ${workflows.length} workflow(s):`);
        workflows.forEach((workflow, index) => {
          console.log(`   ${index + 1}. ${workflow.name} (ID: ${workflow.id})`);
        });
      }
      return workflows;
    } else {
      console.log('❌ Failed to list workflows');
      return [];
    }
  } catch (error) {
    console.log('❌ Error listing workflows:', error.message);
    return [];
  }
}

async function main() {
  console.log('\n🚀 N8N API Demo Starting...\n');
  
  // Step 1: Test connection
  const connected = await testN8nConnection();
  if (!connected) {
    console.log('\n❌ Cannot connect to n8n. Please ensure:');
    console.log('   1. n8n is running: npx n8n start');
    console.log('   2. Available at: http://localhost:5678');
    console.log('   3. Owner account is set up');
    return;
  }

  console.log(''); // Empty line

  // Step 2: List existing workflows
  await listWorkflows();
  
  console.log(''); // Empty line

  // Step 3: Create a simple workflow
  const newWorkflow = await createSimpleWorkflow();
  
  if (newWorkflow) {
    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📍 Next steps:');
    console.log('1. Open n8n editor: http://localhost:5678');
    console.log('2. View your new workflow');
    console.log('3. Activate it and test the webhook');
    console.log('4. Check automation dashboard: http://localhost:5173/automation → Workflows tab');
  }
}

// Run the demo
main().catch(console.error);