-- ================================================
-- FIX RLS POLICIES FOR DEVELOPMENT MODE
-- ================================================
-- Allow both authenticated AND anon users to access automation tables
-- This enables dev mode (fake auth) to work properly

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view ai_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can insert ai_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can update ai_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can delete ai_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can manage automation_triggers" ON public.automation_triggers;
DROP POLICY IF EXISTS "Authenticated users can manage workflows" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated users can view activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can manage content_queue" ON public.content_queue;

-- Create new policies that allow both authenticated and anon users

-- AI Agents policies
CREATE POLICY "Allow all users to view ai_agents"
ON public.ai_agents FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow all users to insert ai_agents"
ON public.ai_agents FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Allow all users to update ai_agents"
ON public.ai_agents FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all users to delete ai_agents"
ON public.ai_agents FOR DELETE
TO authenticated, anon
USING (true);

-- Automation Triggers policies
CREATE POLICY "Allow all users to manage automation_triggers"
ON public.automation_triggers FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Workflows policies
CREATE POLICY "Allow all users to manage workflows"
ON public.workflows FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Activity Logs policies
CREATE POLICY "Allow all users to view activity_logs"
ON public.activity_logs FOR SELECT
TO authenticated, anon
USING (true);

-- Content Queue policies
CREATE POLICY "Allow all users to manage content_queue"
ON public.content_queue FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.ai_agents TO anon;
GRANT ALL ON public.automation_triggers TO anon;
GRANT ALL ON public.workflows TO anon;
GRANT ALL ON public.activity_logs TO anon;
GRANT ALL ON public.content_queue TO anon;

-- ================================================
-- VERIFICATION
-- ================================================

-- This allows both:
-- 1. Real authenticated users (production)
-- 2. Anonymous users (dev mode with fake auth)
