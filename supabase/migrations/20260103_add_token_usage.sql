-- ======================================
-- Token Usage Tracking Table
-- ======================================
-- Track actual OpenAI token consumption for each user
-- Used for: billing, analytics, cost monitoring
-- ======================================

-- Create token_usage table
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(12, 8) NOT NULL DEFAULT 0,
  intent TEXT, -- What the user was asking about
  source TEXT DEFAULT 'website', -- website, api, mobile, etc
  conversation_id TEXT, -- Group messages in same conversation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON public.token_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_model ON public.token_usage(model);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_date ON public.token_usage(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own token usage"
  ON public.token_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert (backend only)
CREATE POLICY "Service role can insert token usage"
  ON public.token_usage FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all (for analytics)
CREATE POLICY "Admins can view all token usage"
  ON public.token_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- Aggregation Functions
-- ======================================

-- Get user's total usage for a period
CREATE OR REPLACE FUNCTION get_user_token_usage(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_tokens BIGINT,
  total_prompt_tokens BIGINT,
  total_completion_tokens BIGINT,
  total_cost_usd DECIMAL(12, 8),
  request_count BIGINT,
  avg_tokens_per_request DECIMAL(10, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(tu.total_tokens), 0)::BIGINT AS total_tokens,
    COALESCE(SUM(tu.prompt_tokens), 0)::BIGINT AS total_prompt_tokens,
    COALESCE(SUM(tu.completion_tokens), 0)::BIGINT AS total_completion_tokens,
    COALESCE(SUM(tu.cost_usd), 0)::DECIMAL(12, 8) AS total_cost_usd,
    COUNT(*)::BIGINT AS request_count,
    CASE
      WHEN COUNT(*) > 0 THEN (SUM(tu.total_tokens)::DECIMAL / COUNT(*))
      ELSE 0
    END AS avg_tokens_per_request
  FROM public.token_usage tu
  WHERE tu.user_id = p_user_id
    AND tu.created_at >= p_start_date
    AND tu.created_at <= p_end_date;
END;
$$;

-- Get daily usage breakdown for a user
CREATE OR REPLACE FUNCTION get_user_daily_usage(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  usage_date DATE,
  total_tokens BIGINT,
  total_cost_usd DECIMAL(12, 8),
  request_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(tu.created_at) AS usage_date,
    COALESCE(SUM(tu.total_tokens), 0)::BIGINT AS total_tokens,
    COALESCE(SUM(tu.cost_usd), 0)::DECIMAL(12, 8) AS total_cost_usd,
    COUNT(*)::BIGINT AS request_count
  FROM public.token_usage tu
  WHERE tu.user_id = p_user_id
    AND tu.created_at >= (NOW() - (p_days || ' days')::INTERVAL)
  GROUP BY DATE(tu.created_at)
  ORDER BY usage_date DESC;
END;
$$;

-- Get usage by model for analytics
CREATE OR REPLACE FUNCTION get_usage_by_model(
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  model TEXT,
  total_tokens BIGINT,
  total_cost_usd DECIMAL(12, 8),
  request_count BIGINT,
  unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tu.model,
    COALESCE(SUM(tu.total_tokens), 0)::BIGINT AS total_tokens,
    COALESCE(SUM(tu.cost_usd), 0)::DECIMAL(12, 8) AS total_cost_usd,
    COUNT(*)::BIGINT AS request_count,
    COUNT(DISTINCT tu.user_id)::BIGINT AS unique_users
  FROM public.token_usage tu
  WHERE tu.created_at >= p_start_date
    AND tu.created_at <= p_end_date
  GROUP BY tu.model
  ORDER BY total_cost_usd DESC;
END;
$$;

-- Get top users by token usage
CREATE OR REPLACE FUNCTION get_top_users_by_usage(
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days')
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  total_tokens BIGINT,
  total_cost_usd DECIMAL(12, 8),
  request_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tu.user_id,
    COALESCE(u.email, 'Unknown') AS email,
    COALESCE(SUM(tu.total_tokens), 0)::BIGINT AS total_tokens,
    COALESCE(SUM(tu.cost_usd), 0)::DECIMAL(12, 8) AS total_cost_usd,
    COUNT(*)::BIGINT AS request_count
  FROM public.token_usage tu
  LEFT JOIN auth.users u ON u.id = tu.user_id
  WHERE tu.created_at >= p_start_date
  GROUP BY tu.user_id, u.email
  ORDER BY total_cost_usd DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_token_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_daily_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_usage_by_model TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_users_by_usage TO authenticated;

-- ======================================
-- Sample Queries for Dashboards
-- ======================================
--
-- Get my usage this month:
-- SELECT * FROM get_user_token_usage(auth.uid(), NOW() - INTERVAL '30 days', NOW());
--
-- Get my daily breakdown:
-- SELECT * FROM get_user_daily_usage(auth.uid(), 30);
--
-- Admin: Get usage by model:
-- SELECT * FROM get_usage_by_model();
--
-- Admin: Get top users:
-- SELECT * FROM get_top_users_by_usage(10);
-- ======================================
