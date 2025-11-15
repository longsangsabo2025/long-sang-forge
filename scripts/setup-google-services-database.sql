-- ================================================
-- GOOGLE SERVICES HUB - DATABASE SCHEMA
-- ================================================

-- Google Services Configuration
CREATE TABLE IF NOT EXISTS google_services_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Analytics
  analytics_property_id TEXT,
  analytics_enabled BOOLEAN DEFAULT false,
  
  -- Sheets
  reporting_spreadsheet_id TEXT,
  sheets_auto_sync BOOLEAN DEFAULT true,
  
  -- Search Console
  search_console_enabled BOOLEAN DEFAULT false,
  
  -- Automation
  daily_sync_enabled BOOLEAN DEFAULT false,
  sync_time TIME DEFAULT '08:00:00',
  email_reports BOOLEAN DEFAULT false,
  report_recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Google Sync Logs
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

-- Google Reports Archive
CREATE TABLE IF NOT EXISTS google_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('analytics', 'seo', 'traffic', 'dashboard')),
  report_title TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  sheet_name TEXT,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  metrics JSONB, -- Store key metrics for quick access
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_google_config_user ON google_services_config(user_id);
CREATE INDEX idx_google_sync_logs_user ON google_sync_logs(user_id);
CREATE INDEX idx_google_sync_logs_service ON google_sync_logs(service);
CREATE INDEX idx_google_sync_logs_created ON google_sync_logs(created_at DESC);
CREATE INDEX idx_google_reports_user ON google_reports(user_id);
CREATE INDEX idx_google_reports_type ON google_reports(report_type);
CREATE INDEX idx_google_reports_created ON google_reports(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE google_services_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reports ENABLE ROW LEVEL SECURITY;

-- Config policies
CREATE POLICY "Users can view own Google config"
  ON google_services_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own Google config"
  ON google_services_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Google config"
  ON google_services_config FOR UPDATE
  USING (auth.uid() = user_id);

-- Sync logs policies
CREATE POLICY "Users can view own sync logs"
  ON google_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sync logs"
  ON google_sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync logs"
  ON google_sync_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON google_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
  ON google_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON google_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER google_config_updated_at
  BEFORE UPDATE ON google_services_config
  FOR EACH ROW
  EXECUTE FUNCTION update_google_config_updated_at();

-- Auto-set user_id on sync logs
CREATE OR REPLACE FUNCTION set_sync_log_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_log_set_user_id
  BEFORE INSERT ON google_sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_sync_log_user_id();

-- ================================================
-- GRANT PERMISSIONS
-- ================================================

GRANT ALL ON google_services_config TO authenticated;
GRANT ALL ON google_sync_logs TO authenticated;
GRANT ALL ON google_reports TO authenticated;
