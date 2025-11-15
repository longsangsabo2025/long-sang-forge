-- =====================================================
-- 🤖 MCP (Model Context Protocol) Integration Tables
-- =====================================================
-- Created: November 1, 2025
-- Purpose: Enable n8n workflows to work with MCP servers and clients

-- 🔧 MCP Servers Registry
CREATE TABLE public.mcp_servers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    protocol_version VARCHAR(50) DEFAULT '2024-11-05',
    server_type VARCHAR(100) NOT NULL, -- 'stdio', 'sse', 'websocket'
    status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'testing'
    capabilities JSONB DEFAULT '{}', -- MCP capabilities like tools, resources, prompts
    connection_config JSONB DEFAULT '{}', -- Connection parameters (transport, args, env)
    health_check_url VARCHAR(500),
    last_ping_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 🛠️ MCP Tools Registry (tools exposed by MCP servers)
CREATE TABLE public.mcp_tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    tool_name VARCHAR(255) NOT NULL,
    description TEXT,
    input_schema JSONB, -- JSON schema for tool inputs
    output_schema JSONB, -- JSON schema for tool outputs
    tool_category VARCHAR(100), -- 'data', 'communication', 'automation', 'ai', etc.
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, tool_name)
);

-- 📦 MCP Resources Registry (resources exposed by MCP servers)
CREATE TABLE public.mcp_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    resource_uri VARCHAR(500) NOT NULL,
    resource_name VARCHAR(255),
    resource_type VARCHAR(100), -- 'file', 'directory', 'database', 'api', etc.
    mime_type VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, resource_uri)
);

-- 🎭 MCP Prompts Registry (prompts exposed by MCP servers)
CREATE TABLE public.mcp_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    prompt_name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_template TEXT,
    arguments JSONB DEFAULT '[]', -- Array of argument definitions
    prompt_category VARCHAR(100), -- 'system', 'user', 'assistant', 'function'
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, prompt_name)
);

-- 🔗 MCP Workflow Connections (which n8n workflows use which MCP servers)
CREATE TABLE public.mcp_workflow_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES public.n8n_workflows(id) ON DELETE CASCADE,
    server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    connection_type VARCHAR(50) NOT NULL, -- 'server', 'client', 'bidirectional'
    node_id VARCHAR(255), -- n8n node ID that uses this MCP connection
    node_type VARCHAR(100), -- 'mcp_server_trigger', 'mcp_client_tool', etc.
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, server_id, node_id)
);

-- 📊 MCP Execution Logs (track MCP interactions)
CREATE TABLE public.mcp_execution_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES public.n8n_workflows(id) ON DELETE CASCADE,
    server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    execution_id VARCHAR(255), -- n8n execution ID
    mcp_operation VARCHAR(100) NOT NULL, -- 'tool_call', 'resource_read', 'prompt_get', etc.
    operation_data JSONB, -- Request/response data
    duration_ms INTEGER,
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'timeout'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📈 MCP Analytics Summary
CREATE TABLE public.mcp_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    average_response_time_ms NUMERIC(10,2) DEFAULT 0,
    most_used_tool VARCHAR(255),
    most_accessed_resource VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, date)
);

-- 🔐 Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_workflow_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_analytics ENABLE ROW LEVEL SECURITY;

-- MCP Servers policies
CREATE POLICY "Users can view all MCP servers" ON public.mcp_servers
    FOR SELECT USING (true);

CREATE POLICY "Users can create MCP servers" ON public.mcp_servers
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their MCP servers" ON public.mcp_servers
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their MCP servers" ON public.mcp_servers
    FOR DELETE USING (auth.uid() = created_by);

-- MCP Tools policies (inherit from servers)
CREATE POLICY "Users can view MCP tools" ON public.mcp_tools
    FOR SELECT USING (
        server_id IN (SELECT id FROM public.mcp_servers WHERE auth.uid() = created_by OR true)
    );

CREATE POLICY "Users can manage tools for their servers" ON public.mcp_tools
    FOR ALL USING (
        server_id IN (SELECT id FROM public.mcp_servers WHERE auth.uid() = created_by)
    );

-- MCP Resources policies (inherit from servers)
CREATE POLICY "Users can view MCP resources" ON public.mcp_resources
    FOR SELECT USING (
        server_id IN (SELECT id FROM public.mcp_servers WHERE auth.uid() = created_by OR true)
    );

CREATE POLICY "Users can manage resources for their servers" ON public.mcp_resources
    FOR ALL USING (
        server_id IN (SELECT id FROM public.mcp_servers WHERE auth.uid() = created_by)
    );

-- MCP Prompts policies (inherit from servers)
CREATE POLICY "Users can view MCP prompts" ON public.mcp_prompts
    FOR SELECT USING (
        server_id IN (SELECT id FROM public.mcp_servers WHERE auth.uid() = created_by OR true)
    );

CREATE POLICY "Users can manage prompts for their servers" ON public.mcp_prompts
    FOR ALL USING (
        server_id IN (SELECT id FROM public.mcp_servers WHERE auth.uid() = created_by)
    );

-- MCP Workflow Connections policies
CREATE POLICY "Users can view workflow connections" ON public.mcp_workflow_connections
    FOR SELECT USING (
        workflow_id IN (SELECT id FROM public.n8n_workflows WHERE auth.uid() = created_by OR true)
    );

CREATE POLICY "Users can manage their workflow connections" ON public.mcp_workflow_connections
    FOR ALL USING (
        workflow_id IN (SELECT id FROM public.n8n_workflows WHERE auth.uid() = created_by)
    );

-- MCP Execution Logs policies
CREATE POLICY "Users can view execution logs" ON public.mcp_execution_logs
    FOR SELECT USING (
        workflow_id IN (SELECT id FROM public.n8n_workflows WHERE auth.uid() = created_by OR true)
    );

CREATE POLICY "System can insert execution logs" ON public.mcp_execution_logs
    FOR INSERT WITH CHECK (true);

-- MCP Analytics policies
CREATE POLICY "Users can view MCP analytics" ON public.mcp_analytics
    FOR SELECT USING (
        server_id IN (SELECT id FROM public.mcp_servers WHERE auth.uid() = created_by OR true)
    );

CREATE POLICY "System can manage analytics" ON public.mcp_analytics
    FOR ALL USING (true);

-- 📚 Indexes for better performance
CREATE INDEX idx_mcp_servers_status ON public.mcp_servers(status);
CREATE INDEX idx_mcp_servers_created_by ON public.mcp_servers(created_by);
CREATE INDEX idx_mcp_tools_server_id ON public.mcp_tools(server_id);
CREATE INDEX idx_mcp_tools_category ON public.mcp_tools(tool_category);
CREATE INDEX idx_mcp_resources_server_id ON public.mcp_resources(server_id);
CREATE INDEX idx_mcp_resources_type ON public.mcp_resources(resource_type);
CREATE INDEX idx_mcp_prompts_server_id ON public.mcp_prompts(server_id);
CREATE INDEX idx_mcp_workflow_connections_workflow_id ON public.mcp_workflow_connections(workflow_id);
CREATE INDEX idx_mcp_workflow_connections_server_id ON public.mcp_workflow_connections(server_id);
CREATE INDEX idx_mcp_execution_logs_workflow_id ON public.mcp_execution_logs(workflow_id);
CREATE INDEX idx_mcp_execution_logs_server_id ON public.mcp_execution_logs(server_id);
CREATE INDEX idx_mcp_execution_logs_created_at ON public.mcp_execution_logs(created_at);
CREATE INDEX idx_mcp_analytics_server_id_date ON public.mcp_analytics(server_id, date);

-- 🔄 Functions for automatic updates
CREATE OR REPLACE FUNCTION update_mcp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_mcp_servers_updated_at BEFORE UPDATE ON public.mcp_servers
    FOR EACH ROW EXECUTE FUNCTION update_mcp_updated_at();

CREATE TRIGGER update_mcp_tools_updated_at BEFORE UPDATE ON public.mcp_tools
    FOR EACH ROW EXECUTE FUNCTION update_mcp_updated_at();

CREATE TRIGGER update_mcp_resources_updated_at BEFORE UPDATE ON public.mcp_resources
    FOR EACH ROW EXECUTE FUNCTION update_mcp_updated_at();

CREATE TRIGGER update_mcp_prompts_updated_at BEFORE UPDATE ON public.mcp_prompts
    FOR EACH ROW EXECUTE FUNCTION update_mcp_updated_at();

CREATE TRIGGER update_mcp_workflow_connections_updated_at BEFORE UPDATE ON public.mcp_workflow_connections
    FOR EACH ROW EXECUTE FUNCTION update_mcp_updated_at();

CREATE TRIGGER update_mcp_analytics_updated_at BEFORE UPDATE ON public.mcp_analytics
    FOR EACH ROW EXECUTE FUNCTION update_mcp_updated_at();

-- 🌱 Seed data: Popular MCP servers
INSERT INTO public.mcp_servers (name, description, url, server_type, capabilities, connection_config) VALUES
('Claude Desktop MCP', 'Anthropic Claude Desktop MCP server for AI assistance', 'stdio://claude-desktop', 'stdio', 
 '{"tools": ["file_operations", "text_analysis"], "resources": ["documents", "conversations"], "prompts": ["system_prompts"]}',
 '{"command": "claude-desktop", "args": ["--mcp"], "env": {}}'),

('GitHub MCP Server', 'GitHub integration via MCP protocol', 'stdio://github-mcp', 'stdio',
 '{"tools": ["create_issue", "get_repo", "search_code"], "resources": ["repositories", "issues", "pull_requests"]}',
 '{"command": "github-mcp-server", "args": [], "env": {"GITHUB_TOKEN": ""}}'),

('File System MCP', 'Local file system access via MCP', 'stdio://filesystem-mcp', 'stdio',
 '{"tools": ["read_file", "write_file", "list_directory"], "resources": ["files", "directories"]}',
 '{"command": "filesystem-mcp-server", "args": ["--allowed-dirs", "/safe/path"], "env": {}}'),

('Database MCP Server', 'Database operations via MCP protocol', 'stdio://database-mcp', 'stdio',
 '{"tools": ["execute_query", "get_schema", "get_tables"], "resources": ["tables", "views", "procedures"]}',
 '{"command": "database-mcp-server", "args": [], "env": {"DATABASE_URL": ""}}');

-- 📝 Success message
SELECT 'MCP Integration tables created successfully!' as result;