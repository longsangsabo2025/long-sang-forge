-- Migration: Add display_type field for flexible mockup display
-- This allows admin to override auto-detection from category

ALTER TABLE public.project_showcase
ADD COLUMN
IF NOT EXISTS display_type VARCHAR
(20) DEFAULT NULL;

-- Enum-like constraint
ALTER TABLE public.project_showcase
ADD CONSTRAINT check_display_type
CHECK (display_type IS NULL OR display_type IN ('phone', 'browser', 'tablet', 'responsive'));

-- Comment for documentation
COMMENT ON COLUMN public.project_showcase.display_type IS
'Override mockup display type. If NULL, auto-detect from category. Options: phone, browser, tablet, responsive';

-- Update existing projects based on their category
UPDATE public.project_showcase
SET display_type = 'phone'
WHERE category
ILIKE '%mobile%'
  OR category ILIKE '%app%'
  AND display_type IS NULL;

UPDATE public.project_showcase
SET display_type = 'browser'
WHERE (category
ILIKE '%web%'
  OR category ILIKE '%platform%'
  OR category ILIKE '%website%')
  AND display_type IS NULL;
