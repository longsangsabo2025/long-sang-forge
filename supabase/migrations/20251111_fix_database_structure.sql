-- Fix database structure - create missing tables
-- Run this to setup basic structure

-- Drop existing tables if needed (careful!)
DROP TABLE IF EXISTS public.agent_executions CASCADE;
DROP TABLE IF EXISTS public.tools CASCADE;
DROP TABLE IF EXISTS public.workflow_executions CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL DEFAULT 'custom', -- renamed from 'type'
    status VARCHAR(50) DEFAULT 'active',
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
    
    -- Ownership (nullable for now)
    created_by UUID,
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'error', 'maintenance'))
);

-- ============================================
-- TOOLS TABLE
-- ============================================
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    tool_type VARCHAR(100) NOT NULL DEFAULT 'function',
    config JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_by UUID
);

-- ============================================
-- AGENT EXECUTIONS TABLE
-- ============================================
CREATE TABLE public.agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    
    -- Execution details
    status VARCHAR(50) DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    
    -- Performance
    execution_time_ms INTEGER,
    cost_usd DECIMAL(10, 4),
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    created_by UUID,
    
    CONSTRAINT valid_execution_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'))
);

-- ============================================
-- WORKFLOW EXECUTIONS TABLE (if workflows table exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    
    execution_time_ms INTEGER,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    created_by UUID
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Budget tracking
    budget_usd DECIMAL(10, 2),
    spent_usd DECIMAL(10, 2) DEFAULT 0,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_by UUID
);

-- ============================================
-- CONSULTATION BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Booking details
    preferred_date DATE,
    preferred_time TIME,
    message TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_booking_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- ============================================
-- SEO PAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.seo_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    page_url VARCHAR(500) NOT NULL UNIQUE,
    title VARCHAR(255),
    description TEXT,
    keywords TEXT[],
    
    -- SEO metrics
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5, 2),
    avg_time_on_page INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_agents_name ON public.agents(name);
CREATE INDEX idx_agents_type ON public.agents(agent_type);
CREATE INDEX idx_agents_status ON public.agents(status);

CREATE INDEX idx_tools_name ON public.tools(name);
CREATE INDEX idx_tools_type ON public.tools(tool_type);

CREATE INDEX idx_agent_executions_agent ON public.agent_executions(agent_id);
CREATE INDEX idx_agent_executions_status ON public.agent_executions(status);

CREATE INDEX idx_projects_status ON public.projects(status);

CREATE INDEX idx_consultation_bookings_status ON public.consultation_bookings(status);
CREATE INDEX idx_consultation_bookings_email ON public.consultation_bookings(email);

CREATE INDEX idx_seo_pages_url ON public.seo_pages(page_url);

-- ============================================
-- RLS POLICIES (Enable RLS but allow all for now)
-- ============================================
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users (for development)
CREATE POLICY "Allow all for authenticated users" ON public.agents FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.tools FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.agent_executions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.consultation_bookings FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.seo_pages FOR ALL USING (true);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample agents
INSERT INTO public.agents (name, role, agent_type, description, capabilities) VALUES
('Lead Nurture Agent', 'Sales & Marketing', 'work', 'Automated email follow-ups and lead scoring', '["email_automation", "lead_scoring", "crm_integration"]'::jsonb),
('Content Writer Agent', 'Content Creation', 'work', 'Blog posts and social media content generation', '["blog_writing", "social_media", "seo_optimization"]'::jsonb),
('Research Agent', 'Research & Analysis', 'research', 'Market research and data analysis', '["web_scraping", "data_analysis", "report_generation"]'::jsonb),
('Code Review Agent', 'Development', 'work', 'Automated code review and quality checks', '["code_analysis", "bug_detection", "style_checking"]'::jsonb),
('Personal Assistant', 'Life Management', 'life', 'Calendar management and task scheduling', '["calendar", "reminders", "email_management"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert sample tools
INSERT INTO public.tools (name, description, tool_type) VALUES
('Email Sender', 'Send emails via SMTP/API', 'integration'),
('Web Scraper', 'Extract data from websites', 'automation'),
('Calendar API', 'Manage calendar events', 'integration'),
('Database Query', 'Execute database queries', 'data'),
('File Manager', 'Read and write files', 'utility')
ON CONFLICT (name) DO NOTHING;

-- Insert sample project
INSERT INTO public.projects (name, description, budget_usd) VALUES
('Marketing Automation', 'Automate email campaigns and lead nurturing', 5000.00),
('Content Pipeline', 'Automated content creation and publishing', 3000.00),
('Customer Support Bot', 'AI-powered customer support system', 10000.00)
ON CONFLICT DO NOTHING;

COMMIT;
