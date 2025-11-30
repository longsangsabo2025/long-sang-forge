import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    const sqlPath = path.join(__dirname, '..', 'supabase/migrations/brain/004_fix_domain_stats.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Applying fix for update_domain_stats function...');
    await client.query(sql);
    console.log('✅ Function fixed successfully!');
    
    // Test the function
    console.log('\nTesting function...');
    const testDomainId = 'b4717470-4fb9-4991-a486-64d9ec62ca27';
    await client.query('SELECT update_domain_stats($1)', [testDomainId]);
    console.log('✅ Function works!');
    
    // Check stats
    const { rows } = await client.query('SELECT * FROM brain_domain_stats WHERE domain_id = $1', [testDomainId]);
    console.log('\n📊 Domain Stats:', JSON.stringify(rows[0], null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
