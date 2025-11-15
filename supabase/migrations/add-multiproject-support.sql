-- ================================================
-- Multi-Project Support for App Showcase
-- Run this in Supabase SQL Editor
-- ================================================

-- Add new columns to app_showcase table
ALTER TABLE app_showcase 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS production_url TEXT;

-- Create unique index on slug (for URL routing)
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_showcase_slug ON app_showcase(slug);

-- Update existing sabo-arena data with new fields
UPDATE app_showcase 
SET 
  slug = 'sabo-arena',
  icon = '🎱',
  production_url = 'https://longsang.org'
WHERE app_id = 'sabo-arena';

-- Verify the update
SELECT app_id, app_name, slug, icon, production_url, status
FROM app_showcase
WHERE app_id = 'sabo-arena';
