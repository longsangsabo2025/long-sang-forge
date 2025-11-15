-- SEO Management System - Complete Database Setup
-- Run this in Supabase SQL Editor to create all SEO tables

-- ========================================
-- 1. SEO DOMAINS
-- ========================================
CREATE TABLE IF NOT EXISTS public.seo_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    auto_index BOOLEAN DEFAULT true,
    google_service_account_json JSONB,
    bing_api_key TEXT,
    total_urls INTEGER DEFAULT 0,
    indexed_urls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for seo_domains
ALTER TABLE public.seo_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view domains"
    ON public.seo_domains FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert domains"
    ON public.seo_domains FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update domains"
    ON public.seo_domains FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete domains"
    ON public.seo_domains FOR DELETE
    USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_seo_domains_url ON public.seo_domains(url);
CREATE INDEX IF NOT EXISTS idx_seo_domains_enabled ON public.seo_domains(enabled);

-- ========================================
-- 2. SEO INDEXING QUEUE
-- ========================================
CREATE TABLE IF NOT EXISTS public.seo_indexing_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'indexed', 'failed')),
    search_engine TEXT DEFAULT 'google' CHECK (search_engine IN ('google', 'bing')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    indexed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for seo_indexing_queue
ALTER TABLE public.seo_indexing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view indexing queue"
    ON public.seo_indexing_queue FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage indexing queue"
    ON public.seo_indexing_queue FOR ALL
    USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_seo_queue_domain ON public.seo_indexing_queue(domain_id);
CREATE INDEX IF NOT EXISTS idx_seo_queue_status ON public.seo_indexing_queue(status);
CREATE INDEX IF NOT EXISTS idx_seo_queue_url ON public.seo_indexing_queue(url);

-- ========================================
-- 3. SEO KEYWORDS
-- ========================================
CREATE TABLE IF NOT EXISTS public.seo_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    current_position INTEGER,
    previous_position INTEGER,
    volume TEXT,
    difficulty TEXT,
    target_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, keyword)
);

-- RLS for seo_keywords
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view keywords"
    ON public.seo_keywords FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage keywords"
    ON public.seo_keywords FOR ALL
    USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_seo_keywords_domain ON public.seo_keywords(domain_id);

-- ========================================
-- 4. SEO ANALYTICS
-- ========================================
CREATE TABLE IF NOT EXISTS public.seo_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,2),
    avg_position DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, date)
);

-- RLS for seo_analytics
ALTER TABLE public.seo_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view analytics"
    ON public.seo_analytics FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage analytics"
    ON public.seo_analytics FOR ALL
    USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_seo_analytics_domain ON public.seo_analytics(domain_id);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_date ON public.seo_analytics(date);

-- ========================================
-- 5. SEO SETTINGS
-- ========================================
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_service_account_json JSONB,
    bing_api_key TEXT,
    auto_indexing_enabled BOOLEAN DEFAULT true,
    daily_quota_google INTEGER DEFAULT 200,
    daily_quota_bing INTEGER DEFAULT 100,
    webhook_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for seo_settings
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seo settings"
    ON public.seo_settings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage seo settings"
    ON public.seo_settings FOR ALL
    USING (auth.role() = 'authenticated');

-- ========================================
-- 6. SEO SITEMAPS
-- ========================================
CREATE TABLE IF NOT EXISTS public.seo_sitemaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    total_urls INTEGER DEFAULT 0,
    last_generated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, url)
);

-- RLS for seo_sitemaps
ALTER TABLE public.seo_sitemaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sitemaps"
    ON public.seo_sitemaps FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage sitemaps"
    ON public.seo_sitemaps FOR ALL
    USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_seo_sitemaps_domain ON public.seo_sitemaps(domain_id);

-- ========================================
-- 7. AUTO-UPDATE TRIGGERS
-- ========================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all SEO tables
CREATE TRIGGER update_seo_domains_updated_at BEFORE UPDATE ON public.seo_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_indexing_queue_updated_at BEFORE UPDATE ON public.seo_indexing_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_keywords_updated_at BEFORE UPDATE ON public.seo_keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_analytics_updated_at BEFORE UPDATE ON public.seo_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_sitemaps_updated_at BEFORE UPDATE ON public.seo_sitemaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. FUNCTIONS
-- ========================================

-- Function to update domain stats automatically
CREATE OR REPLACE FUNCTION update_domain_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.seo_domains
    SET 
        total_urls = (
            SELECT COUNT(*) 
            FROM public.seo_indexing_queue 
            WHERE domain_id = NEW.domain_id
        ),
        indexed_urls = (
            SELECT COUNT(*) 
            FROM public.seo_indexing_queue 
            WHERE domain_id = NEW.domain_id 
            AND status = 'indexed'
        )
    WHERE id = NEW.domain_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when indexing queue changes
CREATE TRIGGER update_domain_stats_on_queue_change
    AFTER INSERT OR UPDATE OR DELETE ON public.seo_indexing_queue
    FOR EACH ROW EXECUTE FUNCTION update_domain_stats();

-- ========================================
-- 9. SEED DEFAULT SETTINGS
-- ========================================

INSERT INTO public.seo_settings (
    auto_indexing_enabled,
    daily_quota_google,
    daily_quota_bing
) VALUES (
    true,
    200,
    100
) ON CONFLICT DO NOTHING;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

-- Grant permissions
GRANT ALL ON public.seo_domains TO authenticated;
GRANT ALL ON public.seo_indexing_queue TO authenticated;
GRANT ALL ON public.seo_keywords TO authenticated;
GRANT ALL ON public.seo_analytics TO authenticated;
GRANT ALL ON public.seo_settings TO authenticated;
GRANT ALL ON public.seo_sitemaps TO authenticated;

-- Success!
SELECT 'SEO Management System tables created successfully! ✅' AS message;
