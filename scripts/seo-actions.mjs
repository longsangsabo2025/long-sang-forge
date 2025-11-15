/**
 * 🚀 SABO ARENA - Google Search Console Actions
 * Script thực thi các actions trực tiếp lên Google Search Console
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SITE_URL = 'sc-domain:saboarena.com';

// ================================================
// AUTHENTICATION
// ================================================

const getAuthClient = async () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not found in .env.local');
  }
  
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/indexing',
    ],
  });

  return auth.getClient();
};

// ================================================
// 1. GET PERFORMANCE DATA
// ================================================

async function getPerformanceData(days = 7) {
  console.log('\n📊 FETCHING PERFORMANCE DATA...\n');
  
  try {
    const authClient = await getAuthClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query', 'page'],
        rowLimit: 25,
        startRow: 0,
      },
    });

    const rows = response.data.rows || [];
    
    if (rows.length === 0) {
      console.log('⚠️  No data yet. Website is new - data will appear in 24-48 hours after first crawl.');
      return;
    }

    console.log(`📈 Top ${rows.length} Keywords (Last ${days} days):\n`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Rank | Keyword                    | Clicks | Impr. | CTR   | Pos.');
    console.log('───────────────────────────────────────────────────────────────');
    
    rows.forEach((row, index) => {
      const keyword = row.keys[0].padEnd(25).substring(0, 25);
      const clicks = String(row.clicks || 0).padStart(6);
      const impressions = String(row.impressions || 0).padStart(6);
      const ctr = ((row.ctr || 0) * 100).toFixed(1).padStart(5) + '%';
      const position = (row.position || 0).toFixed(1).padStart(4);
      
      console.log(`${String(index + 1).padStart(4)} | ${keyword} | ${clicks} | ${impressions} | ${ctr} | ${position}`);
    });
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Summary
    const totalClicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
    const totalImpressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    const avgPosition = rows.reduce((sum, row) => sum + (row.position || 0), 0) / rows.length;
    
    console.log('📊 SUMMARY:');
    console.log(`   Total Clicks:      ${totalClicks}`);
    console.log(`   Total Impressions: ${totalImpressions}`);
    console.log(`   Average CTR:       ${avgCTR}%`);
    console.log(`   Average Position:  ${avgPosition.toFixed(1)}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ================================================
// 2. GET SITEMAPS STATUS
// ================================================

async function getSitemaps() {
  console.log('\n🗺️  CHECKING SITEMAPS...\n');
  
  try {
    const authClient = await getAuthClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    const response = await searchconsole.sitemaps.list({
      siteUrl: SITE_URL,
    });

    const sitemaps = response.data.sitemap || [];
    
    if (sitemaps.length === 0) {
      console.log('⚠️  No sitemaps found. You should submit a sitemap!');
      console.log('');
      console.log('💡 To submit: node scripts/seo-actions.mjs submit-sitemap [url]');
      console.log('   Example: node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap.xml');
      console.log('');
      return;
    }

    console.log(`📋 Found ${sitemaps.length} sitemap(s):\n`);
    
    sitemaps.forEach((sitemap, index) => {
      console.log(`${index + 1}. ${sitemap.path}`);
      console.log(`   Status: ${sitemap.isPending ? '⏳ Pending' : '✅ Processed'}`);
      console.log(`   Last Submitted: ${sitemap.lastSubmitted || 'N/A'}`);
      console.log(`   Last Downloaded: ${sitemap.lastDownloaded || 'N/A'}`);
      if (sitemap.contents && sitemap.contents.length > 0) {
        console.log(`   Contents:`);
        sitemap.contents.forEach(content => {
          console.log(`     - ${content.type}: ${content.submitted || 0} submitted, ${content.indexed || 0} indexed`);
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ================================================
// 3. SUBMIT SITEMAP
// ================================================

async function submitSitemap(sitemapUrl) {
  console.log('\n🚀 SUBMITTING SITEMAP...\n');
  
  if (!sitemapUrl) {
    console.log('❌ Please provide sitemap URL');
    console.log('   Usage: node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap.xml');
    return;
  }
  
  try {
    const authClient = await getAuthClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    await searchconsole.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: sitemapUrl,
    });

    console.log(`✅ Sitemap submitted successfully: ${sitemapUrl}`);
    console.log('');
    console.log('💡 It may take a few hours for Google to process the sitemap.');
    console.log('   Check status with: node scripts/seo-actions.mjs sitemaps');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ================================================
// 4. DELETE SITEMAP
// ================================================

async function deleteSitemap(sitemapUrl) {
  console.log('\n🗑️  DELETING SITEMAP...\n');
  
  if (!sitemapUrl) {
    console.log('❌ Please provide sitemap URL');
    console.log('   Usage: node scripts/seo-actions.mjs delete-sitemap https://saboarena.com/sitemap.xml');
    return;
  }
  
  try {
    const authClient = await getAuthClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    await searchconsole.sitemaps.delete({
      siteUrl: SITE_URL,
      feedpath: sitemapUrl,
    });

    console.log(`✅ Sitemap deleted: ${sitemapUrl}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ================================================
// 5. REQUEST URL INDEXING
// ================================================

async function requestIndexing(url) {
  console.log('\n🔍 REQUESTING URL INDEXING...\n');
  
  if (!url) {
    console.log('❌ Please provide URL to index');
    console.log('   Usage: node scripts/seo-actions.mjs index-url https://saboarena.com/page');
    return;
  }
  
  try {
    const authClient = await getAuthClient();
    const indexing = google.indexing({ version: 'v3', auth: authClient });
    
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });

    console.log(`✅ Indexing request sent for: ${url}`);
    console.log(`   Status: ${response.data.urlNotificationMetadata?.latestUpdate?.type || 'Submitted'}`);
    console.log('');
    console.log('💡 Google will crawl and index this URL soon (usually within hours).');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('403')) {
      console.log('');
      console.log('💡 Make sure:');
      console.log('   1. Website is verified in Search Console');
      console.log('   2. Service account has Owner permission');
      console.log('   3. Indexing API is enabled in Google Cloud Console');
    }
  }
}

// ================================================
// 6. BULK INDEX URLS
// ================================================

async function bulkIndexUrls(urlsFile) {
  console.log('\n🚀 BULK URL INDEXING...\n');
  
  if (!urlsFile) {
    console.log('❌ Please provide file path with URLs (one per line)');
    console.log('   Usage: node scripts/seo-actions.mjs bulk-index urls.txt');
    return;
  }
  
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(urlsFile, 'utf-8');
    const urls = content.split('\n').filter(url => url.trim());
    
    console.log(`📋 Found ${urls.length} URLs to index\n`);
    
    const authClient = await getAuthClient();
    const indexing = google.indexing({ version: 'v3', auth: authClient });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      
      try {
        await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED',
          },
        });
        
        console.log(`✅ [${i + 1}/${urls.length}] ${url}`);
        successCount++;
        
        // Rate limiting: 1 request per second
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.log(`❌ [${i + 1}/${urls.length}] ${url} - ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log(`📊 RESULTS:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed:  ${failCount}`);
    console.log(`   📝 Total:   ${urls.length}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ================================================
// 7. GET TOP QUERIES
// ================================================

async function getTopQueries(limit = 50) {
  console.log(`\n🔍 TOP ${limit} SEARCH QUERIES...\n`);
  
  try {
    const authClient = await getAuthClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: limit,
      },
    });

    const rows = response.data.rows || [];
    
    if (rows.length === 0) {
      console.log('⚠️  No queries yet. Data will appear after Google crawls your site.');
      return;
    }

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('Rank | Query                           | Clicks | Impr. | CTR   | Pos.');
    console.log('───────────────────────────────────────────────────────────────────');
    
    rows.forEach((row, index) => {
      const query = row.keys[0].padEnd(30).substring(0, 30);
      const clicks = String(row.clicks || 0).padStart(6);
      const impressions = String(row.impressions || 0).padStart(6);
      const ctr = ((row.ctr || 0) * 100).toFixed(1).padStart(5) + '%';
      const position = (row.position || 0).toFixed(1).padStart(4);
      
      console.log(`${String(index + 1).padStart(4)} | ${query} | ${clicks} | ${impressions} | ${ctr} | ${position}`);
    });
    
    console.log('═══════════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ================================================
// MAIN CLI
// ================================================

const action = process.argv[2];
const arg = process.argv[3];

console.log('🎯 SABO ARENA - Google Search Console Manager');
console.log('═══════════════════════════════════════════════════════════════════');

switch (action) {
  case 'performance':
    await getPerformanceData(parseInt(arg) || 7);
    break;
    
  case 'sitemaps':
    await getSitemaps();
    break;
    
  case 'submit-sitemap':
    await submitSitemap(arg);
    break;
    
  case 'delete-sitemap':
    await deleteSitemap(arg);
    break;
    
  case 'index-url':
    await requestIndexing(arg);
    break;
    
  case 'bulk-index':
    await bulkIndexUrls(arg);
    break;
    
  case 'top-queries':
    await getTopQueries(parseInt(arg) || 50);
    break;
    
  default:
    console.log('\n📋 AVAILABLE COMMANDS:\n');
    console.log('  performance [days]          - Get performance data (default: 7 days)');
    console.log('  top-queries [limit]         - Get top search queries (default: 50)');
    console.log('  sitemaps                    - List all sitemaps');
    console.log('  submit-sitemap <url>        - Submit a new sitemap');
    console.log('  delete-sitemap <url>        - Delete a sitemap');
    console.log('  index-url <url>             - Request indexing for a URL');
    console.log('  bulk-index <file>           - Index multiple URLs from file');
    console.log('');
    console.log('📚 EXAMPLES:\n');
    console.log('  node scripts/seo-actions.mjs performance');
    console.log('  node scripts/seo-actions.mjs performance 30');
    console.log('  node scripts/seo-actions.mjs top-queries 100');
    console.log('  node scripts/seo-actions.mjs sitemaps');
    console.log('  node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap.xml');
    console.log('  node scripts/seo-actions.mjs index-url https://saboarena.com/new-page');
    console.log('  node scripts/seo-actions.mjs bulk-index urls.txt');
    console.log('');
}

console.log('═══════════════════════════════════════════════════════════════════');
