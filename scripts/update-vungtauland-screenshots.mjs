import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = 'postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

async function updateScreenshots() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    console.log('🚀 Connecting...');
    await client.connect();
    
    // Real screenshots for Vungtauland - using Unsplash real estate images
    const realScreenshots = [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop'
    ];

    const result = await client.query(
      `UPDATE project_showcase 
       SET screenshots = $1::jsonb,
           updated_at = NOW()
       WHERE slug = 'vungtauland'
       RETURNING name, slug, screenshots`,
      [JSON.stringify(realScreenshots)]
    );

    if (result.rows.length > 0) {
      console.log('✅ Updated screenshots for:', result.rows[0].name);
      console.log('📸 New screenshots:');
      result.rows[0].screenshots.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url.substring(0, 60)}...`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Done.');
  }
}

updateScreenshots();
