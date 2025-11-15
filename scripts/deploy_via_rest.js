const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY';

async function deployViaRestAPI() {
  console.log('🚀 DEPLOYING via Supabase REST API...\n');
  
  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251114000001_academy_foundation_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded');
    console.log('📏 Size:', (sql.length / 1024).toFixed(2), 'KB\n');
    
    // Try using Supabase REST API query endpoint
    console.log('Attempting REST API query...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });
    
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    if (response.ok) {
      console.log('\n✅ Deployment successful!');
    } else {
      console.log('\n❌ Deployment failed');
      
      // Show manual instructions
      console.log('\n📝 MANUAL DEPLOYMENT REQUIRED:');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy content from: supabase/migrations/20251114000001_academy_foundation_tables.sql');
      console.log('4. Paste and click "Run"');
      console.log('\nOr use this command:');
      console.log('supabase db push --linked');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    console.log('\n📝 MANUAL DEPLOYMENT REQUIRED:');
    console.log('1. Open: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql');
    console.log('2. Copy: supabase/migrations/20251114000001_academy_foundation_tables.sql');
    console.log('3. Paste and Run');
  }
}

deployViaRestAPI();
