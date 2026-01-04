-- ============================================================================
-- Page Content Table for Admin Edit Tool
-- Stores editable content (images, texts) for each page
-- ============================================================================

-- Create the table
CREATE TABLE
IF NOT EXISTS page_content
(
    page_id TEXT PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{"images": {}, "texts": {}, "styles": {}}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW
(),
    updated_by UUID REFERENCES auth.users
(id)
);

-- Add comment
COMMENT ON TABLE page_content IS 'Stores admin-editable content for each page (images, texts, styles)';

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (public pages need to show content)
CREATE POLICY "Anyone can read page content"
    ON page_content FOR
SELECT
  USING (true);

-- Policy: Only admins can insert/update
CREATE POLICY "Admins can insert page content"
    ON page_content FOR
INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
  (
  EXISTS
(
  SELECT 1 F
WHERE id = auth.uid()
  AND raw_user_meta_data->>'role' = 'admin'
            )
OR auth.jwt
()->>'email' IN
('longsangadmin@gmail.com', 'longsangsabo@gmail.com')
        )
    );

CREATE POLICY "Admins can update page content"
    ON page_content FOR
UPDATE
    USING (
        auth.uid()
IS NOT NULL AND
(
            EXISTS
(
                SELECT 1
FROM auth.users
WHERE id = auth.uid()
  AND raw_user_meta_data->>'role' = 'admin'
            )
OR auth.jwt
()->>'email' IN
('longsangadmin@gmail.com', 'longsangsabo@gmail.com')
        )
    );

-- Create index for faster lookups
CREATE INDEX
IF NOT EXISTS idx_page_content_page_id ON page_content
(page_id);

-- Grant permissions
GRANT SELECT ON page_content TO anon;
GRANT SELECT, INSERT, UPDATE ON page_content TO authenticated;
