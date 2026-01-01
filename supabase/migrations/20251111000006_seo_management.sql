-- SEO Management Tables for Long Sang Forge

-- Table: seo_domains
-- Lưu thông tin các domains cần quản lý SEO
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

-- Table: seo_indexing_queue
-- Lưu trạng thái indexing của từng URL
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

-- Table: seo_keywords
-- Theo dõi rankings của keywords
CREATE TABLE IF NOT EXISTS public.seo_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    current_position INTEGER,
    previous_position INTEGER,
    volume TEXT, -- 'High', 'Medium', 'Low'
    difficulty TEXT, -- '★☆☆', '★★☆', '★★★'
    target_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, keyword)
);

-- Table: seo_analytics
-- Lưu thống kê SEO theo ngày
CREATE TABLE IF NOT EXISTS public.seo_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    organic_traffic INTEGER DEFAULT 0,
    total_indexed INTEGER DEFAULT 0,
    top_rankings INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain_id, date)
);

-- Table: seo_settings
-- Lưu cấu hình hệ thống SEO
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_api_enabled BOOLEAN DEFAULT true,
    google_daily_quota_limit INTEGER DEFAULT 200,
    bing_api_enabled BOOLEAN DEFAULT false,
    auto_submit_new_content BOOLEAN DEFAULT true,
    sitemap_auto_update BOOLEAN DEFAULT true,
    retry_failed_after_hours INTEGER DEFAULT 24,
    search_console_webhook TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.seo_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_domains_enabled ON public.seo_domains(enabled);
CREATE INDEX IF NOT EXISTS idx_seo_indexing_queue_status ON public.seo_indexing_queue(status);
CREATE INDEX IF NOT EXISTS idx_seo_indexing_queue_domain ON public.seo_indexing_queue(domain_id);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_domain ON public.seo_keywords(domain_id);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_domain_date ON public.seo_analytics(domain_id, date DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_seo_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_seo_domains_updated_at ON public.seo_domains;
CREATE TRIGGER update_seo_domains_updated_at
    BEFORE UPDATE ON public.seo_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_indexing_queue_updated_at ON public.seo_indexing_queue;
CREATE TRIGGER update_seo_indexing_queue_updated_at
    BEFORE UPDATE ON public.seo_indexing_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_keywords_updated_at ON public.seo_keywords;
CREATE TRIGGER update_seo_keywords_updated_at
    BEFORE UPDATE ON public.seo_keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON public.seo_settings;
CREATE TRIGGER update_seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.seo_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_indexing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can manage SEO
CREATE POLICY "Authenticated users can view SEO domains"
    ON public.seo_domains FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert SEO domains"
    ON public.seo_domains FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update SEO domains"
    ON public.seo_domains FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete SEO domains"
    ON public.seo_domains FOR DELETE
    TO authenticated
    USING (true);

-- Similar policies for other tables
CREATE POLICY "Authenticated users can manage indexing queue"
    ON public.seo_indexing_queue FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage keywords"
    ON public.seo_keywords FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view analytics"
    ON public.seo_analytics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage settings"
    ON public.seo_settings FOR ALL
    TO authenticated
    USING (true);
