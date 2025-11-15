-- ================================================
-- N8N INTEGRATION TABLES
-- Create tables for n8n workflow integration
-- ================================================

-- Table to track n8n workflows
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL UNIQUE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  webhook_url TEXT,
  n8n_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_execution TIMESTAMPTZ,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track workflow executions
CREATE TABLE IF NOT EXISTS n8n_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  n8n_execution_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error', 'waiting', 'canceled')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_ms INTEGER,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for workflow templates
CREATE TABLE IF NOT EXISTS n8n_workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_agent_id ON n8n_workflows(agent_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_status ON n8n_workflows(status);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_workflow_id ON n8n_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_workflow_id ON n8n_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_status ON n8n_executions(status);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_start_time ON n8n_executions(start_time);
CREATE INDEX IF NOT EXISTS idx_n8n_templates_category ON n8n_workflow_templates(category);

-- RLS Policies
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflow_templates ENABLE ROW LEVEL SECURITY;

-- Policies for n8n_workflows
CREATE POLICY "Users can view all workflows" ON n8n_workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert workflows" ON n8n_workflows FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update workflows" ON n8n_workflows FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete workflows" ON n8n_workflows FOR DELETE TO authenticated USING (true);

-- Policies for n8n_executions
CREATE POLICY "Users can view all executions" ON n8n_executions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert executions" ON n8n_executions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service role can insert executions" ON n8n_executions FOR INSERT TO service_role WITH CHECK (true);

-- Policies for n8n_workflow_templates
CREATE POLICY "Users can view public templates" ON n8n_workflow_templates FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can insert templates" ON n8n_workflow_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own templates" ON n8n_workflow_templates FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- Functions for workflow management
CREATE OR REPLACE FUNCTION update_workflow_execution_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' AND OLD.status != 'success' THEN
    UPDATE n8n_workflows 
    SET 
      successful_executions = successful_executions + 1,
      total_executions = total_executions + 1,
      last_execution = NEW.end_time,
      updated_at = NOW()
    WHERE id = NEW.workflow_id;
  ELSIF NEW.status IN ('error', 'canceled') AND OLD.status NOT IN ('error', 'canceled') THEN
    UPDATE n8n_workflows 
    SET 
      total_executions = total_executions + 1,
      last_execution = NEW.end_time,
      updated_at = NOW()
    WHERE id = NEW.workflow_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update workflow stats
CREATE TRIGGER tr_update_workflow_stats
  AFTER UPDATE ON n8n_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_execution_stats();

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE n8n_workflow_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER tr_n8n_workflows_updated_at
  BEFORE UPDATE ON n8n_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_n8n_templates_updated_at
  BEFORE UPDATE ON n8n_workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert some initial workflow templates
INSERT INTO n8n_workflow_templates (name, description, category, template_data, tags) VALUES
(
  'Content Writer Workflow',
  'Automated content generation using OpenAI and publishing to multiple platforms',
  'content',
  '{
    "nodes": [
      {
        "parameters": {},
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "resource": "chat",
          "operation": "message",
          "model": "gpt-4o-mini",
          "messages": {
            "values": [
              {
                "role": "user",
                "content": "Generate a blog post about: {{ $json.topic }}"
              }
            ]
          }
        },
        "name": "OpenAI",
        "type": "n8n-nodes-base.openAi",
        "typeVersion": 1,
        "position": [450, 300]
      }
    ],
    "connections": {
      "Webhook": {
        "main": [["OpenAI"]]
      }
    }
  }',
  ARRAY['ai', 'content', 'openai', 'automation']
),
(
  'Email Drip Campaign',
  'Multi-step email automation with follow-up sequences',
  'email',
  '{
    "nodes": [
      {
        "parameters": {},
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "operation": "send",
          "email": "{{ $json.email }}",
          "subject": "Welcome to our service!",
          "message": "Thank you for signing up!"
        },
        "name": "Email Send",
        "type": "n8n-nodes-base.emailSend",
        "typeVersion": 1,
        "position": [450, 300]
      }
    ],
    "connections": {
      "Webhook": {
        "main": [["Email Send"]]
      }
    }
  }',
  ARRAY['email', 'marketing', 'automation', 'drip-campaign']
),
(
  'Social Media Publisher',
  'Cross-platform social media posting with optimal timing',
  'social',
  '{
    "nodes": [
      {
        "parameters": {},
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "operation": "post",
          "text": "{{ $json.content }}"
        },
        "name": "Social Post",
        "type": "n8n-nodes-base.socialMedia",
        "typeVersion": 1,
        "position": [450, 300]
      }
    ],
    "connections": {
      "Webhook": {
        "main": [["Social Post"]]
      }
    }
  }',
  ARRAY['social-media', 'publishing', 'automation']
);

-- Comment on tables
COMMENT ON TABLE n8n_workflows IS 'Tracks n8n workflows associated with AI agents';
COMMENT ON TABLE n8n_executions IS 'Logs all n8n workflow executions with performance data';
COMMENT ON TABLE n8n_workflow_templates IS 'Pre-built workflow templates for common automation tasks';