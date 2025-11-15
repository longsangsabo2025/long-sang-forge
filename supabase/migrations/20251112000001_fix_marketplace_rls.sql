-- ============================================
-- FIX RLS FOR AI MARKETPLACE
-- Allow demo/anonymous users to use marketplace
-- ============================================

-- ==================== AGENTS TABLE ====================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anon select agents" ON agents;
DROP POLICY IF EXISTS "Allow anon insert agents" ON agents;
DROP POLICY IF EXISTS "Allow anon update agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated select agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated insert agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated update agents" ON agents;

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (demo) users to SELECT agents
CREATE POLICY "Allow anon select agents" ON agents
FOR SELECT TO anon
USING (true);

-- Allow anonymous (demo) users to INSERT agents
CREATE POLICY "Allow anon insert agents" ON agents
FOR INSERT TO anon
WITH CHECK (true);

-- Allow anonymous (demo) users to UPDATE agents
CREATE POLICY "Allow anon update agents" ON agents
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Allow authenticated users to SELECT agents
CREATE POLICY "Allow authenticated select agents" ON agents
FOR SELECT TO authenticated
USING (true);

-- Allow authenticated users to INSERT agents
CREATE POLICY "Allow authenticated insert agents" ON agents
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated users to UPDATE agents
CREATE POLICY "Allow authenticated update agents" ON agents
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- ==================== AGENT_EXECUTIONS TABLE ====================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anon select executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow anon insert executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow anon update executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow authenticated select executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow authenticated insert executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow authenticated update executions" ON agent_executions;

-- Enable RLS
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (demo) users full access
CREATE POLICY "Allow anon select executions" ON agent_executions
FOR SELECT TO anon
USING (true);

CREATE POLICY "Allow anon insert executions" ON agent_executions
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon update executions" ON agent_executions
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated select executions" ON agent_executions
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert executions" ON agent_executions
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update executions" ON agent_executions
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- ==================== USAGE_TRACKING TABLE ====================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anon select usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow anon insert usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow anon update usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow authenticated select usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow authenticated insert usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow authenticated update usage" ON usage_tracking;

-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (demo) users full access
CREATE POLICY "Allow anon select usage" ON usage_tracking
FOR SELECT TO anon
USING (true);

CREATE POLICY "Allow anon insert usage" ON usage_tracking
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon update usage" ON usage_tracking
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated select usage" ON usage_tracking
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert usage" ON usage_tracking
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update usage" ON usage_tracking
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- ==================== VERIFY ====================

-- Show all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('agents', 'agent_executions', 'usage_tracking')
ORDER BY tablename, policyname;
