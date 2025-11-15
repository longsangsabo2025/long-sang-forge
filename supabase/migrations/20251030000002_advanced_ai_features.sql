-- ================================================
-- ADVANCED AI FEATURES - Cost Tracking & Management
-- ================================================

-- AI Usage Logs (already exists, but extend it)
-- Tracks token usage and costs per agent execution
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10, 6);
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS model_used VARCHAR(100);

-- Agent Budgets
-- Set spending limits per agent
CREATE TABLE IF NOT EXISTS public.agent_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  max_daily_cost DECIMAL(10, 2) DEFAULT 10.00,
  max_monthly_cost DECIMAL(10, 2) DEFAULT 100.00,
  current_daily_spent DECIMAL(10, 6) DEFAULT 0,
  current_monthly_spent DECIMAL(10, 6) DEFAULT 0,
  last_reset_daily TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reset_monthly TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auto_pause_on_exceed BOOLEAN DEFAULT true,
  alert_threshold_percent INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys Vault
-- Store agent-specific API keys (encrypted)
CREATE TABLE IF NOT EXISTS public.api_keys_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', etc.
  key_name VARCHAR(255),
  key_hash TEXT NOT NULL, -- Hashed for security
  last_rotated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rotation_interval_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, provider)
);

-- Cost Analytics Summary
-- Pre-aggregated stats for fast dashboard queries
CREATE TABLE IF NOT EXISTS public.cost_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  avg_tokens_per_request DECIMAL(10, 2),
  avg_cost_per_request DECIMAL(10, 6),
  models_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_budgets_agent_id ON public.agent_budgets(agent_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_vault_agent_id ON public.api_keys_vault(agent_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_vault_active ON public.api_keys_vault(is_active);
CREATE INDEX IF NOT EXISTS idx_cost_analytics_agent_date ON public.cost_analytics(agent_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_analytics_date ON public.cost_analytics(date DESC);

-- Functions

-- Reset daily budgets (run via cron)
CREATE OR REPLACE FUNCTION reset_daily_budgets()
RETURNS void AS $$
BEGIN
  UPDATE public.agent_budgets
  SET 
    current_daily_spent = 0,
    last_reset_daily = NOW()
  WHERE last_reset_daily < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Reset monthly budgets (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_budgets()
RETURNS void AS $$
BEGIN
  UPDATE public.agent_budgets
  SET 
    current_monthly_spent = 0,
    last_reset_monthly = NOW()
  WHERE DATE_TRUNC('month', last_reset_monthly) < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Track cost and update budget
CREATE OR REPLACE FUNCTION track_agent_cost(
  p_agent_id UUID,
  p_cost DECIMAL,
  p_tokens INTEGER,
  p_model VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_budget RECORD;
  v_exceeded BOOLEAN := false;
BEGIN
  -- Get current budget
  SELECT * INTO v_budget
  FROM public.agent_budgets
  WHERE agent_id = p_agent_id;
  
  -- Create budget if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.agent_budgets (agent_id)
    VALUES (p_agent_id);
    
    SELECT * INTO v_budget
    FROM public.agent_budgets
    WHERE agent_id = p_agent_id;
  END IF;
  
  -- Update spent amounts
  UPDATE public.agent_budgets
  SET 
    current_daily_spent = current_daily_spent + p_cost,
    current_monthly_spent = current_monthly_spent + p_cost,
    updated_at = NOW()
  WHERE agent_id = p_agent_id;
  
  -- Check if exceeded
  IF (v_budget.current_daily_spent + p_cost) > v_budget.max_daily_cost 
     OR (v_budget.current_monthly_spent + p_cost) > v_budget.max_monthly_cost THEN
    v_exceeded := true;
    
    -- Auto pause if enabled
    IF v_budget.auto_pause_on_exceed THEN
      UPDATE public.ai_agents
      SET status = 'paused', last_error = 'Budget exceeded'
      WHERE id = p_agent_id;
    END IF;
  END IF;
  
  -- Update analytics
  INSERT INTO public.cost_analytics (agent_id, date, total_requests, total_tokens, total_cost)
  VALUES (p_agent_id, CURRENT_DATE, 1, p_tokens, p_cost)
  ON CONFLICT (agent_id, date)
  DO UPDATE SET
    total_requests = cost_analytics.total_requests + 1,
    total_tokens = cost_analytics.total_tokens + p_tokens,
    total_cost = cost_analytics.total_cost + p_cost,
    avg_tokens_per_request = (cost_analytics.total_tokens + p_tokens) / (cost_analytics.total_requests + 1),
    avg_cost_per_request = (cost_analytics.total_cost + p_cost) / (cost_analytics.total_requests + 1);
  
  RETURN v_exceeded;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE public.agent_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to agent_budgets" ON public.agent_budgets FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to api_keys_vault" ON public.api_keys_vault FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to cost_analytics" ON public.cost_analytics FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Grants
GRANT ALL ON public.agent_budgets TO anon;
GRANT ALL ON public.api_keys_vault TO anon;
GRANT ALL ON public.cost_analytics TO anon;

-- Comments
COMMENT ON TABLE public.agent_budgets IS 'Budget limits and spending tracking per agent';
COMMENT ON TABLE public.api_keys_vault IS 'Secure storage for agent-specific API keys';
COMMENT ON TABLE public.cost_analytics IS 'Aggregated cost and usage analytics';
