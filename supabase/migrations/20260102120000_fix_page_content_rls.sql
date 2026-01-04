-- Migration to fix page_content RLS policies
-- Run this in Supabase Dashboard SQL Editor

-- Drop existing policies  
DROP POLICY IF EXISTS "public_read" ON page_content;
DROP POLICY IF EXISTS "auth_write" ON page_content;  
DROP POLICY IF EXISTS "auth_update" ON page_content;
DROP POLICY IF EXISTS "public_read_v2" ON page_content;
DROP POLICY IF EXISTS "auth_insert_v2" ON page_content;
DROP POLICY IF EXISTS "auth_update_v2" ON page_content;
DROP POLICY IF EXISTS "auth_delete_v2" ON page_content;

-- Create new permissive policies
-- Anyone can read (for public pages)
CREATE POLICY "page_content_select" 
ON page_content FOR SELECT 
USING (true);

-- Authenticated users can insert
CREATE POLICY "page_content_insert" 
ON page_content FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "page_content_update" 
ON page_content FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete
CREATE POLICY "page_content_delete" 
ON page_content FOR DELETE 
TO authenticated
USING (true);

-- Grant permissions
GRANT SELECT ON page_content TO anon;
GRANT ALL ON page_content TO authenticated;
