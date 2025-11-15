-- Add category field to ai_agents table for organizing agents by purpose
ALTER TABLE ai_agents 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'website';

-- Add comment
COMMENT ON COLUMN ai_agents.category IS 'Agent category: website, ecommerce, crm, marketing, etc.';

-- Update existing agents to have proper category
UPDATE ai_agents 
SET category = 'website' 
WHERE type IN ('content_writer', 'lead_nurture', 'social_media', 'analytics');

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_ai_agents_category ON ai_agents(category);
