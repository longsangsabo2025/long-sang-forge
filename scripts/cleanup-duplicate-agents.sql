-- ================================================
-- CLEANUP: Remove Duplicate and Old Demo Agents
-- ================================================

-- Delete all existing demo/duplicate agents
-- Keep only the most recent agents or manually created ones
DELETE FROM public.ai_agents 
WHERE name IN (
  'Content Writer Agent',
  'Lead Nurture Agent', 
  'Social Media Agent',
  'Analytics Agent'
);

-- Delete old demo agents with generic names
DELETE FROM public.ai_agents
WHERE name LIKE '%Agent' 
  AND created_at < NOW() - INTERVAL '1 day'
  AND status = 'paused';

-- Optional: Keep only the 2 most recent agents of each type
DELETE FROM public.ai_agents a
WHERE a.id NOT IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY type ORDER BY created_at DESC) as rn
    FROM public.ai_agents
  ) sub
  WHERE sub.rn <= 2
);

-- Show remaining agents
SELECT id, name, type, status, created_at 
FROM public.ai_agents 
ORDER BY created_at DESC;
