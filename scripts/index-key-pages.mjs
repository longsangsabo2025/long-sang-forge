/**
 * 🚀 Index SABO ARENA Key Pages
 * Submit important pages to Google for instant indexing
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

const KEY_PAGES = [
  'https://saboarena.com/',
  'https://saboarena.com/tournaments',
  'https://saboarena.com/players',
  'https://saboarena.com/games',
  'https://saboarena.com/about',
  'https://saboarena.com/contact',
];

async function indexKeyPages() {
  console.log('🚀 INDEXING SABO ARENA KEY PAGES...\n');
  console.log(`📋 Total pages to index: ${KEY_PAGES.length}\n`);
  
  try {
    // Auth
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not found in .env.local');
    }
    
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const authClient = await auth.getClient();
    const indexing = google.indexing({ version: 'v3', auth: authClient });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < KEY_PAGES.length; i++) {
      const url = KEY_PAGES[i];
      
      try {
        await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED',
          },
        });
        
        console.log(`✅ [${i + 1}/${KEY_PAGES.length}] ${url}`);
        successCount++;
        
        // Rate limiting: 1 request per second
        if (i < KEY_PAGES.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.log(`❌ [${i + 1}/${KEY_PAGES.length}] ${url} - ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 INDEXING RESULTS:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed:  ${failCount}`);
    console.log(`   📝 Total:   ${KEY_PAGES.length}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('💡 WHAT HAPPENS NEXT:');
    console.log('   • Google will crawl these pages within 2-4 hours');
    console.log('   • Check status: node scripts/seo-actions.mjs performance');
    console.log('   • Monitor: Google Search Console → Coverage report');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

indexKeyPages();
