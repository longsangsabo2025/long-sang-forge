-- ================================================
-- SUBSCRIPTION SYSTEM - SAAS MULTI-TENANT
-- ================================================
-- Create subscription plans and user subscriptions
-- Author: AI Assistant
-- Date: 2025-01-11
-- ================================================

-- ================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'enterprise'
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Feature Limits
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Limits
    max_agents INTEGER DEFAULT 1,
    max_workflows INTEGER DEFAULT 10,
    max_api_calls INTEGER DEFAULT 1000,
    max_storage_mb INTEGER DEFAULT 100,
    max_credentials INTEGER DEFAULT 3,
    max_seo_websites INTEGER DEFAULT 1,
    max_team_members INTEGER DEFAULT 1,
    
    -- Flags
    has_google_drive BOOLEAN DEFAULT false,
    has_webhooks BOOLEAN DEFAULT false,
    has_priority_support BOOLEAN DEFAULT false,
    has_advanced_analytics BOOLEAN DEFAULT false,
    has_custom_branding BOOLEAN DEFAULT false,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. USER SUBSCRIPTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    
    -- Subscription Info
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial', 'past_due'
    billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly', 'lifetime'
    
    -- Dates
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ================================================
-- 3. USAGE TRACKING TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Current Period Usage
    period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Counters
    api_calls_count INTEGER DEFAULT 0,
    workflows_executed INTEGER DEFAULT 0,
    storage_used_mb DECIMAL(10,2) DEFAULT 0,
    agents_created INTEGER DEFAULT 0,
    credentials_stored INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, period_start)
);

-- ================================================
-- 4. PAYMENT HISTORY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    
    -- Payment Info
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
    
    -- Stripe Info
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    stripe_receipt_url TEXT,
    
    -- Metadata
    description TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 5. FEATURE FLAGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_key TEXT NOT NULL UNIQUE,
    feature_name TEXT NOT NULL,
    description TEXT,
    
    -- Plans that have access
    free_plan BOOLEAN DEFAULT false,
    pro_plan BOOLEAN DEFAULT false,
    enterprise_plan BOOLEAN DEFAULT false,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 6. INSERT DEFAULT SUBSCRIPTION PLANS
-- ================================================

-- Free Plan
INSERT INTO public.subscription_plans (
    name, display_name, description,
    price_monthly, price_yearly,
    max_agents, max_workflows, max_api_calls, max_storage_mb, max_credentials, max_seo_websites, max_team_members,
    has_google_drive, has_webhooks, has_priority_support, has_advanced_analytics, has_custom_branding,
    sort_order,
    features
) VALUES (
    'free',
    'Free',
    'Perfect for getting started',
    0, 0,
    1, 10, 1000, 100, 3, 1, 1,
    false, false, false, false, false,
    1,
    '{
        "ai_agents": "1 agent",
        "workflows": "10 per month",
        "api_calls": "1,000 per month",
        "storage": "100 MB",
        "credentials": "3 items",
        "seo_monitoring": "1 website",
        "team_members": "1 user",
        "support": "Community support"
    }'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Pro Plan
INSERT INTO public.subscription_plans (
    name, display_name, description,
    price_monthly, price_yearly,
    max_agents, max_workflows, max_api_calls, max_storage_mb, max_credentials, max_seo_websites, max_team_members,
    has_google_drive, has_webhooks, has_priority_support, has_advanced_analytics, has_custom_branding,
    sort_order,
    features
) VALUES (
    'pro',
    'Pro',
    'For professionals and growing teams',
    19.00, 190.00,
    5, 100, 50000, 5120, 50, 5, 3,
    true, true, true, true, false,
    2,
    '{
        "ai_agents": "5 agents",
        "workflows": "100 per month",
        "api_calls": "50,000 per month",
        "storage": "5 GB",
        "credentials": "50 items",
        "seo_monitoring": "5 websites",
        "team_members": "3 users",
        "google_drive": "Full integration",
        "webhooks": "Custom webhooks",
        "support": "Priority email support",
        "analytics": "Advanced analytics"
    }'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Enterprise Plan
INSERT INTO public.subscription_plans (
    name, display_name, description,
    price_monthly, price_yearly,
    max_agents, max_workflows, max_api_calls, max_storage_mb, max_credentials, max_seo_websites, max_team_members,
    has_google_drive, has_webhooks, has_priority_support, has_advanced_analytics, has_custom_branding,
    sort_order,
    features
) VALUES (
    'enterprise',
    'Enterprise',
    'For large teams and organizations',
    99.00, 990.00,
    999999, 999999, 999999999, 51200, 999999, 20, 10,
    true, true, true, true, true,
    3,
    '{
        "ai_agents": "Unlimited agents",
        "workflows": "Unlimited",
        "api_calls": "Unlimited",
        "storage": "50 GB",
        "credentials": "Unlimited",
        "seo_monitoring": "20 websites",
        "team_members": "10 users",
        "google_drive": "Full integration",
        "webhooks": "Custom webhooks",
        "support": "Priority email + phone",
        "analytics": "Advanced analytics",
        "custom_branding": "White label",
        "dedicated_support": "Dedicated account manager"
    }'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 7. INSERT DEFAULT FEATURE FLAGS
-- ================================================

INSERT INTO public.feature_flags (feature_key, feature_name, description, free_plan, pro_plan, enterprise_plan) VALUES
('google_drive', 'Google Drive Integration', 'Full Google Drive file management', false, true, true),
('webhooks', 'Custom Webhooks', 'Create custom webhook integrations', false, true, true),
('advanced_analytics', 'Advanced Analytics', 'Detailed analytics and reports', false, true, true),
('priority_support', 'Priority Support', 'Email and phone support', false, true, true),
('custom_branding', 'Custom Branding', 'White label customization', false, false, true),
('team_collaboration', 'Team Collaboration', 'Multiple team members', false, true, true),
('api_access', 'API Access', 'Full API access', false, true, true),
('seo_automation', 'SEO Automation', 'Automated SEO monitoring', false, true, true)
ON CONFLICT (feature_key) DO NOTHING;

-- ================================================
-- 8. CREATE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);

-- ================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Subscription Plans - Anyone can view
CREATE POLICY "Anyone can view subscription plans"
    ON public.subscription_plans FOR SELECT
    USING (is_active = true);

-- User Subscriptions - Users can view their own
CREATE POLICY "Users can view their own subscription"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
    ON public.user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Usage Tracking - Users can view their own
CREATE POLICY "Users can view their own usage"
    ON public.usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- Payment History - Users can view their own
CREATE POLICY "Users can view their own payments"
    ON public.payment_history FOR SELECT
    USING (auth.uid() = user_id);

-- Feature Flags - Anyone can view
CREATE POLICY "Anyone can view feature flags"
    ON public.feature_flags FOR SELECT
    USING (is_active = true);

-- ================================================
-- 10. FUNCTIONS
-- ================================================

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TABLE(
    plan_name TEXT,
    plan_display_name TEXT,
    status TEXT,
    features JSONB,
    limits JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.name,
        sp.display_name,
        us.status,
        sp.features,
        jsonb_build_object(
            'max_agents', sp.max_agents,
            'max_workflows', sp.max_workflows,
            'max_api_calls', sp.max_api_calls,
            'max_storage_mb', sp.max_storage_mb,
            'max_credentials', sp.max_credentials,
            'max_seo_websites', sp.max_seo_websites,
            'max_team_members', sp.max_team_members
        ) as limits
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
    AND us.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION has_feature_access(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_plan_name TEXT;
    v_has_access BOOLEAN := false;
BEGIN
    -- Get user's plan
    SELECT sp.name INTO v_plan_name
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
    AND us.status = 'active';
    
    -- Check feature access
    IF v_plan_name = 'free' THEN
        SELECT free_plan INTO v_has_access FROM public.feature_flags WHERE feature_key = p_feature_key;
    ELSIF v_plan_name = 'pro' THEN
        SELECT pro_plan INTO v_has_access FROM public.feature_flags WHERE feature_key = p_feature_key;
    ELSIF v_plan_name = 'enterprise' THEN
        SELECT enterprise_plan INTO v_has_access FROM public.feature_flags WHERE feature_key = p_feature_key;
    END IF;
    
    RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track usage
CREATE OR REPLACE FUNCTION track_usage(
    p_user_id UUID,
    p_metric TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    v_period_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current period start (beginning of month)
    v_period_start := date_trunc('month', NOW());
    
    -- Insert or update usage
    INSERT INTO public.usage_tracking (user_id, period_start, period_end)
    VALUES (p_user_id, v_period_start, v_period_start + INTERVAL '1 month')
    ON CONFLICT (user_id, period_start) DO NOTHING;
    
    -- Update specific metric
    IF p_metric = 'api_calls' THEN
        UPDATE public.usage_tracking 
        SET api_calls_count = api_calls_count + p_increment, updated_at = NOW()
        WHERE user_id = p_user_id AND period_start = v_period_start;
    ELSIF p_metric = 'workflows' THEN
        UPDATE public.usage_tracking 
        SET workflows_executed = workflows_executed + p_increment, updated_at = NOW()
        WHERE user_id = p_user_id AND period_start = v_period_start;
    ELSIF p_metric = 'agents' THEN
        UPDATE public.usage_tracking 
        SET agents_created = agents_created + p_increment, updated_at = NOW()
        WHERE user_id = p_user_id AND period_start = v_period_start;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 11. TRIGGER TO AUTO-ASSIGN FREE PLAN TO NEW USERS
-- ================================================

CREATE OR REPLACE FUNCTION auto_assign_free_plan()
RETURNS TRIGGER AS $$
DECLARE
    v_free_plan_id UUID;
BEGIN
    -- Get Free plan ID
    SELECT id INTO v_free_plan_id FROM public.subscription_plans WHERE name = 'free';
    
    -- Assign free plan to new user
    INSERT INTO public.user_subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        NEW.id,
        v_free_plan_id,
        'active',
        NOW(),
        NOW() + INTERVAL '100 years' -- Free plan never expires
    );
    
    -- Initialize usage tracking
    INSERT INTO public.usage_tracking (
        user_id,
        period_start,
        period_end
    ) VALUES (
        NEW.id,
        date_trunc('month', NOW()),
        date_trunc('month', NOW()) + INTERVAL '1 month'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created_assign_plan ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_plan
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_free_plan();

-- ================================================
-- 12. GRANT PERMISSIONS
-- ================================================

GRANT SELECT ON public.subscription_plans TO authenticated, anon;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT SELECT, UPDATE ON public.usage_tracking TO authenticated;
GRANT SELECT ON public.payment_history TO authenticated;
GRANT SELECT ON public.feature_flags TO authenticated, anon;

GRANT EXECUTE ON FUNCTION get_user_plan(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_feature_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_usage(UUID, TEXT, INTEGER) TO authenticated, service_role;

-- ================================================
-- DONE!
-- ================================================
