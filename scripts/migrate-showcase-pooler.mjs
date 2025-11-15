import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Supabase Transaction Pooler connection
const connectionString = `postgresql://postgres.diexsbzqwsbpilsymnfb:${process.env.SUPABASE_DB_PASSWORD}@aws-1-us-east-2.pooler.supabase.com:6543/postgres`;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  console.log('🚀 Running Multi-Project Migration via Transaction Pooler...');
  
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    console.log('✅ Transaction started');

    // Add slug column
    console.log('📝 Adding slug column...');
    await client.query(`
      ALTER TABLE app_showcase 
      ADD COLUMN IF NOT EXISTS slug TEXT
    `);
    console.log('✅ Added slug column');

    // Add icon column
    console.log('📝 Adding icon column...');
    await client.query(`
      ALTER TABLE app_showcase 
      ADD COLUMN IF NOT EXISTS icon TEXT
    `);
    console.log('✅ Added icon column');

    // Add production_url column
    console.log('📝 Adding production_url column...');
    await client.query(`
      ALTER TABLE app_showcase 
      ADD COLUMN IF NOT EXISTS production_url TEXT
    `);
    console.log('✅ Added production_url column');

    // Create unique index
    console.log('📝 Creating unique index on slug...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_app_showcase_slug 
      ON app_showcase(slug)
    `);
    console.log('✅ Created unique index');

    // Update sabo-arena
    console.log('📝 Updating sabo-arena record...');
    const updateResult = await client.query(`
      UPDATE app_showcase 
      SET 
        slug = 'sabo-arena',
        icon = '🎱',
        production_url = 'https://longsang.org'
      WHERE app_id = 'sabo-arena'
      RETURNING app_id, app_name, slug, icon, production_url
    `);
    console.log('✅ Updated sabo-arena:', updateResult.rows[0]);

    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully!');

    // Verify results
    console.log('\n🔍 Verifying all changes...');
    const verifyResult = await client.query(`
      SELECT app_id, app_name, slug, icon, production_url, status
      FROM app_showcase
      WHERE app_id = 'sabo-arena'
    `);
    
    console.log('\n📊 Final Result:');
    console.table(verifyResult.rows);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ You can now test:');
    console.log('   - /app-showcase → List all projects');
    console.log('   - /app-showcase/sabo-arena → SABO Arena detail');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
