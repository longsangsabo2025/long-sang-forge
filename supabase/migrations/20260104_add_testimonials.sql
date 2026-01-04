-- Add testimonials column to project_showcase
ALTER TABLE project_showcase 
ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN project_showcase.testimonials IS 'Array of testimonial objects: {name, role, content, rating, avatar}';
