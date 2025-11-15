-- ============================================
-- SEED DATA FOR AI AGENT CENTER
-- ============================================
-- Created: 2025-01-18
-- Purpose: Initial data for AI Agent Center
-- ============================================

-- ============================================
-- SEED DEFAULT AGENTS
-- ============================================
INSERT INTO public.agents (name, role, type, description, capabilities, config, status, is_builtin) VALUES
('work_agent', 'Work Assistant', 'work', 'Handles work-related tasks including content creation, email drafting, and professional communication', 
 '["content_creation", "email_writing", "task_planning", "document_generation"]'::jsonb,
 '{"model": "gpt-4o", "temperature": 0.7, "max_tokens": 2000}'::jsonb,
 'active', true),

('research_agent', 'Research Specialist', 'research', 'Conducts research, gathers information, and provides insights on various topics',
 '["web_search", "data_analysis", "summarization", "fact_checking"]'::jsonb,
 '{"model": "gpt-4o", "temperature": 0.3, "max_tokens": 3000}'::jsonb,
 'active', true),

('life_agent', 'Life Assistant', 'life', 'Helps with personal tasks, scheduling, and life management',
 '["scheduling", "reminders", "personal_planning", "wellness_tips"]'::jsonb,
 '{"model": "gpt-3.5-turbo", "temperature": 0.8, "max_tokens": 1500}'::jsonb,
 'active', true),

('content_creator', 'Content Creator', 'custom', 'Specialized in creating high-quality content for various platforms',
 '["blog_writing", "social_media", "seo_optimization", "copywriting"]'::jsonb,
 '{"model": "gpt-4o", "temperature": 0.7, "max_tokens": 4000}'::jsonb,
 'active', true),

('data_analyst', 'Data Analyst', 'custom', 'Analyzes data and provides actionable insights',
 '["data_processing", "visualization", "statistical_analysis", "reporting"]'::jsonb,
 '{"model": "gpt-4o", "temperature": 0.2, "max_tokens": 2500}'::jsonb,
 'active', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DEFAULT TOOLS
-- ============================================
INSERT INTO public.tools (name, category, description, version, author, requires_api_key, cost_per_use, avg_execution_time_ms, tags, status, is_builtin) VALUES
('web_search', 'web_search', 'Search the web using DuckDuckGo', '1.0.0', 'LangChain', false, 0, 2000, 
 ARRAY['search', 'web', 'free'], 'active', true),

('wikipedia_search', 'web_search', 'Search Wikipedia for information', '1.0.0', 'LangChain', false, 0, 1500,
 ARRAY['search', 'wikipedia', 'knowledge'], 'active', true),

('calculator', 'utility', 'Perform mathematical calculations', '1.0.0', 'Built-in', false, 0, 100,
 ARRAY['math', 'calculator', 'utility'], 'active', true),

('sentiment_analysis', 'analysis', 'Analyze sentiment of text', '1.0.0', 'Built-in', false, 0, 500,
 ARRAY['nlp', 'sentiment', 'analysis'], 'active', true),

('word_counter', 'data_processing', 'Count words, characters, and sentences', '1.0.0', 'Built-in', false, 0, 50,
 ARRAY['text', 'analysis', 'utility'], 'active', true),

('json_parser', 'data_processing', 'Parse and validate JSON data', '1.0.0', 'Built-in', false, 0, 100,
 ARRAY['json', 'parsing', 'data'], 'active', true),

('text_summarizer', 'analysis', 'Summarize long text into key points', '1.0.0', 'Custom', false, 0.001, 3000,
 ARRAY['nlp', 'summarization', 'text'], 'active', true),

('email_validator', 'utility', 'Validate email addresses', '1.0.0', 'Built-in', false, 0, 50,
 ARRAY['validation', 'email', 'utility'], 'active', true),

('url_extractor', 'data_processing', 'Extract URLs from text', '1.0.0', 'Built-in', false, 0, 100,
 ARRAY['text', 'url', 'extraction'], 'active', true),

('code_formatter', 'code_execution', 'Format code in various languages', '1.0.0', 'Built-in', false, 0, 200,
 ARRAY['code', 'formatting', 'utility'], 'active', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED WORKFLOW TEMPLATES
-- ============================================
INSERT INTO public.workflows (name, type, description, definition, agents_used, status, is_template, tags) VALUES
('content_creation_pipeline', 'sequential', 'Complete content creation workflow: Research → Outline → Write → Edit → SEO',
 '{
    "steps": [
      {"name": "research", "agent": "research_agent", "description": "Research the topic"},
      {"name": "outline", "agent": "work_agent", "description": "Create content outline"},
      {"name": "write", "agent": "content_creator", "description": "Write the content"},
      {"name": "edit", "agent": "work_agent", "description": "Edit and polish"},
      {"name": "seo", "agent": "work_agent", "description": "SEO optimization"}
    ],
    "entry_point": "research",
    "edges": [
      {"from": "research", "to": "outline"},
      {"from": "outline", "to": "write"},
      {"from": "write", "to": "edit"},
      {"from": "edit", "to": "seo"}
    ]
  }'::jsonb,
 ARRAY(SELECT id FROM public.agents WHERE name IN ('research_agent', 'work_agent', 'content_creator')),
 'active', true, ARRAY['content', 'marketing', 'seo']),

('data_analysis_workflow', 'sequential', 'Data analysis pipeline: Collect → Clean → Analyze → Visualize → Report',
 '{
    "steps": [
      {"name": "collect", "agent": "research_agent", "description": "Collect data"},
      {"name": "clean", "agent": "data_analyst", "description": "Clean and prepare data"},
      {"name": "analyze", "agent": "data_analyst", "description": "Analyze data"},
      {"name": "visualize", "agent": "data_analyst", "description": "Create visualizations"},
      {"name": "report", "agent": "work_agent", "description": "Generate report"}
    ],
    "entry_point": "collect",
    "edges": [
      {"from": "collect", "to": "clean"},
      {"from": "clean", "to": "analyze"},
      {"from": "analyze", "to": "visualize"},
      {"from": "visualize", "to": "report"}
    ]
  }'::jsonb,
 ARRAY(SELECT id FROM public.agents WHERE name IN ('research_agent', 'data_analyst', 'work_agent')),
 'active', true, ARRAY['data', 'analysis', 'reporting']),

('multi_channel_marketing', 'parallel', 'Create content for multiple channels simultaneously',
 '{
    "parallel_steps": [
      {"name": "blog_post", "agent": "content_creator", "description": "Create blog post"},
      {"name": "social_media", "agent": "content_creator", "description": "Create social posts"},
      {"name": "email", "agent": "work_agent", "description": "Create email campaign"},
      {"name": "newsletter", "agent": "work_agent", "description": "Create newsletter"}
    ],
    "aggregator": {"name": "summary", "agent": "research_agent", "description": "Summarize campaign"}
  }'::jsonb,
 ARRAY(SELECT id FROM public.agents WHERE name IN ('content_creator', 'work_agent', 'research_agent')),
 'active', true, ARRAY['marketing', 'content', 'multi-channel']),

('quick_research', 'sequential', 'Quick research and summary workflow',
 '{
    "steps": [
      {"name": "search", "agent": "research_agent", "description": "Search for information"},
      {"name": "summarize", "agent": "research_agent", "description": "Summarize findings"}
    ],
    "entry_point": "search",
    "edges": [
      {"from": "search", "to": "summarize"}
    ]
  }'::jsonb,
 ARRAY(SELECT id FROM public.agents WHERE name = 'research_agent'),
 'active', true, ARRAY['research', 'quick', 'summary'])
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED CREWAI CREWS
-- ============================================
INSERT INTO public.crews (name, type, description, agents_config, tasks_config, process_type, status, tags) VALUES
('content_creator_crew', 'content_creator', 'Multi-agent crew for high-quality content creation',
 '{
    "researcher": {
      "role": "Content Researcher",
      "goal": "Gather comprehensive information on given topics",
      "backstory": "Expert researcher with access to web search and databases",
      "tools": ["web_search", "wikipedia_search"]
    },
    "writer": {
      "role": "Content Writer",
      "goal": "Create engaging, SEO-optimized content",
      "backstory": "Professional content writer with 10 years experience",
      "tools": ["text_summarizer", "word_counter"]
    },
    "editor": {
      "role": "Content Editor",
      "goal": "Review and polish content for quality",
      "backstory": "Senior editor ensuring top quality output",
      "tools": ["sentiment_analysis", "word_counter"]
    }
  }'::jsonb,
 '{
    "research_task": {
      "description": "Research comprehensive information on the topic",
      "agent": "researcher",
      "expected_output": "Detailed research summary with sources"
    },
    "writing_task": {
      "description": "Write engaging content based on research",
      "agent": "writer",
      "expected_output": "Well-structured article in Markdown",
      "context": ["research_task"]
    },
    "editing_task": {
      "description": "Review and polish the content",
      "agent": "editor",
      "expected_output": "Final polished article with editor notes",
      "context": ["writing_task"]
    }
  }'::jsonb,
 'sequential', 'active', ARRAY['content', 'crewai', 'multi-agent']),

('data_analysis_crew', 'data_analyst', 'Crew for comprehensive data analysis',
 '{
    "collector": {
      "role": "Data Collector",
      "goal": "Gather and organize data from various sources",
      "backstory": "Data collection specialist",
      "tools": ["web_search"]
    },
    "analyst": {
      "role": "Data Analyst",
      "goal": "Analyze data and extract insights",
      "backstory": "Expert data analyst with statistical background",
      "tools": ["calculator", "sentiment_analysis"]
    },
    "reporter": {
      "role": "Report Writer",
      "goal": "Create clear, actionable reports",
      "backstory": "Business intelligence reporter",
      "tools": ["text_summarizer", "word_counter"]
    }
  }'::jsonb,
 '{
    "collection_task": {
      "description": "Collect relevant data",
      "agent": "collector",
      "expected_output": "Organized dataset"
    },
    "analysis_task": {
      "description": "Analyze the data",
      "agent": "analyst",
      "expected_output": "Analysis with insights",
      "context": ["collection_task"]
    },
    "reporting_task": {
      "description": "Create comprehensive report",
      "agent": "reporter",
      "expected_output": "Final report with recommendations",
      "context": ["analysis_task"]
    }
  }'::jsonb,
 'sequential', 'active', ARRAY['data', 'analysis', 'crewai'])
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CREATE SAMPLE ANALYTICS DATA
-- ============================================
-- This will be populated by actual usage, but we can add some sample data

INSERT INTO public.analytics_events (event_type, event_name, properties, duration_ms, cost_usd, success) VALUES
('system', 'agent_center_initialized', '{"version": "1.0.0"}'::jsonb, NULL, 0, true),
('system', 'database_seeded', '{"tables": ["agents", "tools", "workflows", "crews"]}'::jsonb, NULL, 0, true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify seeded data

-- SELECT COUNT(*) as agent_count FROM public.agents;
-- SELECT COUNT(*) as tool_count FROM public.tools;
-- SELECT COUNT(*) as workflow_count FROM public.workflows;
-- SELECT COUNT(*) as crew_count FROM public.crews;

-- SELECT name, type, status FROM public.agents ORDER BY name;
-- SELECT name, category FROM public.tools ORDER BY category, name;
-- SELECT name, type, is_template FROM public.workflows ORDER BY name;
-- SELECT name, type FROM public.crews ORDER BY name;
