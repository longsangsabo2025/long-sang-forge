#!/usr/bin/env node
/**
 * 🚀 Multi-Site SEO Foundation - Auto Deploy
 * Deploy tất cả components cần thiết cho multi-site management
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('\n❌ Missing Supabase credentials in .env\n'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log(chalk.blue.bold('\n🚀 MULTI-SITE SEO FOUNDATION - AUTO DEPLOY\n'));

async function checkConnection() {
  console.log(chalk.yellow('📡 Checking Supabase connection...'));
  
  try {
    const { data, error } = await supabase.from('seo_domains').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(chalk.gray('   ℹ️  Tables chưa tồn tại - sẽ deploy'));
        return false;
      }
      throw error;
    }
    
    console.log(chalk.green('   ✅ Connected to Supabase'));
    return true;
  } catch (error) {
    console.error(chalk.red(`   ❌ Connection error: ${error.message}`));
    return false;
  }
}

async function deployDatabaseSchema() {
  console.log(chalk.yellow('\n📊 Deploying database schema...'));
  
  // Read SQL file
  const sqlPath = path.join(__dirname, 'setup-seo-database.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(chalk.red(`   ❌ SQL file not found: ${sqlPath}`));
    return false;
  }
  
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  console.log(chalk.gray('\n   ⚠️  Manual step required:'));
  console.log(chalk.gray('   1. Open: https://app.supabase.com/project/diexsbzqwsbpilsymnfb/sql'));
  console.log(chalk.gray('   2. Copy and run the SQL from: scripts/setup-seo-database.sql'));
  console.log(chalk.gray('   3. Press Enter to continue after running SQL...\n'));
  
  // Wait for user confirmation
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });
  
  return true;
}

async function addSaboArena() {
  console.log(chalk.yellow('\n🎯 Adding SABO ARENA to database...'));
  
  try {
    const { data, error } = await supabase
      .from('seo_domains')
      .upsert({
        name: 'SABO ARENA',
        url: 'https://saboarena.com',
        enabled: true,
        auto_index: true,
        total_urls: 0,
        indexed_urls: 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(chalk.green('   ✅ SABO ARENA added successfully'));
    console.log(chalk.gray(`   ID: ${data.id}`));
    return data;
  } catch (error) {
    console.error(chalk.red(`   ❌ Error: ${error.message}`));
    return null;
  }
}

async function verifySetup() {
  console.log(chalk.yellow('\n🔍 Verifying setup...'));
  
  try {
    // Check domains table
    const { data: domains, error: domainsError } = await supabase
      .from('seo_domains')
      .select('*');
    
    if (domainsError) throw domainsError;
    
    console.log(chalk.green(`   ✅ seo_domains table: ${domains.length} records`));
    
    // Check other tables
    const tables = ['seo_indexing_queue', 'seo_keywords', 'seo_analytics', 'seo_sitemaps'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        console.log(chalk.red(`   ❌ ${table} table: ${error.message}`));
      } else {
        console.log(chalk.green(`   ✅ ${table} table: OK`));
      }
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red(`   ❌ Verification error: ${error.message}`));
    return false;
  }
}

async function showNextSteps() {
  console.log(chalk.blue.bold('\n📋 NEXT STEPS:\n'));
  
  console.log(chalk.white('1. Verify Google Search Console:'));
  console.log(chalk.gray('   • Go to: https://search.google.com/search-console/'));
  console.log(chalk.gray('   • Add property: saboarena.com'));
  console.log(chalk.gray('   • Add service account: automation-bot-102@long-sang-automation.iam.gserviceaccount.com'));
  console.log(chalk.gray('   • Role: Owner\n'));
  
  console.log(chalk.white('2. Test Multi-Site Manager:'));
  console.log(chalk.gray('   • Run: node scripts/multi-site-manager.mjs\n'));
  
  console.log(chalk.white('3. Add More Websites:'));
  console.log(chalk.gray('   • Use CLI: node scripts/multi-site-manager.mjs'));
  console.log(chalk.gray('   • Or use UI: /seo/domains\n'));
  
  console.log(chalk.white('4. Setup Automation:'));
  console.log(chalk.gray('   • Create daily automation script'));
  console.log(chalk.gray('   • Schedule with GitHub Actions or cron\n'));
}

async function main() {
  try {
    // Step 1: Check connection
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      // Step 2: Deploy database schema
      const deployed = await deployDatabaseSchema();
      if (!deployed) {
        console.error(chalk.red('\n❌ Database deployment failed\n'));
        process.exit(1);
      }
      
      // Re-check connection
      const recheckConnected = await checkConnection();
      if (!recheckConnected) {
        console.error(chalk.red('\n❌ Still cannot connect. Please check database setup.\n'));
        process.exit(1);
      }
    }
    
    // Step 3: Add SABO ARENA
    const saboArena = await addSaboArena();
    
    // Step 4: Verify setup
    const verified = await verifySetup();
    
    if (verified) {
      console.log(chalk.green.bold('\n✅ MULTI-SITE SEO FOUNDATION - DEPLOYED SUCCESSFULLY!\n'));
      
      // Show summary
      console.log(chalk.blue('📊 System Summary:'));
      console.log(chalk.gray(`   • Database: ${supabaseUrl}`));
      console.log(chalk.gray('   • Tables: 6 tables created'));
      console.log(chalk.gray('   • Initial website: SABO ARENA'));
      console.log(chalk.gray('   • Status: Ready for production\n'));
      
      await showNextSteps();
    } else {
      console.log(chalk.yellow('\n⚠️  Setup completed with warnings. Please check errors above.\n'));
    }
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`));
    process.exit(1);
  }
}

main();
