#!/usr/bin/env node
/**
 * 🌐 Multi-Site Daily Automation
 * Runs automation for ALL websites in database
 */

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log(chalk.blue.bold('\n🌐 MULTI-SITE DAILY AUTOMATION\n'));
console.log(chalk.gray(`Started at: ${new Date().toLocaleString()}\n`));

// Get Google Auth Client
async function getAuthClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not found');
  }
  
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ],
  });

  return auth.getClient();
}

// Get performance data from Google Search Console
async function getPerformanceData(siteUrl, days = 7) {
  try {
    const authClient = await getAuthClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const response = await searchconsole.searchanalytics.query({
      siteUrl: `sc-domain:${siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date'],
        rowLimit: 1000,
      },
    });
    
    return response.data.rows || [];
  } catch (error) {
    console.error(chalk.red(`   ❌ Error fetching data: ${error.message}`));
    return [];
  }
}

// Record analytics to database
async function recordAnalytics(domainId, date, impressions, clicks, ctr, position) {
  try {
    const { error } = await supabase
      .from('seo_analytics')
      .upsert({
        domain_id: domainId,
        date: date,
        impressions: impressions,
        clicks: clicks,
        ctr: ctr,
        avg_position: position,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  } catch (error) {
    console.error(chalk.red(`   ❌ Error recording analytics: ${error.message}`));
  }
}

// Update domain stats
async function updateDomainStats(domainId) {
  try {
    // Get indexed count from queue
    const { data: queueData } = await supabase
      .from('seo_indexing_queue')
      .select('status')
      .eq('domain_id', domainId)
      .eq('status', 'indexed');
    
    const indexedCount = queueData?.length || 0;
    
    // Update domain
    const { error } = await supabase
      .from('seo_domains')
      .update({
        indexed_urls: indexedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainId);
    
    if (error) throw error;
    
    return indexedCount;
  } catch (error) {
    console.error(chalk.red(`   ❌ Error updating stats: ${error.message}`));
    return 0;
  }
}

// Main automation
async function runDailyAutomation() {
  try {
    // Get all enabled domains
    const { data: domains, error } = await supabase
      .from('seo_domains')
      .select('*')
      .eq('enabled', true);
    
    if (error) throw error;
    
    if (!domains || domains.length === 0) {
      console.log(chalk.yellow('⚠️  No active domains found.\n'));
      return;
    }
    
    console.log(chalk.green(`📊 Processing ${domains.length} active website(s)...\n`));
    
    let totalImpressions = 0;
    let totalClicks = 0;
    
    for (const domain of domains) {
      console.log(chalk.cyan(`\n📍 ${domain.name} (${domain.url})`));
      
      try {
        // 1. Get performance data from Google
        console.log(chalk.gray('   📈 Fetching performance data...'));
        const performanceData = await getPerformanceData(domain.url, 7);
        
        if (performanceData.length > 0) {
          console.log(chalk.gray(`   ✓ Found ${performanceData.length} days of data`));
          
          // 2. Record analytics
          let domainImpressions = 0;
          let domainClicks = 0;
          
          for (const row of performanceData) {
            const date = row.keys[0];
            const impressions = row.impressions || 0;
            const clicks = row.clicks || 0;
            const ctr = row.ctr || 0;
            const position = row.position || 0;
            
            await recordAnalytics(domain.id, date, impressions, clicks, ctr, position);
            
            domainImpressions += impressions;
            domainClicks += clicks;
          }
          
          console.log(chalk.gray(`   ✓ Recorded: ${domainImpressions} impressions, ${domainClicks} clicks`));
          
          totalImpressions += domainImpressions;
          totalClicks += domainClicks;
        } else {
          console.log(chalk.gray('   ℹ️  No performance data available'));
        }
        
        // 3. Update domain stats
        console.log(chalk.gray('   📊 Updating stats...'));
        const indexedCount = await updateDomainStats(domain.id);
        console.log(chalk.gray(`   ✓ Indexed URLs: ${indexedCount}`));
        
        console.log(chalk.green(`   ✅ ${domain.name} completed`));
        
      } catch (error) {
        console.error(chalk.red(`   ❌ Error processing ${domain.name}: ${error.message}`));
        // Continue with next domain
      }
      
      // Small delay between domains to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    console.log(chalk.blue.bold('\n📊 AUTOMATION SUMMARY:\n'));
    console.log(chalk.white(`   • Websites processed: ${domains.length}`));
    console.log(chalk.white(`   • Total impressions: ${totalImpressions.toLocaleString()}`));
    console.log(chalk.white(`   • Total clicks: ${totalClicks.toLocaleString()}`));
    console.log(chalk.white(`   • Completed at: ${new Date().toLocaleString()}\n`));
    
    console.log(chalk.green.bold('✅ DAILY AUTOMATION COMPLETED!\n'));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`));
    process.exit(1);
  }
}

// Run
runDailyAutomation();
