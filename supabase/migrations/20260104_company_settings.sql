-- =============================================
-- TABLE: company_settings
-- Lưu trữ thông tin động của công ty
-- AI chatbot sẽ query real-time từ bảng này
-- =============================================

-- Create table if not exists
CREATE TABLE
IF NOT EXISTS company_settings
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_by UUID
);

-- Indexes for quick lookup
CREATE INDEX
IF NOT EXISTS idx_company_settings_key ON company_settings
(key);
CREATE INDEX
IF NOT EXISTS idx_company_settings_category ON company_settings
(category);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY
IF EXISTS "Public settings readable by all" ON company_settings;
DROP POLICY
IF EXISTS "Service role full access" ON company_settings;

-- Everyone can read public settings
CREATE POLICY "Public settings readable by all" ON company_settings
  FOR
SELECT USING (is_public = true);

-- Service role can do everything
CREATE POLICY "Service role full access" ON company_settings
  FOR ALL USING
(true);

-- Trigger for auto-update timestamp
CREATE OR REPLACE FUNCTION update_company_settings_timestamp
()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS company_settings_updated_at
ON company_settings;
CREATE TRIGGER company_settings_updated_at
  BEFORE
UPDATE ON company_settings
  FOR EACH ROW
EXECUTE FUNCTION update_company_settings_timestamp
();

-- =============================================
-- Helper function: get_company_setting(key)
-- Để AI chatbot query nhanh 1 setting
-- =============================================
CREATE OR REPLACE FUNCTION get_company_setting
(p_key TEXT)
RETURNS JSONB AS $$
SELECT value
FROM company_settings
WHERE key = p_key AND is_public = true
LIMIT 1;
$$ LANGUAGE sql STABLE;

-- =============================================
-- Helper function: get_company_settings_by_category(category)
-- Để AI chatbot query tất cả settings theo category
-- =============================================
CREATE OR REPLACE FUNCTION get_company_settings_by_category
(p_category TEXT)
RETURNS TABLE
(key TEXT, value JSONB) AS $$
SELECT key, value
FROM company_settings
WHERE category = p_category AND is_public = true
ORDER BY key;
$$ LANGUAGE sql STABLE;

-- =============================================
-- Helper function: get_all_pricing()
-- Query tất cả bảng giá
-- =============================================
CREATE OR REPLACE FUNCTION get_all_pricing
()
RETURNS TABLE
(service_name TEXT, price_display TEXT, timeline TEXT, details JSONB) AS $$
SELECT
  value->>'name' as service_name,
  value->>'price_display' as price_display,
  value->>'timeline' as timeline,
  value as details
FROM company_settings
WHERE category = 'pricing' AND is_public = true
ORDER BY (value->>'price_from')
::numeric;
$$ LANGUAGE sql STABLE;

-- =============================================
-- Helper function: get_current_promotion()
-- Query khuyến mãi hiện tại
-- =============================================
CREATE OR REPLACE FUNCTION get_current_promotion
()
RETURNS JSONB AS $$
SELECT value
FROM company_settings
WHERE key = 'current_promotion'
  AND is_public = true
  AND (value->>'active')
::boolean = true
  AND
(value->>'valid_until')::date >= CURRENT_DATE
  LIMIT 1;
$$ LANGUAGE sql STABLE;
