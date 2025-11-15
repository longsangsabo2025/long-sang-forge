-- Web Vitals Metrics Table
-- Stores Core Web Vitals performance data

CREATE TABLE IF NOT EXISTS public.web_vitals_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL, -- LCP, FCP, CLS, INP, TTFB
  metric_value NUMERIC NOT NULL,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  page_url TEXT NOT NULL,
  user_agent TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON public.web_vitals_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON public.web_vitals_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_web_vitals_recorded_at ON public.web_vitals_metrics(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for anonymous tracking)
CREATE POLICY "Anyone can insert web vitals"
  ON public.web_vitals_metrics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Service role can read all
CREATE POLICY "Service role can read all web vitals"
  ON public.web_vitals_metrics
  FOR SELECT
  TO service_role
  USING (true);

COMMENT ON TABLE public.web_vitals_metrics IS 'Stores Core Web Vitals performance metrics (LCP, FCP, CLS, INP, TTFB)';
