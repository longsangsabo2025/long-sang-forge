-- Add new columns to app_showcase table for multi-project support

-- Add slug column (URL-friendly identifier)
ALTER TABLE app_showcase ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add icon column (emoji or icon for card preview)
ALTER TABLE app_showcase ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add production_url column
ALTER TABLE app_showcase ADD COLUMN IF NOT EXISTS production_url TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_showcase_slug ON app_showcase(slug);

-- Update existing data to have slug = app_id if slug is null
UPDATE app_showcase SET slug = app_id WHERE slug IS NULL;

-- Set default icon for existing records
UPDATE app_showcase SET icon = '🎮' WHERE icon IS NULL OR icon = '';

-- Comment for documentation
COMMENT ON COLUMN app_showcase.slug IS 'URL-friendly identifier for the app (e.g., sabo-arena, chrono-desk)';
COMMENT ON COLUMN app_showcase.icon IS 'Emoji or icon for card preview in the app list';
COMMENT ON COLUMN app_showcase.production_url IS 'Production URL of the deployed application';
