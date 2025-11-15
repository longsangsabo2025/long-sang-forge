/**
 * Create Google Services tables via PostgreSQL pooler
 */

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres',
});

async function createGoogleServicesTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create google_services_config table
    await client.query(`
      CREATE TABLE IF NOT EXISTS google_services_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        
        analytics_property_id TEXT,
        analytics_enabled BOOLEAN DEFAULT false,
        
        reporting_spreadsheet_id TEXT,
        sheets_auto_sync BOOLEAN DEFAULT true,
        
        search_console_enabled BOOLEAN DEFAULT false,
        
        daily_sync_enabled BOOLEAN DEFAULT false,
        sync_time TIME DEFAULT '08:00:00',
        email_reports BOOLEAN DEFAULT false,
        report_recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        UNIQUE(user_id)
      );
    `);
    console.log('✅ google_services_config table created');

    // Create google_sync_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS google_sync_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        service TEXT NOT NULL CHECK (service IN ('analytics', 'sheets', 'search-console', 'calendar', 'drive')),
        status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running')),
        records_synced INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMPTZ NOT NULL,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ google_sync_logs table created');

    // Create google_reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS google_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        report_type TEXT NOT NULL CHECK (report_type IN ('analytics', 'seo', 'traffic', 'dashboard')),
        report_title TEXT NOT NULL,
        spreadsheet_id TEXT NOT NULL,
        sheet_name TEXT,
        date_range_start DATE NOT NULL,
        date_range_end DATE NOT NULL,
        metrics JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ google_reports table created');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_google_config_user ON google_services_config(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_google_sync_logs_user ON google_sync_logs(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_google_sync_logs_service ON google_sync_logs(service)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_google_sync_logs_created ON google_sync_logs(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_google_reports_user ON google_reports(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_google_reports_type ON google_reports(report_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_google_reports_created ON google_reports(created_at DESC)`);
    console.log('✅ Indexes created');

    // Enable RLS
    await client.query(`ALTER TABLE google_services_config ENABLE ROW LEVEL SECURITY`);
    await client.query(`ALTER TABLE google_sync_logs ENABLE ROW LEVEL SECURITY`);
    await client.query(`ALTER TABLE google_reports ENABLE ROW LEVEL SECURITY`);
    console.log('✅ RLS enabled');

    // Create RLS policies
    await client.query(`
      DROP POLICY IF EXISTS "Users can view own Google config" ON google_services_config;
      CREATE POLICY "Users can view own Google config"
        ON google_services_config FOR SELECT
        USING (auth.uid() = user_id);
    `);
    await client.query(`
      DROP POLICY IF EXISTS "Users can create own Google config" ON google_services_config;
      CREATE POLICY "Users can create own Google config"
        ON google_services_config FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `);
    await client.query(`
      DROP POLICY IF EXISTS "Users can update own Google config" ON google_services_config;
      CREATE POLICY "Users can update own Google config"
        ON google_services_config FOR UPDATE
        USING (auth.uid() = user_id);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can view own sync logs" ON google_sync_logs;
      CREATE POLICY "Users can view own sync logs"
        ON google_sync_logs FOR SELECT
        USING (auth.uid() = user_id);
    `);
    await client.query(`
      DROP POLICY IF EXISTS "Users can create sync logs" ON google_sync_logs;
      CREATE POLICY "Users can create sync logs"
        ON google_sync_logs FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `);
    await client.query(`
      DROP POLICY IF EXISTS "Users can update own sync logs" ON google_sync_logs;
      CREATE POLICY "Users can update own sync logs"
        ON google_sync_logs FOR UPDATE
        USING (auth.uid() = user_id);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can view own reports" ON google_reports;
      CREATE POLICY "Users can view own reports"
        ON google_reports FOR SELECT
        USING (auth.uid() = user_id);
    `);
    await client.query(`
      DROP POLICY IF EXISTS "Users can create reports" ON google_reports;
      CREATE POLICY "Users can create reports"
        ON google_reports FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `);
    await client.query(`
      DROP POLICY IF EXISTS "Users can delete own reports" ON google_reports;
      CREATE POLICY "Users can delete own reports"
        ON google_reports FOR DELETE
        USING (auth.uid() = user_id);
    `);
    console.log('✅ RLS policies created');

    // Create triggers
    await client.query(`
      CREATE OR REPLACE FUNCTION update_google_config_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS google_config_updated_at ON google_services_config;
      CREATE TRIGGER google_config_updated_at
        BEFORE UPDATE ON google_services_config
        FOR EACH ROW
        EXECUTE FUNCTION update_google_config_updated_at();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION set_sync_log_user_id()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.user_id IS NULL THEN
          NEW.user_id = auth.uid();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS sync_log_set_user_id ON google_sync_logs;
      CREATE TRIGGER sync_log_set_user_id
        BEFORE INSERT ON google_sync_logs
        FOR EACH ROW
        EXECUTE FUNCTION set_sync_log_user_id();
    `);
    console.log('✅ Triggers created');

    // Grant permissions
    await client.query(`GRANT ALL ON google_services_config TO authenticated`);
    await client.query(`GRANT ALL ON google_sync_logs TO authenticated`);
    await client.query(`GRANT ALL ON google_reports TO authenticated`);
    console.log('✅ Permissions granted');

    console.log('\n🎉 SUCCESS! Google Services tables created!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createGoogleServicesTables();
