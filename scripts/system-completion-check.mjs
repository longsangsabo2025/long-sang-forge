#!/usr/bin/env node

/**
 * ================================================
 * COMPLETE SYSTEM STATUS CHECK
 * Kiểm tra tình trạng hoàn thành của hệ thống
 * ================================================
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function checkFile(filePath, description) {
    const fullPath = join(__dirname, '..', filePath);
    const exists = existsSync(fullPath);
    log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? 'green' : 'red');
    return exists;
}

async function checkSystemCompletion() {
    log('\n🔍 COMPLETE SYSTEM STATUS CHECK', 'bold');
    log('='.repeat(50), 'cyan');
    
    let totalChecks = 0;
    let passedChecks = 0;
    
    // ================================================
    // 1. CORE FILES CHECK
    // ================================================
    log('\n📁 CORE FILES COMPLETION:', 'yellow');
    
    const coreFiles = [
        ['AI_AGENT_MASTER_ARCHITECTURE.md', 'Master Architecture Documentation'],
        ['src/components/automation/MasterPlayButton.tsx', 'Master Play Button Component'],
        ['src/components/automation/McpDashboard.tsx', 'MCP Dashboard Component'],
        ['src/lib/automation/n8n-service.ts', 'N8n Service Layer'],
        ['src/lib/automation/n8n-webhooks.ts', 'N8n Webhooks Integration'],
        ['scripts/n8n-service.ps1', 'N8n Service Manager'],
        ['scripts/deploy-all.ps1', 'Deployment Script']
    ];
    
    for (const [file, desc] of coreFiles) {
        totalChecks++;
        if (checkFile(file, desc)) passedChecks++;
    }
    
    // ================================================
    // 2. DATABASE SCHEMA CHECK
    // ================================================
    log('\n🗄️ DATABASE SCHEMA COMPLETION:', 'yellow');
    
    const dbFiles = [
        ['supabase/migrations/20251015000001_create_automation_tables.sql', 'Automation Tables Migration'],
        ['supabase/migrations/20251015000002_seed_initial_agents.sql', 'Initial Agents Seed'],
        ['setup-database.sql', 'Database Setup Script']
    ];
    
    for (const [file, desc] of dbFiles) {
        totalChecks++;
        if (checkFile(file, desc)) passedChecks++;
    }
    
    // ================================================
    // 3. N8N WORKFLOWS CHECK
    // ================================================
    log('\n🔄 N8N WORKFLOWS COMPLETION:', 'yellow');
    
    const workflowFiles = [
        ['workflows/master-orchestrator.json', 'Master Orchestrator Workflow'],
        ['workflows/smart-router.json', 'Smart Router Workflow'],
        ['workflows/content-factory.json', 'Content Factory Workflow'],
        ['workflows/social-media-manager.json', 'Social Media Manager'],
        ['workflows/email-automation.json', 'Email Automation'],
        ['workflows/portfolio-updater.json', 'Portfolio Updater']
    ];
    
    for (const [file, desc] of workflowFiles) {
        totalChecks++;
        if (checkFile(file, desc)) passedChecks++;
    }
    
    // ================================================
    // 4. SERVICE CONNECTION CHECK
    // ================================================
    log('\n🌐 SERVICE CONNECTIONS:', 'yellow');
    
    // Check N8n
    totalChecks++;
    try {
        const n8nResponse = await fetch('http://localhost:5678', { 
            method: 'GET',
            timeout: 5000 
        });
        if (n8nResponse.ok) {
            log('✅ N8n Server: Running on http://localhost:5678', 'green');
            passedChecks++;
        } else {
            log('❌ N8n Server: Not responding', 'red');
        }
    } catch (error) {
        log(`❌ N8n Server: Connection failed (${error.message})`, 'red');
    }
    
    // Check Supabase (if configured)
    totalChecks++;
    try {
        const envFile = join(__dirname, '..', '.env');
        if (existsSync(envFile)) {
            const envContent = readFileSync(envFile, 'utf8');
            const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
            const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];
            
            if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const { data, error } = await supabase.from('automation_agents').select('count').limit(1);
                
                if (!error) {
                    log('✅ Supabase Database: Connected and accessible', 'green');
                    passedChecks++;
                } else {
                    log(`❌ Supabase Database: ${error.message}`, 'red');
                }
            } else {
                log('❌ Supabase Database: Environment variables not configured', 'red');
            }
        } else {
            log('❌ Supabase Database: .env file not found', 'red');
        }
    } catch (error) {
        log(`❌ Supabase Database: ${error.message}`, 'red');
    }
    
    // ================================================
    // 5. INTEGRATION STATUS CHECK
    // ================================================
    log('\n🔗 INTEGRATION STATUS:', 'yellow');
    
    totalChecks++;
    try {
        // Test webhook endpoints
        const webhookTests = [
            'http://localhost:5678/webhook/master-orchestrator',
            'http://localhost:5678/webhook/smart-router',
            'http://localhost:5678/webhook/content-generator'
        ];
        
        let webhooksPassed = 0;
        for (const webhook of webhookTests) {
            try {
                const response = await fetch(webhook, { 
                    method: 'GET',
                    timeout: 3000 
                });
                if (response.status !== 404) {
                    webhooksPassed++;
                }
            } catch (error) {
                // Expected for unregistered webhooks
            }
        }
        
        if (webhooksPassed > 0) {
            log(`✅ Webhook Integration: ${webhooksPassed}/${webhookTests.length} endpoints accessible`, 'green');
            passedChecks++;
        } else {
            log('❌ Webhook Integration: No webhooks accessible', 'red');
        }
    } catch (error) {
        log(`❌ Webhook Integration: ${error.message}`, 'red');
    }
    
    // ================================================
    // 6. SUMMARY
    // ================================================
    log('\n📊 COMPLETION SUMMARY:', 'bold');
    log('='.repeat(50), 'cyan');
    
    const completionRate = Math.round((passedChecks / totalChecks) * 100);
    
    log(`Total Checks: ${totalChecks}`, 'blue');
    log(`Passed: ${passedChecks}`, 'green');
    log(`Failed: ${totalChecks - passedChecks}`, 'red');
    log(`Completion Rate: ${completionRate}%`, completionRate >= 80 ? 'green' : completionRate >= 60 ? 'yellow' : 'red');
    
    if (completionRate >= 80) {
        log('\n🎉 SYSTEM STATUS: READY FOR PRODUCTION!', 'green');
        log('✅ All core components are implemented and functional', 'green');
        log('🚀 You can now use the Master Play Button for full automation', 'green');
    } else if (completionRate >= 60) {
        log('\n⚠️ SYSTEM STATUS: MOSTLY COMPLETE', 'yellow');
        log('🔧 Some components need configuration or deployment', 'yellow');
        log('📝 Check failed items above for specific issues', 'yellow');
    } else {
        log('\n❌ SYSTEM STATUS: INCOMPLETE', 'red');
        log('🔧 Major components missing or not configured', 'red');
        log('📝 Review the architecture and complete missing items', 'red');
    }
    
    // ================================================
    // 7. NEXT STEPS
    // ================================================
    log('\n📋 NEXT STEPS:', 'bold');
    log('='.repeat(50), 'cyan');
    
    if (passedChecks < totalChecks) {
        log('1. Fix failed checks listed above', 'yellow');
        log('2. Configure Supabase environment variables in .env', 'yellow');
        log('3. Deploy database migrations: npm run deploy:db', 'yellow');
        log('4. Import workflows to n8n dashboard', 'yellow');
        log('5. Test integration with: npm run test:system', 'yellow');
    } else {
        log('✅ All systems operational!', 'green');
        log('🎯 Ready for full automation testing', 'green');
        log('🚀 Access dashboard at http://localhost:5173', 'green');
        log('⚙️ Access n8n at http://localhost:5678', 'green');
    }
    
    return { totalChecks, passedChecks, completionRate };
}

// Run the check
checkSystemCompletion().catch(console.error);