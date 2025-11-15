-- ================================================
-- UPDATE RLS POLICIES FOR PRODUCTION
-- ================================================
-- This migration removes dev-only anon access and enforces authentication

-- ================================================
-- DROP DEV POLICIES (if they exist)
-- ================================================

DROP POLICY IF EXISTS "Allow anon to read ai_agents for dev" ON public.ai_agents;
DROP POLICY IF EXISTS "Allow anon to read automation_triggers for dev" ON public.automation_triggers;
DROP POLICY IF EXISTS "Allow anon to read workflows for dev" ON public.workflows;
DROP POLICY IF EXISTS "Allow anon to read activity_logs for dev" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow anon to read content_queue for dev" ON public.content_queue;

-- ================================================
-- AI AGENTS - Production Policies
-- ================================================

-- Only authenticated users can view their agents
-- In future, you can add user_id to agents table for multi-tenancy
DROP POLICY IF EXISTS "Authenticated users can view ai_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can insert ai_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can update ai_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "Authenticated users can delete ai_agents" ON public.ai_agents;

CREATE POLICY "Authenticated users can view all agents"
ON public.ai_agents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create agents"
ON public.ai_agents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update agents"
ON public.ai_agents FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete agents"
ON public.ai_agents FOR DELETE
TO authenticated
USING (true);

-- ================================================
-- AUTOMATION TRIGGERS - Production Policies
-- ================================================

DROP POLICY IF EXISTS "Authenticated users can manage automation_triggers" ON public.automation_triggers;

CREATE POLICY "Authenticated users can view triggers"
ON public.automation_triggers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create triggers"
ON public.automation_triggers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update triggers"
ON public.automation_triggers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete triggers"
ON public.automation_triggers FOR DELETE
TO authenticated
USING (true);

-- ================================================
-- WORKFLOWS - Production Policies
-- ================================================

DROP POLICY IF EXISTS "Authenticated users can manage workflows" ON public.workflows;

CREATE POLICY "Authenticated users can view workflows"
ON public.workflows FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create workflows"
ON public.workflows FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflows"
ON public.workflows FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflows"
ON public.workflows FOR DELETE
TO authenticated
USING (true);

-- ================================================
-- ACTIVITY LOGS - Production Policies
-- ================================================

DROP POLICY IF EXISTS "Authenticated users can view activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity_logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can view activity logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (true);

-- Allow service role to insert logs (from Edge Functions)
CREATE POLICY "Service role can insert logs"
ON public.activity_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert logs (from client workflows)
CREATE POLICY "Authenticated users can create logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ================================================
-- CONTENT QUEUE - Production Policies
-- ================================================

DROP POLICY IF EXISTS "Authenticated users can manage content_queue" ON public.content_queue;

CREATE POLICY "Authenticated users can view content queue"
ON public.content_queue FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create content"
ON public.content_queue FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Service role can create content"
ON public.content_queue FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Authenticated users can update content"
ON public.content_queue FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can update content"
ON public.content_queue FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete content"
ON public.content_queue FOR DELETE
TO authenticated
USING (true);

-- ================================================
-- HELPER FUNCTIONS FOR STATS
-- ================================================

-- Function to increment agent run counts (for Edge Functions)
CREATE OR REPLACE FUNCTION public.increment_agent_runs(
  agent_id UUID,
  success BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF success THEN
    UPDATE ai_agents
    SET 
      total_runs = total_runs + 1,
      successful_runs = successful_runs + 1,
      last_run = NOW()
    WHERE id = agent_id;
  ELSE
    UPDATE ai_agents
    SET 
      total_runs = total_runs + 1,
      last_run = NOW()
    WHERE id = agent_id;
  END IF;
END;
$$;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON POLICY "Authenticated users can view all agents" ON public.ai_agents IS 
'Production policy: Only authenticated users can access automation features';

COMMENT ON FUNCTION public.increment_agent_runs IS 
'Helper function for Edge Functions to update agent statistics';
