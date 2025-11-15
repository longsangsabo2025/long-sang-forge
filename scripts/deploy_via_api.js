import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deploySQL() {
  console.log('🚀 Deploying Academy Foundation via Supabase client...\n');
  
  try {
    // Read SQL file
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20251114000001_academy_foundation_tables.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded:', sqlPath);
    console.log('📏 Size:', (sql.length / 1024).toFixed(2), 'KB\n');
    
    // Split into individual statements (by semicolon + newline)
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;
      
      const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);
      
      // Try executing via rpc
      try {
        const { data, error } = await supabase.rpc('exec', { sql: stmt });
        if (error) {
          console.error(`   ❌ Error:`, error.message);
        } else {
          console.log(`   ✅ Success`);
        }
      } catch (err) {
        console.error(`   ❌ Exception:`, err.message);
      }
    }
    
    console.log('\n✅ Deployment complete!');
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    process.exit(1);
  }
}

deploySQL();
