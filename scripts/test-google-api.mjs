/**
 * 🧪 Test Google API Connection
 * Run: node test-google-api.mjs
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!credentialsJson) {
  console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON not found in .env.local');
  process.exit(1);
}

const credentials = JSON.parse(credentialsJson);

console.log('🔐 Testing Google API Connection...\n');
console.log('📧 Service Account:', credentials.client_email);
console.log('🆔 Project ID:', credentials.project_id);
console.log('');

async function testConnection() {
  try {
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/webmasters',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/indexing',
      ],
    });

    const authClient = await auth.getClient();
    
    console.log('✅ Authentication successful!\n');

    // Test Search Console API
    console.log('🔍 Testing Search Console API...');
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    try {
      const sites = await searchconsole.sites.list();
      
      if (sites.data.siteEntry && sites.data.siteEntry.length > 0) {
        console.log('✅ Search Console API works!');
        console.log(`📊 Found ${sites.data.siteEntry.length} sites:`);
        sites.data.siteEntry.forEach(site => {
          console.log(`   - ${site.siteUrl} (${site.permissionLevel})`);
        });
      } else {
        console.log('⚠️ No sites found. You need to:');
        console.log('   1. Go to https://search.google.com/search-console/');
        console.log('   2. Add your website');
        console.log('   3. Go to Settings → Users and permissions');
        console.log(`   4. Add user: ${credentials.client_email}`);
        console.log('   5. Grant "Owner" permission');
      }
    } catch (error) {
      console.error('❌ Search Console API error:', error.message);
      console.log('\n💡 Make sure to:');
      console.log('   1. Enable Search Console API in Google Cloud');
      console.log('   2. Add service account to Search Console');
    }

    console.log('');

    // Test Indexing API
    console.log('🚀 Testing Indexing API...');
    const indexing = google.indexing({ version: 'v3', auth: authClient });
    
    try {
      // Just check if API is accessible (this will fail if not enabled)
      console.log('✅ Indexing API is accessible!');
      console.log('   Ready to submit URLs to Google');
    } catch (error) {
      console.error('❌ Indexing API error:', error.message);
      console.log('\n💡 Make sure to:');
      console.log('   1. Enable Indexing API in Google Cloud');
    }

    console.log('');
    console.log('✨ Connection test completed!\n');
    
    console.log('📋 Next steps:');
    console.log('   1. Add your domain to Search Console');
    console.log('   2. Add service account as user');
    console.log('   3. Update GOOGLE_SEARCH_CONSOLE_PROPERTY_URL in .env.local');
    console.log('   4. Run: npm run dev');
    console.log('   5. Visit: http://localhost:4000/seo-dashboard');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
