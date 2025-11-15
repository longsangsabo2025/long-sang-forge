-- ============================================
-- DISABLE ALL RLS FOR DEVELOPMENT
-- Fast development mode - remove all restrictions
-- ============================================

-- Disable RLS on agents table
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon select agents" ON agents;
DROP POLICY IF EXISTS "Allow anon insert agents" ON agents;
DROP POLICY IF EXISTS "Allow anon update agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated select agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated insert agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated update agents" ON agents;

-- Disable RLS on agent_executions table
ALTER TABLE agent_executions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon select executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow anon insert executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow anon update executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow authenticated select executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow authenticated insert executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow authenticated update executions" ON agent_executions;

-- Disable RLS on usage_tracking table
ALTER TABLE usage_tracking DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon select usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow anon insert usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow anon update usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow authenticated select usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow authenticated insert usage" ON usage_tracking;
DROP POLICY IF EXISTS "Allow authenticated update usage" ON usage_tracking;

-- Verify - should show 0 policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('agents', 'agent_executions', 'usage_tracking');
