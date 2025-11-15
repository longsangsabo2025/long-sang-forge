-- Quick SEO Tables Creation for longsang.org
-- Run this SQL directly in Supabase SQL Editor

-- Enable extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SEO Keyword Rankings Table
CREATE TABLE IF NOT EXISTS seo_keyword_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL UNIQUE,
  position INTEGER NOT NULL,
  previous_position INTEGER,
  position_change INTEGER,
  search_volume INTEGER DEFAULT 0,
  competition VARCHAR(20) DEFAULT 'medium' CHECK (competition IN ('low', 'medium', 'high')),
  trend VARCHAR(10) DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  tracked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SEO Page Metrics Table  
CREATE TABLE IF NOT EXISTS seo_page_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255) NOT NULL,
  page_type VARCHAR(50) DEFAULT 'blog_post' CHECK (page_type IN ('blog_post', 'tournament', 'agent', 'static')),
  seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  organic_traffic INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  backlinks_count INTEGER DEFAULT 0,
  internal_links_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  page_load_time DECIMAL(5,2) DEFAULT 0,
  mobile_friendly BOOLEAN DEFAULT TRUE,
  indexed_by_google BOOLEAN DEFAULT FALSE,
  featured_snippet BOOLEAN DEFAULT FALSE,
  tracked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_url, tracked_at::date)
);

-- SEO Competitor Analysis Table
CREATE TABLE IF NOT EXISTS seo_competitor_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_domain VARCHAR(255) NOT NULL,
  competitor_name VARCHAR(255),
  our_position INTEGER,
  competitor_position INTEGER,
  keyword VARCHAR(255) NOT NULL,
  search_volume INTEGER DEFAULT 0,
  gap_analysis TEXT,
  opportunities TEXT[],
  tracked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(competitor_domain, keyword, tracked_at::date)
);

-- SEO Backlinks Table
CREATE TABLE IF NOT EXISTS seo_backlinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_domain VARCHAR(255) NOT NULL,
  source_url VARCHAR(500) NOT NULL,
  target_url VARCHAR(500) NOT NULL,
  anchor_text VARCHAR(500),
  link_type VARCHAR(50) DEFAULT 'dofollow' CHECK (link_type IN ('dofollow', 'nofollow', 'sponsored', 'ugc')),
  domain_authority INTEGER DEFAULT 0,
  page_authority INTEGER DEFAULT 0,
  spam_score INTEGER DEFAULT 0,
  link_status VARCHAR(20) DEFAULT 'active' CHECK (link_status IN ('active', 'broken', 'redirect', 'removed')),
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_url, target_url)
);

-- SEO Technical Issues Table
CREATE TABLE IF NOT EXISTS seo_technical_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_url VARCHAR(500),
  issue_description TEXT NOT NULL,
  recommendation TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'ignored')),
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  assigned_to UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SEO Content Performance Table
CREATE TABLE IF NOT EXISTS seo_content_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id VARCHAR(255),
  content_type VARCHAR(50) DEFAULT 'blog_post' CHECK (content_type IN ('blog_post', 'page', 'product', 'tournament')),
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL UNIQUE,
  target_keywords TEXT[],
  content_score INTEGER DEFAULT 0 CHECK (content_score >= 0 AND content_score <= 100),
  keyword_density DECIMAL(5,2) DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  meta_title_length INTEGER DEFAULT 0,
  meta_description_length INTEGER DEFAULT 0,
  h1_count INTEGER DEFAULT 0,
  h2_count INTEGER DEFAULT 0,
  image_count INTEGER DEFAULT 0,
  alt_text_missing INTEGER DEFAULT 0,
  internal_links INTEGER DEFAULT 0,
  external_links INTEGER DEFAULT 0,
  social_shares INTEGER DEFAULT 0,
  organic_traffic INTEGER DEFAULT 0,
  average_position DECIMAL(5,2) DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  time_on_page INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SEO Automation Logs Table
CREATE TABLE IF NOT EXISTS seo_automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  trigger_source VARCHAR(100),
  execution_time INTEGER DEFAULT 0,
  results JSONB,
  error_message TEXT,
  affected_urls TEXT[],
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SEO Reports Table
CREATE TABLE IF NOT EXISTS seo_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type VARCHAR(100) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  report_data JSONB NOT NULL,
  summary TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  generated_by UUID,
  recipients TEXT[],
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_keywords_position ON seo_keyword_rankings(position, tracked_at);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_trend ON seo_keyword_rankings(trend, tracked_at);
CREATE INDEX IF NOT EXISTS idx_seo_pages_score ON seo_page_metrics(seo_score, tracked_at);
CREATE INDEX IF NOT EXISTS idx_seo_pages_type ON seo_page_metrics(page_type, tracked_at);
CREATE INDEX IF NOT EXISTS idx_seo_competitor_domain ON seo_competitor_analysis(competitor_domain, tracked_at);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_status ON seo_backlinks(link_status, last_seen);
CREATE INDEX IF NOT EXISTS idx_seo_issues_severity ON seo_technical_issues(severity, status);
CREATE INDEX IF NOT EXISTS idx_seo_content_score ON seo_content_performance(content_score, last_updated);
CREATE INDEX IF NOT EXISTS idx_seo_automation_status ON seo_automation_logs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_seo_reports_type ON seo_reports(report_type, period_end);

-- Insert sample data for testing
INSERT INTO seo_keyword_rankings (keyword, position, search_volume, competition) 
VALUES 
  ('sabo arena', 1, 1200, 'high'),
  ('longsang automation', 3, 800, 'medium'),
  ('gaming platform vietnam', 8, 2100, 'high')
ON CONFLICT (keyword) DO NOTHING;

INSERT INTO seo_page_metrics (page_url, page_title, page_type, seo_score, organic_traffic)
VALUES 
  ('longsang.org/arena', 'SABO ARENA - Gaming Platform', 'static', 95, 1500),
  ('longsang.org/arena/tournaments', 'Gaming Tournaments', 'tournament', 88, 800),
  ('longsang.org/automation', 'AI Automation Services', 'static', 92, 1200)
ON CONFLICT (page_url, tracked_at::date) DO NOTHING;

-- Success message
SELECT 'SEO Database deployment completed successfully! 🎉' as status;