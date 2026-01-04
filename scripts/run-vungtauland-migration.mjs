import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

const DATABASE_URL = 'postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    console.log('🚀 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read migration SQL
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260102_add_vungtauland_showcase.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Running Vungtauland migration...');
    await client.query(sql);
    console.log('✅ Migration executed!\n');

    // Verify
    const result = await client.query(`
      SELECT name, slug, status, progress, category 
      FROM project_showcase 
      WHERE slug = 'vungtauland'
    `);

    if (result.rows.length > 0) {
      console.log('📊 Verification - Vungtauland added:');
      console.table(result.rows);
    } else {
      console.log('⚠️ Warning: Vungtauland not found after migration');
    }

    // Show all projects
    const allProjects = await client.query(`
      SELECT name, slug, status, progress 
      FROM project_showcase 
      ORDER BY display_order
    `);
    console.log('\n📋 All Project Showcases:');
    console.table(allProjects.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

runMigration();
