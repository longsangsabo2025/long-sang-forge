-- Fix RLS Policy for App Showcase
-- Allow anonymous users to INSERT (for admin without auth)

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert apps" ON app_showcase;

-- Create new policy allowing inserts for authenticated OR service role
CREATE POLICY "Allow insert for authenticated and service role"
ON app_showcase
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- Also allow anon to insert (temporary, for development)
CREATE POLICY "Allow anon insert for development"
ON app_showcase
FOR INSERT
TO anon
WITH CHECK (true);

-- Update policy to allow anon to update
DROP POLICY IF EXISTS "Authenticated users can update apps" ON app_showcase;

CREATE POLICY "Allow update for authenticated and anon"
ON app_showcase
FOR UPDATE
TO authenticated, anon, service_role
USING (true)
WITH CHECK (true);
