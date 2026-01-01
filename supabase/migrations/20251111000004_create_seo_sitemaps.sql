-- Create missing seo_sitemaps table
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

-- Enable RLS
ALTER TABLE public.seo_sitemaps ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view sitemaps" ON public.seo_sitemaps;
CREATE POLICY "Anyone can view sitemaps"
    ON public.seo_sitemaps FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage sitemaps" ON public.seo_sitemaps;
CREATE POLICY "Authenticated users can manage sitemaps"
    ON public.seo_sitemaps FOR ALL
    USING (auth.role() = 'authenticated');

-- Create index
CREATE INDEX IF NOT EXISTS idx_seo_sitemaps_domain ON public.seo_sitemaps(domain_id);

-- Create trigger
DROP TRIGGER IF EXISTS update_seo_sitemaps_updated_at ON public.seo_sitemaps;
CREATE TRIGGER update_seo_sitemaps_updated_at BEFORE UPDATE ON public.seo_sitemaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.seo_sitemaps TO authenticated;

-- Success message
SELECT 'seo_sitemaps table created successfully! ✅' AS message;
