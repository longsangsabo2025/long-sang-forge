import pg from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function check() {
  await client.connect();
  console.log('Checking database schema...\n');
  
  // Check columns in brain_query_history
  const { rows: cols } = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'brain_query_history'
    ORDER BY ordinal_position
  `);
  console.log('📋 brain_query_history columns:');
  cols.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));
  
  // Check functions
  const { rows: funcs } = await client.query(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name LIKE '%brain%' OR routine_name LIKE '%agent%' OR routine_name LIKE '%domain%'
  `);
  console.log('\n📋 Related functions:');
  funcs.forEach(f => console.log(`   - ${f.routine_name}`));
  
  await client.end();
}
check();
