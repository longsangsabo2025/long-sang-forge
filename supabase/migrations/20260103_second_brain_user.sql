-- ================================================
-- SECOND BRAIN FOR USERS - Migration
-- ================================================
-- Create user-specific brain tables with usage limits
-- Date: 2026-01-03

-- ================================================
-- User Brain Quotas Table
-- ================================================
-- Track user's brain usage and limits
CREATE TABLE IF NOT EXISTS public.user_brain_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Counts
  documents_count INTEGER DEFAULT 0,
  queries_count INTEGER DEFAULT 0,
  domains_count INTEGER DEFAULT 0,

  -- Monthly reset tracking
  month_year TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM'),

  -- Limits (from subscription plan)
  max_documents INTEGER DEFAULT 50,    -- Free tier
  max_queries_per_month INTEGER DEFAULT 100, -- Free tier
  max_domains INTEGER DEFAULT 3,       -- Free tier

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_query_at TIMESTAMPTZ,

  UNIQUE(user_id, month_year)
);

-- ================================================
-- User Import Jobs Table
-- ================================================
-- Track import jobs (YouTube, URL, PDF)
CREATE TABLE IF NOT EXISTS public.user_brain_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.brain_domains(id) ON DELETE SET NULL,

  -- Source info
  source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'url', 'pdf', 'text')),
  source_url TEXT,
  source_title TEXT,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0, -- 0-100
  error_message TEXT,

  -- Results
  documents_created INTEGER DEFAULT 0,
  chunks_generated INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ================================================
-- User Brain Chat History
-- ================================================
-- Store user's brain chat sessions
CREATE TABLE IF NOT EXISTS public.user_brain_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.brain_domains(id) ON DELETE SET NULL,

  -- Chat session
  session_id TEXT NOT NULL,
  title TEXT DEFAULT 'New Chat',

  -- Messages stored as JSONB array
  messages JSONB DEFAULT '[]'::jsonb,

  -- Context
  knowledge_ids UUID[] DEFAULT '{}', -- Referenced knowledge items

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- ================================================
-- Brain Subscription Plans Reference
-- ================================================
-- Define brain-specific plan limits
CREATE TABLE IF NOT EXISTS public.brain_plan_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'team'

  -- Limits
  max_documents INTEGER NOT NULL,
  max_queries_per_month INTEGER NOT NULL,
  max_domains INTEGER NOT NULL,
  max_import_size_mb INTEGER NOT NULL,

  -- Features
  youtube_import BOOLEAN DEFAULT false,
  url_import BOOLEAN DEFAULT true,
  pdf_import BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  priority_processing BOOLEAN DEFAULT false,

  -- Price (VND)
  monthly_price INTEGER DEFAULT 0,
  yearly_price INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.brain_plan_limits (plan_id, max_documents, max_queries_per_month, max_domains, max_import_size_mb, youtube_import, url_import, pdf_import, api_access, priority_processing, monthly_price, yearly_price)
VALUES
  ('free', 50, 100, 3, 5, false, true, false, false, false, 0, 0),
  ('pro', 500, 1000, 10, 50, true, true, true, true, false, 199000, 1990000),
  ('team', 2000, 5000, 50, 200, true, true, true, true, true, 499000, 4990000)
ON CONFLICT (plan_id) DO UPDATE SET
  max_documents = EXCLUDED.max_documents,
  max_queries_per_month = EXCLUDED.max_queries_per_month,
  max_domains = EXCLUDED.max_domains,
  max_import_size_mb = EXCLUDED.max_import_size_mb,
  youtube_import = EXCLUDED.youtube_import,
  url_import = EXCLUDED.url_import,
  pdf_import = EXCLUDED.pdf_import,
  api_access = EXCLUDED.api_access,
  priority_processing = EXCLUDED.priority_processing,
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price;

-- ================================================
-- Indexes for Performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_user_brain_quotas_user_id ON public.user_brain_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brain_quotas_month ON public.user_brain_quotas(month_year);
CREATE INDEX IF NOT EXISTS idx_user_brain_imports_user_id ON public.user_brain_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brain_imports_status ON public.user_brain_imports(status);
CREATE INDEX IF NOT EXISTS idx_user_brain_chats_user_id ON public.user_brain_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brain_chats_session ON public.user_brain_chats(session_id);

-- ================================================
-- RLS Policies
-- ================================================
ALTER TABLE public.user_brain_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brain_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brain_chats ENABLE ROW LEVEL SECURITY;

-- Quotas policies
CREATE POLICY "Users can read own quotas" ON public.user_brain_quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage quotas" ON public.user_brain_quotas FOR ALL USING (true);

-- Imports policies
CREATE POLICY "Users can read own imports" ON public.user_brain_imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create imports" ON public.user_brain_imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage imports" ON public.user_brain_imports FOR ALL USING (true);

-- Chats policies
CREATE POLICY "Users can manage own chats" ON public.user_brain_chats FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- Functions
-- ================================================

-- Initialize user brain quota
CREATE OR REPLACE FUNCTION public.initialize_user_brain_quota(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_brain_quotas (user_id, month_year)
  VALUES (p_user_id, to_char(NOW(), 'YYYY-MM'))
  ON CONFLICT (user_id, month_year) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and update quota
CREATE OR REPLACE FUNCTION public.check_brain_quota(
  p_user_id UUID,
  p_action TEXT -- 'document', 'query', 'domain'
)
RETURNS JSONB AS $$
DECLARE
  v_quota RECORD;
  v_limits RECORD;
  v_user_plan TEXT;
  v_month TEXT;
BEGIN
  v_month := to_char(NOW(), 'YYYY-MM');

  -- Get user's plan (default to 'free')
  SELECT COALESCE(plan_id, 'free') INTO v_user_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;

  IF v_user_plan IS NULL THEN
    v_user_plan := 'free';
  END IF;

  -- Get plan limits
  SELECT * INTO v_limits FROM public.brain_plan_limits WHERE plan_id = v_user_plan;

  -- Get or create quota
  SELECT * INTO v_quota FROM public.user_brain_quotas
  WHERE user_id = p_user_id AND month_year = v_month;

  IF v_quota IS NULL THEN
    INSERT INTO public.user_brain_quotas (user_id, month_year, max_documents, max_queries_per_month, max_domains)
    VALUES (p_user_id, v_month, v_limits.max_documents, v_limits.max_queries_per_month, v_limits.max_domains)
    RETURNING * INTO v_quota;
  END IF;

  -- Check limits
  IF p_action = 'document' AND v_quota.documents_count >= v_limits.max_documents THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Document limit reached', 'limit', v_limits.max_documents);
  END IF;

  IF p_action = 'query' AND v_quota.queries_count >= v_limits.max_queries_per_month THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Query limit reached', 'limit', v_limits.max_queries_per_month);
  END IF;

  IF p_action = 'domain' AND v_quota.domains_count >= v_limits.max_domains THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Domain limit reached', 'limit', v_limits.max_domains);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'current', v_quota, 'limits', v_limits);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment quota count
CREATE OR REPLACE FUNCTION public.increment_brain_usage(
  p_user_id UUID,
  p_action TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_brain_quotas
  SET
    documents_count = CASE WHEN p_action = 'document' THEN documents_count + p_amount ELSE documents_count END,
    queries_count = CASE WHEN p_action = 'query' THEN queries_count + p_amount ELSE queries_count END,
    domains_count = CASE WHEN p_action = 'domain' THEN domains_count + p_amount ELSE domains_count END,
    updated_at = NOW(),
    last_query_at = CASE WHEN p_action = 'query' THEN NOW() ELSE last_query_at END
  WHERE user_id = p_user_id AND month_year = to_char(NOW(), 'YYYY-MM');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset monthly quotas (run via cron)
CREATE OR REPLACE FUNCTION public.reset_brain_monthly_quotas()
RETURNS VOID AS $$
DECLARE
  v_month TEXT;
BEGIN
  v_month := to_char(NOW(), 'YYYY-MM');

  -- Create new month entries for active users
  INSERT INTO public.user_brain_quotas (user_id, month_year)
  SELECT DISTINCT user_id, v_month
  FROM public.user_brain_quotas
  WHERE month_year = to_char(NOW() - INTERVAL '1 month', 'YYYY-MM')
  ON CONFLICT (user_id, month_year) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.user_brain_quotas IS 'Track user brain usage and limits per month';
COMMENT ON TABLE public.user_brain_imports IS 'Track user import jobs from various sources';
COMMENT ON TABLE public.user_brain_chats IS 'Store user brain chat sessions';
COMMENT ON TABLE public.brain_plan_limits IS 'Define brain-specific subscription plan limits';

-- ================================================
-- Vector Search Function for User Brain
-- ================================================
CREATE OR REPLACE FUNCTION public.search_user_brain(
  p_user_id UUID,
  p_domain_id UUID DEFAULT NULL,
  p_query_embedding TEXT,
  p_match_count INTEGER DEFAULT 5,
  p_match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  similarity FLOAT
) AS $$
DECLARE
  v_embedding vector(1536);
BEGIN
  -- Parse embedding from JSON string
  v_embedding := p_query_embedding::vector(1536);

  RETURN QUERY
  SELECT
    k.id,
    k.title,
    k.content,
    1 - (k.embedding <=> v_embedding) AS similarity
  FROM public.brain_knowledge k
  WHERE k.user_id = p_user_id
    AND (p_domain_id IS NULL OR k.domain_id = p_domain_id)
    AND k.embedding IS NOT NULL
    AND 1 - (k.embedding <=> v_embedding) > p_match_threshold
  ORDER BY k.embedding <=> v_embedding
  LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
