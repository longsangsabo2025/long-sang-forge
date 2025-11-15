-- ============================================
-- AI AGENT CENTER DATABASE SCHEMA
-- ============================================
-- Created: 2025-01-18
-- Purpose: Complete database schema for AI Agent Center
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'work', 'research', 'life', 'custom'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'error'
    description TEXT,
    capabilities JSONB DEFAULT '[]'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Performance metrics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10, 4) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    -- Ownership
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'error', 'maintenance'))
);

-- Indexes for agents
CREATE INDEX idx_agents_name ON public.agents(name);
CREATE INDEX idx_agents_type ON public.agents(type);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_created_by ON public.agents(created_by);

-- ============================================
-- WORKFLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'sequential', 'parallel', 'conditional', 'custom'
    description TEXT,
    
    -- Workflow definition
    definition JSONB NOT NULL, -- Workflow graph/steps definition
    agents_used UUID[] DEFAULT ARRAY[]::UUID[], -- Array of agent IDs
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'archived'
    is_template BOOLEAN DEFAULT false,
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Performance
    total_executions INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_executed_at TIMESTAMPTZ,
    
    -- Ownership
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_workflow_type CHECK (type IN ('sequential', 'parallel', 'conditional', 'pipeline', 'custom')),
    CONSTRAINT valid_workflow_status CHECK (status IN ('draft', 'active', 'archived'))
);

-- Indexes for workflows
CREATE INDEX idx_workflows_name ON public.workflows(name);
CREATE INDEX idx_workflows_type ON public.workflows(type);
CREATE INDEX idx_workflows_status ON public.workflows(status);
CREATE INDEX idx_workflows_created_by ON public.workflows(created_by);
CREATE INDEX idx_workflows_tags ON public.workflows USING GIN(tags);

-- ============================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    
    -- Execution details
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
    input_data JSONB NOT NULL,
    output_data JSONB,
    error_message TEXT,
    
    -- Execution metrics
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_time_ms INTEGER,
    cost_usd DECIMAL(10, 4) DEFAULT 0,
    
    -- Step tracking
    current_step VARCHAR(255),
    total_steps INTEGER,
    completed_steps INTEGER DEFAULT 0,
    
    -- Results
    intermediate_results JSONB DEFAULT '{}'::jsonb,
    final_result JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ownership
    executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_execution_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused'))
);

-- Indexes for workflow executions
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_workflow_executions_created_at ON public.workflow_executions(created_at DESC);
CREATE INDEX idx_workflow_executions_executed_by ON public.workflow_executions(executed_by);

-- ============================================
-- TOOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL, -- 'web_search', 'data_processing', etc.
    description TEXT NOT NULL,
    
    -- Tool details
    version VARCHAR(50) DEFAULT '1.0.0',
    author VARCHAR(255),
    requires_api_key BOOLEAN DEFAULT false,
    cost_per_use DECIMAL(10, 4) DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 1000,
    
    -- Configuration
    config_schema JSONB, -- JSON schema for tool configuration
    default_config JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Usage stats
    total_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    is_builtin BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    -- Ownership
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_tool_status CHECK (status IN ('active', 'inactive', 'deprecated'))
);

-- Indexes for tools
CREATE INDEX idx_tools_name ON public.tools(name);
CREATE INDEX idx_tools_category ON public.tools(category);
CREATE INDEX idx_tools_status ON public.tools(status);
CREATE INDEX idx_tools_tags ON public.tools USING GIN(tags);

-- ============================================
-- CREWS TABLE (CrewAI)
-- ============================================
CREATE TABLE IF NOT EXISTS public.crews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL, -- 'content_creator', 'data_analyst', etc.
    description TEXT,
    
    -- Crew configuration
    agents_config JSONB NOT NULL, -- Configuration for crew agents
    tasks_config JSONB NOT NULL, -- Tasks definition
    process_type VARCHAR(50) DEFAULT 'sequential', -- 'sequential', 'hierarchical'
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Performance
    total_executions INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_executed_at TIMESTAMPTZ,
    
    -- Ownership
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_crew_status CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Indexes for crews
CREATE INDEX idx_crews_name ON public.crews(name);
CREATE INDEX idx_crews_type ON public.crews(type);
CREATE INDEX idx_crews_status ON public.crews(status);

-- ============================================
-- EXECUTION LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
    
    -- Log details
    level VARCHAR(20) NOT NULL, -- 'debug', 'info', 'warning', 'error'
    message TEXT NOT NULL,
    agent_name VARCHAR(255),
    step_name VARCHAR(255),
    
    -- Additional data
    data JSONB,
    stack_trace TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_log_level CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- Indexes for execution logs
CREATE INDEX idx_execution_logs_execution_id ON public.execution_logs(execution_id);
CREATE INDEX idx_execution_logs_level ON public.execution_logs(level);
CREATE INDEX idx_execution_logs_created_at ON public.execution_logs(created_at DESC);

-- ============================================
-- ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'workflow_executed', 'agent_called', 'tool_used', etc.
    event_name VARCHAR(255) NOT NULL,
    
    -- Event data
    properties JSONB DEFAULT '{}'::jsonb,
    
    -- Metrics
    duration_ms INTEGER,
    cost_usd DECIMAL(10, 4),
    success BOOLEAN,
    
    -- Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
    execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Partitioning key (for future partitioning)
    event_date DATE DEFAULT CURRENT_DATE
);

-- Indexes for analytics
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_event_date ON public.analytics_events(event_date DESC);
CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at DESC);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Preferences
    default_llm_provider VARCHAR(50) DEFAULT 'openai',
    default_model VARCHAR(100) DEFAULT 'gpt-4o',
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Notifications
    email_notifications BOOLEAN DEFAULT true,
    workflow_notifications BOOLEAN DEFAULT true,
    
    -- API Keys (encrypted)
    api_keys JSONB DEFAULT '{}'::jsonb,
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user preferences
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_executions_updated_at BEFORE UPDATE ON public.workflow_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON public.crews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Agents policies
CREATE POLICY "Users can view all agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Users can create agents" ON public.agents FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their agents" ON public.agents FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their agents" ON public.agents FOR DELETE USING (auth.uid() = created_by);

-- Workflows policies
CREATE POLICY "Users can view all workflows" ON public.workflows FOR SELECT USING (true);
CREATE POLICY "Users can create workflows" ON public.workflows FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their workflows" ON public.workflows FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their workflows" ON public.workflows FOR DELETE USING (auth.uid() = created_by);

-- Workflow executions policies
CREATE POLICY "Users can view their executions" ON public.workflow_executions FOR SELECT USING (auth.uid() = executed_by);
CREATE POLICY "Users can create executions" ON public.workflow_executions FOR INSERT WITH CHECK (auth.uid() = executed_by);
CREATE POLICY "Users can update their executions" ON public.workflow_executions FOR UPDATE USING (auth.uid() = executed_by);

-- Tools policies
CREATE POLICY "Users can view all tools" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Users can create tools" ON public.tools FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their tools" ON public.tools FOR UPDATE USING (auth.uid() = created_by OR is_builtin = false);

-- Crews policies
CREATE POLICY "Users can view all crews" ON public.crews FOR SELECT USING (true);
CREATE POLICY "Users can create crews" ON public.crews FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their crews" ON public.crews FOR UPDATE USING (auth.uid() = created_by);

-- Execution logs policies
CREATE POLICY "Users can view logs for their executions" ON public.execution_logs FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.workflow_executions 
        WHERE id = execution_id AND executed_by = auth.uid()
    ));

-- Analytics policies
CREATE POLICY "Users can view their analytics" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can view their preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Agent performance view
CREATE OR REPLACE VIEW public.agent_performance AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.total_executions,
    a.successful_executions,
    a.failed_executions,
    CASE 
        WHEN a.total_executions > 0 
        THEN ROUND((a.successful_executions::DECIMAL / a.total_executions * 100), 2)
        ELSE 0 
    END as success_rate,
    a.avg_execution_time_ms,
    a.total_cost_usd,
    a.last_used_at,
    a.status
FROM public.agents a;

-- Workflow performance view
CREATE OR REPLACE VIEW public.workflow_performance AS
SELECT 
    w.id,
    w.name,
    w.type,
    w.total_executions,
    w.avg_execution_time_ms,
    w.success_rate,
    w.last_executed_at,
    w.status,
    array_length(w.agents_used, 1) as agent_count
FROM public.workflows w;

-- Daily analytics view
CREATE OR REPLACE VIEW public.daily_analytics AS
SELECT 
    event_date,
    event_type,
    COUNT(*) as event_count,
    AVG(duration_ms) as avg_duration_ms,
    SUM(cost_usd) as total_cost_usd,
    COUNT(*) FILTER (WHERE success = true) as successful_count,
    COUNT(*) FILTER (WHERE success = false) as failed_count
FROM public.analytics_events
GROUP BY event_date, event_type
ORDER BY event_date DESC, event_type;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get agent statistics
CREATE OR REPLACE FUNCTION get_agent_stats(agent_id_param UUID)
RETURNS TABLE (
    total_executions BIGINT,
    success_rate DECIMAL,
    avg_duration_ms DECIMAL,
    total_cost DECIMAL,
    last_7_days_executions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_executions,
        ROUND((COUNT(*) FILTER (WHERE we.status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2) as success_rate,
        ROUND(AVG(we.execution_time_ms), 2) as avg_duration_ms,
        SUM(we.cost_usd) as total_cost,
        COUNT(*) FILTER (WHERE we.created_at >= NOW() - INTERVAL '7 days')::BIGINT as last_7_days_executions
    FROM public.workflow_executions we
    WHERE EXISTS (
        SELECT 1 FROM public.workflows w 
        WHERE w.id = we.workflow_id 
        AND agent_id_param = ANY(w.agents_used)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to record analytics event
CREATE OR REPLACE FUNCTION record_analytics_event(
    p_event_type VARCHAR,
    p_event_name VARCHAR,
    p_properties JSONB DEFAULT '{}'::jsonb,
    p_duration_ms INTEGER DEFAULT NULL,
    p_cost_usd DECIMAL DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_workflow_id UUID DEFAULT NULL,
    p_execution_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.analytics_events (
        event_type,
        event_name,
        properties,
        duration_ms,
        cost_usd,
        success,
        user_id,
        workflow_id,
        execution_id
    ) VALUES (
        p_event_type,
        p_event_name,
        p_properties,
        p_duration_ms,
        p_cost_usd,
        p_success,
        auth.uid(),
        p_workflow_id,
        p_execution_id
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.agents IS 'AI agents registered in the system';
COMMENT ON TABLE public.workflows IS 'Workflow definitions and templates';
COMMENT ON TABLE public.workflow_executions IS 'Execution history and results';
COMMENT ON TABLE public.tools IS 'Available tools for agents';
COMMENT ON TABLE public.crews IS 'CrewAI multi-agent crews';
COMMENT ON TABLE public.execution_logs IS 'Detailed execution logs';
COMMENT ON TABLE public.analytics_events IS 'Analytics and tracking events';
COMMENT ON TABLE public.user_preferences IS 'User settings and preferences';
