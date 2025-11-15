-- ================================================
-- SEED DATA: Initial AI Agents (Demo Only - 2 Agents)
-- ================================================

-- Insert Content Writer Agent (Active Demo)
INSERT INTO public.ai_agents (name, type, status, description, config)
VALUES (
  'Demo Content Writer',
  'content_writer',
  'active',
  'Demo agent that generates blog posts. Configure it to suit your needs.',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'auto_publish', false,
    'require_approval', true,
    'tone', 'professional',
    'max_length', 1000,
    'generate_seo', true
  )
);

-- Insert Social Media Agent (Paused Demo)
INSERT INTO public.ai_agents (name, type, status, description, config)
VALUES (
  'Demo Social Media Manager',
  'social_media',
  'paused',
  'Demo agent for social media posting. Configure platforms and schedule.',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'platforms', jsonb_build_array('linkedin'),
    'include_hashtags', true,
    'auto_schedule', false
  )
);


-- Insert some sample activity logs for demo agents
INSERT INTO public.activity_logs (agent_id, action, details, status, duration_ms)
SELECT 
  id,
  'Agent Created',
  jsonb_build_object(
    'message', 'Demo agent ready for configuration',
    'version', '1.0.0'
  ),
  'success',
  0
FROM public.ai_agents
WHERE name LIKE 'Demo%';
