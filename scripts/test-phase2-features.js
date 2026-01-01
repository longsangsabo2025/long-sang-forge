import pg from 'pg';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function test() {
  await client.connect();
  console.log('Connected!\n');
  
  const userId = process.env.BRAIN_USER_ID || '89917901-cf15-45c4-a7ad-8c4c9513347e';
  const domainId = 'b4717470-4fb9-4991-a486-64d9ec62ca27';
  
  // Test get_domain_agent_context
  console.log('📋 Testing get_domain_agent_context function...');
  try {
    const { rows: context } = await client.query('SELECT * FROM get_domain_agent_context($1, $2)', [userId, domainId]);
    console.log('✅ Agent Context:', JSON.stringify(context[0], null, 2));
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  // Test query history logging
  console.log('\n📝 Testing insert_query_history...');
  try {
    await client.query(`
      INSERT INTO brain_query_history (user_id, domain_ids, query, response, latency_ms)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, [domainId], 'What is clean code?', 'Clean code is readable...', 150]);
    console.log('✅ Query history inserted');
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  // Check updated stats after query history
  console.log('\n📊 Checking updated domain stats...');
  try {
    await client.query('SELECT update_domain_stats($1)', [domainId]);
    const { rows } = await client.query('SELECT total_queries, last_query_at FROM brain_domain_stats WHERE domain_id = $1', [domainId]);
    console.log('✅ Stats:', rows[0]);
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  // Test summary table
  console.log('\n📋 Testing brain tables summary...');
  try {
    const { rows: tables } = await client.query(`
      SELECT relname as table_name, n_tup_ins as inserts
      FROM pg_stat_user_tables 
      WHERE relname LIKE 'brain_%'
      ORDER BY relname
    `);
    console.log('✅ Brain tables:');
    tables.forEach(t => console.log(`   - ${t.table_name}: ${t.inserts} inserts`));
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  await client.end();
  console.log('\n🎉 Phase 2 testing complete!');
}

test();
