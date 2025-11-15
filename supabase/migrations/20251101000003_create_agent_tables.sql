-- Additional tables for AI agent workflows
-- Run this after the main MCP migration

-- Social Media Queue Table
CREATE TABLE IF NOT EXISTS social_media_queue (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram')),
    content TEXT NOT NULL,
    hashtags JSONB DEFAULT '[]'::jsonb,
    call_to_action TEXT,
    optimal_time TIME,
    estimated_engagement INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed', 'cancelled')),
    posted_at TIMESTAMPTZ,
    engagement_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    CONSTRAINT social_media_queue_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for social media queue
CREATE INDEX IF NOT EXISTS idx_social_media_queue_platform ON social_media_queue(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_queue_status ON social_media_queue(status);
CREATE INDEX IF NOT EXISTS idx_social_media_queue_created_at ON social_media_queue(created_at);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id TEXT PRIMARY KEY,
    email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'nurture', 'newsletter', 'promotion')),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject_line TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    send_time TIME,
    predicted_open_rate DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMPTZ,
    template_id TEXT,
    campaign_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    CONSTRAINT email_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for email campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_email_type ON email_campaigns(email_type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_recipient_email ON email_campaigns(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);

-- Email Analytics Table
CREATE TABLE IF NOT EXISTS email_analytics (
    id SERIAL PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    email_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject_line TEXT NOT NULL,
    send_status TEXT NOT NULL,
    send_time TIMESTAMPTZ NOT NULL,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    predicted_open_rate DECIMAL(5,2),
    actual_open_rate DECIMAL(5,2),
    provider_message_id TEXT,
    bounce_reason TEXT,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT email_analytics_campaign_fkey FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
);

-- Indexes for email analytics
CREATE INDEX IF NOT EXISTS idx_email_analytics_campaign_id ON email_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_send_time ON email_analytics(send_time);
CREATE INDEX IF NOT EXISTS idx_email_analytics_recipient_email ON email_analytics(recipient_email);

-- Agent Workflows Table (for tracking workflow executions)
CREATE TABLE IF NOT EXISTS agent_workflows (
    id TEXT PRIMARY KEY,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('content-generator', 'social-media', 'email-marketing', 'portfolio-updater', 'analytics-reporter', 'lead-processor')),
    workflow_name TEXT NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    execution_status TEXT DEFAULT 'running' CHECK (execution_status IN ('running', 'completed', 'failed', 'cancelled')),
    execution_time_ms INTEGER,
    error_message TEXT,
    triggered_by TEXT,
    workflow_version TEXT DEFAULT '1.0.0',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_by TEXT,
    CONSTRAINT agent_workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for agent workflows
CREATE INDEX IF NOT EXISTS idx_agent_workflows_agent_type ON agent_workflows(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_status ON agent_workflows(execution_status);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_started_at ON agent_workflows(started_at);

-- Agent Performance Metrics Table
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit TEXT DEFAULT 'count',
    measurement_time TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent performance
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_type ON agent_performance(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metric_name ON agent_performance(metric_name);
CREATE INDEX IF NOT EXISTS idx_agent_performance_measurement_time ON agent_performance(measurement_time);

-- Portfolio Projects Table (for portfolio updater agent)
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT CHECK (project_type IN ('web', 'mobile', 'ai', 'automation')),
    technologies JSONB DEFAULT '[]'::jsonb,
    repository_url TEXT,
    demo_url TEXT,
    image_urls JSONB DEFAULT '[]'::jsonb,
    completion_status TEXT DEFAULT 'development' CHECK (completion_status IN ('development', 'testing', 'production', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    CONSTRAINT portfolio_projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for portfolio projects
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_type ON portfolio_projects(project_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status ON portfolio_projects(completion_status);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured ON portfolio_projects(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order ON portfolio_projects(display_order);

-- Lead Processing Table
CREATE TABLE IF NOT EXISTS lead_processing (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    phone TEXT,
    source TEXT NOT NULL CHECK (source IN ('website', 'social', 'referral', 'ads', 'email')),
    initial_interaction TEXT,
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    qualification_status TEXT DEFAULT 'new' CHECK (qualification_status IN ('new', 'cold', 'warm', 'hot', 'qualified', 'unqualified')),
    assigned_to TEXT,
    last_interaction TIMESTAMPTZ,
    next_follow_up TIMESTAMPTZ,
    nurture_sequence TEXT,
    conversion_events JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT lead_processing_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for lead processing
CREATE INDEX IF NOT EXISTS idx_lead_processing_email ON lead_processing(email);
CREATE INDEX IF NOT EXISTS idx_lead_processing_source ON lead_processing(source);
CREATE INDEX IF NOT EXISTS idx_lead_processing_status ON lead_processing(qualification_status);
CREATE INDEX IF NOT EXISTS idx_lead_processing_score ON lead_processing(lead_score);
CREATE INDEX IF NOT EXISTS idx_lead_processing_assigned ON lead_processing(assigned_to);

-- Content Performance Analytics
CREATE TABLE IF NOT EXISTS content_analytics (
    id SERIAL PRIMARY KEY,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    measurement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT content_analytics_content_fkey FOREIGN KEY (content_id) REFERENCES content_queue(id) ON DELETE CASCADE
);

-- Indexes for content analytics
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON content_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_content_analytics_measurement_date ON content_analytics(measurement_date);

-- Row Level Security Policies
ALTER TABLE social_media_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_processing ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_media_queue
CREATE POLICY "Users can view their own social media posts" ON social_media_queue
    FOR SELECT USING (auth.uid()::text = created_by OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own social media posts" ON social_media_queue
    FOR INSERT WITH CHECK (auth.uid()::text = created_by OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own social media posts" ON social_media_queue
    FOR UPDATE USING (auth.uid()::text = created_by OR auth.role() = 'service_role');

-- RLS Policies for email_campaigns
CREATE POLICY "Users can view their own email campaigns" ON email_campaigns
    FOR SELECT USING (auth.uid()::text = created_by OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own email campaigns" ON email_campaigns
    FOR INSERT WITH CHECK (auth.uid()::text = created_by OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own email campaigns" ON email_campaigns
    FOR UPDATE USING (auth.uid()::text = created_by OR auth.role() = 'service_role');

-- RLS Policies for email_analytics
CREATE POLICY "Users can view email analytics" ON email_analytics
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- RLS Policies for agent_workflows
CREATE POLICY "Users can view their own agent workflows" ON agent_workflows
    FOR SELECT USING (auth.uid()::text = created_by OR auth.role() = 'service_role');

CREATE POLICY "Agents can insert workflow executions" ON agent_workflows
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- RLS Policies for agent_performance
CREATE POLICY "Users can view agent performance" ON agent_performance
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Agents can insert performance metrics" ON agent_performance
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- RLS Policies for portfolio_projects
CREATE POLICY "Anyone can view portfolio projects" ON portfolio_projects
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own portfolio projects" ON portfolio_projects
    FOR ALL USING (auth.uid()::text = created_by OR auth.role() = 'service_role');

-- RLS Policies for lead_processing
CREATE POLICY "Users can view their assigned leads" ON lead_processing
    FOR SELECT USING (auth.uid()::text = assigned_to OR auth.role() = 'service_role');

CREATE POLICY "Agents can insert and update leads" ON lead_processing
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- RLS Policies for content_analytics
CREATE POLICY "Users can view content analytics" ON content_analytics
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Agents can insert analytics data" ON content_analytics
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_lead_processing_updated_at 
    BEFORE UPDATE ON lead_processing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at 
    BEFORE UPDATE ON portfolio_projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics and reporting
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
    agent_type,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN execution_status = 'completed' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN execution_status = 'failed' THEN 1 END) as failed_executions,
    ROUND(
        (COUNT(CASE WHEN execution_status = 'completed' THEN 1 END)::decimal / COUNT(*)) * 100, 
        2
    ) as success_rate,
    AVG(execution_time_ms) as avg_execution_time,
    MAX(started_at) as last_execution
FROM agent_workflows
GROUP BY agent_type;

CREATE OR REPLACE VIEW email_campaign_performance AS
SELECT 
    email_type,
    COUNT(*) as total_campaigns,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_campaigns,
    AVG(predicted_open_rate) as avg_predicted_open_rate,
    AVG(CASE WHEN ea.actual_open_rate IS NOT NULL THEN ea.actual_open_rate END) as avg_actual_open_rate
FROM email_campaigns ec
LEFT JOIN email_analytics ea ON ec.id = ea.campaign_id
GROUP BY email_type;

CREATE OR REPLACE VIEW social_media_performance AS
SELECT 
    platform,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted_count,
    AVG(estimated_engagement) as avg_estimated_engagement,
    SUM(COALESCE((engagement_data->>'actual_engagement')::integer, 0)) as total_actual_engagement
FROM social_media_queue
GROUP BY platform;

-- Grant permissions
GRANT ALL ON social_media_queue TO authenticated;
GRANT ALL ON email_campaigns TO authenticated;
GRANT ALL ON email_analytics TO authenticated;
GRANT ALL ON agent_workflows TO authenticated;
GRANT ALL ON agent_performance TO authenticated;
GRANT ALL ON portfolio_projects TO authenticated;
GRANT ALL ON lead_processing TO authenticated;
GRANT ALL ON content_analytics TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE email_analytics_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE agent_performance_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE content_analytics_id_seq TO authenticated;

-- Grant select on views
GRANT SELECT ON agent_performance_summary TO authenticated;
GRANT SELECT ON email_campaign_performance TO authenticated;
GRANT SELECT ON social_media_performance TO authenticated;