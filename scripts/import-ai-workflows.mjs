#!/usr/bin/env node

/**
 * ================================================
 * N8N WORKFLOW AUTO IMPORTER WITH API
 * Tự động import và setup AI workflows
 * ================================================
 */

import fetch from 'node-fetch';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
        }
        
        return data;
    } catch (error) {
        log(`❌ API Request failed: ${error.message}`, 'red');
        throw error;
    }
}

async function checkN8nConnection() {
    log('🔍 Checking n8n connection...', 'yellow');
    
    try {
        const response = await fetch(`${N8N_BASE_URL}/healthz`, {
            headers: {
                'X-N8N-API-KEY': N8N_API_KEY
            }
        });
        
        if (response.ok) {
            log('✅ N8n server is accessible', 'green');
            return true;
        } else {
            log(`❌ N8n health check failed: ${response.status}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Cannot connect to n8n: ${error.message}`, 'red');
        return false;
    }
}

async function getExistingWorkflows() {
    log('📋 Getting existing workflows...', 'yellow');
    
    try {
        const workflows = await makeN8nRequest('/api/v1/workflows');
        log(`Found ${workflows.data?.length || 0} existing workflows`, 'blue');
        return workflows.data || [];
    } catch (error) {
        log('❌ Failed to get workflows', 'red');
        return [];
    }
}

async function importWorkflow(workflowData, filename) {
    log(`📥 Importing workflow: ${filename}`, 'yellow');
    
    try {
        // Check if workflow already exists
        const existingWorkflows = await getExistingWorkflows();
        const existingWorkflow = existingWorkflows.find(w => w.name === workflowData.name);
        
        if (existingWorkflow) {
            log(`⚠️ Workflow "${workflowData.name}" already exists, updating...`, 'yellow');
            
            // Update existing workflow
            const updatedWorkflow = await makeN8nRequest(
                `/api/v1/workflows/${existingWorkflow.id}`, 
                'PUT', 
                workflowData
            );
            
            log(`✅ Updated workflow: ${workflowData.name}`, 'green');
            return updatedWorkflow;
        } else {
            // Create new workflow
            const newWorkflow = await makeN8nRequest('/api/v1/workflows', 'POST', workflowData);
            log(`✅ Created workflow: ${workflowData.name}`, 'green');
            return newWorkflow;
        }
    } catch (error) {
        log(`❌ Failed to import ${filename}: ${error.message}`, 'red');
        throw error;
    }
}

async function activateWorkflow(workflowId, workflowName) {
    log(`🚀 Activating workflow: ${workflowName}`, 'yellow');
    
    try {
        await makeN8nRequest(`/api/v1/workflows/${workflowId}/activate`, 'POST');
        log(`✅ Activated workflow: ${workflowName}`, 'green');
    } catch (error) {
        log(`❌ Failed to activate ${workflowName}: ${error.message}`, 'red');
    }
}

async function createAICredentials() {
    log('🔑 Setting up AI credentials...', 'yellow');
    
    const credentials = [
        {
            name: 'OpenAI API',
            type: 'openAiApi',
            data: {
                apiKey: 'your-openai-api-key-here' // User will need to update this
            }
        },
        {
            name: 'Supabase API',
            type: 'supabaseApi', 
            data: {
                host: 'your-project.supabase.co',
                serviceRole: 'your-service-role-key'
            }
        }
    ];
    
    for (const cred of credentials) {
        try {
            await makeN8nRequest('/api/v1/credentials', 'POST', cred);
            log(`✅ Created credential: ${cred.name}`, 'green');
        } catch (error) {
            if (error.message.includes('already exists')) {
                log(`⚠️ Credential "${cred.name}" already exists`, 'yellow');
            } else {
                log(`❌ Failed to create credential ${cred.name}: ${error.message}`, 'red');
            }
        }
    }
}

async function importAllWorkflows() {
    log('\n🚀 STARTING AI WORKFLOW IMPORT', 'bold');
    log('='.repeat(50), 'cyan');
    
    // Check connection
    const connected = await checkN8nConnection();
    if (!connected) {
        log('❌ Cannot proceed without n8n connection', 'red');
        return;
    }
    
    // Setup credentials
    await createAICredentials();
    
    // Import workflows
    const workflowsDir = join(__dirname, '..', 'workflows');
    const workflowFiles = readdirSync(workflowsDir).filter(file => file.endsWith('.json'));
    
    log(`\n📂 Found ${workflowFiles.length} workflow files`, 'blue');
    
    let importedCount = 0;
    let activatedCount = 0;
    
    for (const filename of workflowFiles) {
        try {
            const filePath = join(workflowsDir, filename);
            const workflowData = JSON.parse(readFileSync(filePath, 'utf8'));
            
            // Import workflow
            const importedWorkflow = await importWorkflow(workflowData, filename);
            importedCount++;
            
            // Activate workflow
            if (importedWorkflow.id) {
                await activateWorkflow(importedWorkflow.id, workflowData.name);
                activatedCount++;
            }
            
        } catch (error) {
            log(`❌ Error processing ${filename}: ${error.message}`, 'red');
        }
    }
    
    // Summary
    log('\n📊 IMPORT SUMMARY', 'bold');
    log('='.repeat(50), 'cyan');
    log(`Total Files: ${workflowFiles.length}`, 'blue');
    log(`Imported: ${importedCount}`, 'green');
    log(`Activated: ${activatedCount}`, 'green');
    log(`Failed: ${workflowFiles.length - importedCount}`, importedCount < workflowFiles.length ? 'red' : 'green');
    
    if (importedCount === workflowFiles.length) {
        log('\n🎉 ALL WORKFLOWS IMPORTED SUCCESSFULLY!', 'green');
        log('🚀 Your AI automation system is ready!', 'green');
        log(`📊 Dashboard: ${N8N_BASE_URL}`, 'cyan');
    } else {
        log('\n⚠️ Some workflows failed to import', 'yellow');
        log('Check the errors above and try again', 'yellow');
    }
    
    // Next steps
    log('\n📋 NEXT STEPS:', 'bold');
    log('1. Update API credentials in n8n dashboard', 'yellow');
    log('2. Test workflows individually', 'yellow');
    log('3. Configure webhook URLs if needed', 'yellow');
    log('4. Run integration tests', 'yellow');
}

// Run the importer
importAllWorkflows().catch(console.error);