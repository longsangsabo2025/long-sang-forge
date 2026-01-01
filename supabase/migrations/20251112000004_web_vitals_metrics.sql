-- Web Vitals Metrics Table
-- Stores Core Web Vitals performance data

CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(10) NOT NULL CHECK (metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP')),
  metric_value DECIMAL(10, 2) NOT NULL,
  rating VARCHAR(20) CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  page_url VARCHAR(500) NOT NULL,
  user_agent TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON web_vitals_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_web_vitals_recorded_at ON web_vitals_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals_metrics(rating);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_metric ON web_vitals_metrics(page_url, metric_name, recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for authenticated and anonymous users
CREATE POLICY "Allow insert web vitals" ON web_vitals_metrics
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Allow select for authenticated users
CREATE POLICY "Allow select web vitals" ON web_vitals_metrics
  FOR SELECT 
  TO authenticated
  USING (true);

COMMENT ON TABLE web_vitals_metrics IS 'Stores Core Web Vitals performance metrics (LCP, FID, CLS, etc.)';
COMMENT ON COLUMN web_vitals_metrics.metric_name IS 'Name of the Core Web Vital metric';
COMMENT ON COLUMN web_vitals_metrics.metric_value IS 'Measured value of the metric';
COMMENT ON COLUMN web_vitals_metrics.rating IS 'Performance rating: good, needs-improvement, or poor';
COMMENT ON COLUMN web_vitals_metrics.page_url IS 'URL of the page where metric was measured';
