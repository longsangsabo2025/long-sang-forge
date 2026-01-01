-- Project Showcase Enhancements
-- Add new fields for better portfolio presentation

-- Add new columns
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS my_role TEXT DEFAULT 'Full-stack Developer';
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;
ALTER TABLE project_showcase ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN project_showcase.video_url IS 'Demo video URL (YouTube, Vimeo)';
COMMENT ON COLUMN project_showcase.github_url IS 'GitHub repository URL';
COMMENT ON COLUMN project_showcase.my_role IS 'Your role in the project (Lead Dev, PM, etc.)';
COMMENT ON COLUMN project_showcase.start_date IS 'Project start date';
COMMENT ON COLUMN project_showcase.end_date IS 'Project end date (null if ongoing)';
COMMENT ON COLUMN project_showcase.team_size IS 'Number of team members';
COMMENT ON COLUMN project_showcase.is_active IS 'Whether project is shown on portfolio';

-- Create index for is_active
CREATE INDEX IF NOT EXISTS idx_project_showcase_is_active ON project_showcase(is_active);
