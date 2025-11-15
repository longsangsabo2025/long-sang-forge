-- ================================================
-- PERSONAL AUTOMATION HUB - DATABASE SCHEMA
-- ================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- AI Agents Table
-- ================================================
CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'content_writer', 'lead_nurture', 'social_media', 'analytics'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'error'
  description TEXT,
  config JSONB DEFAULT '{}'::jsonb, -- agent-specific settings (AI model, prompts, etc.)
  last_run TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Automation Triggers Table
-- ================================================
CREATE TABLE public.automation_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  trigger_type VARCHAR(100) NOT NULL, -- 'database', 'schedule', 'webhook', 'manual'
  trigger_config JSONB DEFAULT '{}'::jsonb, -- trigger-specific configuration
  enabled BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Workflows Table
-- ================================================
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of workflow steps
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'error'
  last_execution TIMESTAMP WITH TIME ZONE,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Activity Logs Table
-- ================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL, -- 'success', 'error', 'warning', 'info'
  error_message TEXT,
  duration_ms INTEGER, -- execution duration in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Content Queue Table
-- ================================================
CREATE TABLE public.content_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  content_type VARCHAR(100) NOT NULL, -- 'blog_post', 'email', 'social_post', 'report'
  title VARCHAR(500),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb, -- additional metadata (tags, categories, etc.)
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'published', 'failed', 'scheduled'
  priority INTEGER DEFAULT 5, -- 1-10, higher = more priority
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES for Performance
-- ================================================

-- AI Agents indexes
CREATE INDEX idx_ai_agents_status ON public.ai_agents(status);
CREATE INDEX idx_ai_agents_type ON public.ai_agents(type);
CREATE INDEX idx_ai_agents_last_run ON public.ai_agents(last_run DESC);

-- Automation Triggers indexes
CREATE INDEX idx_automation_triggers_agent_id ON public.automation_triggers(agent_id);
CREATE INDEX idx_automation_triggers_enabled ON public.automation_triggers(enabled);
CREATE INDEX idx_automation_triggers_type ON public.automation_triggers(trigger_type);

-- Workflows indexes
CREATE INDEX idx_workflows_agent_id ON public.workflows(agent_id);
CREATE INDEX idx_workflows_status ON public.workflows(status);
CREATE INDEX idx_workflows_last_execution ON public.workflows(last_execution DESC);

-- Activity Logs indexes
CREATE INDEX idx_activity_logs_agent_id ON public.activity_logs(agent_id);
CREATE INDEX idx_activity_logs_workflow_id ON public.activity_logs(workflow_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_status ON public.activity_logs(status);

-- Content Queue indexes
CREATE INDEX idx_content_queue_agent_id ON public.content_queue(agent_id);
CREATE INDEX idx_content_queue_status ON public.content_queue(status);
CREATE INDEX idx_content_queue_scheduled_for ON public.content_queue(scheduled_for);
CREATE INDEX idx_content_queue_priority ON public.content_queue(priority DESC);
CREATE INDEX idx_content_queue_created_at ON public.content_queue(created_at DESC);

-- ================================================
-- UPDATE TIMESTAMP FUNCTIONS
-- ================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_automation_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_automation_updated_at();

CREATE TRIGGER update_automation_triggers_updated_at
BEFORE UPDATE ON public.automation_triggers
FOR EACH ROW
EXECUTE FUNCTION public.update_automation_updated_at();

CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_automation_updated_at();

CREATE TRIGGER update_content_queue_updated_at
BEFORE UPDATE ON public.content_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_automation_updated_at();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;

-- Policies: Only authenticated users can access automation tables
CREATE POLICY "Authenticated users can view ai_agents"
ON public.ai_agents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert ai_agents"
ON public.ai_agents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update ai_agents"
ON public.ai_agents FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete ai_agents"
ON public.ai_agents FOR DELETE
TO authenticated
USING (true);

-- Automation Triggers policies
CREATE POLICY "Authenticated users can manage automation_triggers"
ON public.automation_triggers FOR ALL
TO authenticated
USING (true);

-- Workflows policies
CREATE POLICY "Authenticated users can manage workflows"
ON public.workflows FOR ALL
TO authenticated
USING (true);

-- Activity Logs policies (read-only for most, insert for system)
CREATE POLICY "Authenticated users can view activity_logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert activity_logs"
ON public.activity_logs FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Content Queue policies
CREATE POLICY "Authenticated users can manage content_queue"
ON public.content_queue FOR ALL
TO authenticated
USING (true);

-- ================================================
-- TABLE COMMENTS
-- ================================================

COMMENT ON TABLE public.ai_agents IS 'AI automation agents configuration and status';
COMMENT ON TABLE public.automation_triggers IS 'Trigger definitions for automation agents';
COMMENT ON TABLE public.workflows IS 'Workflow definitions and execution tracking';
COMMENT ON TABLE public.activity_logs IS 'Activity logs for all automation actions';
COMMENT ON TABLE public.content_queue IS 'Queue for content to be published or processed';
