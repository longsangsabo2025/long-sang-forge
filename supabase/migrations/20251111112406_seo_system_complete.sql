-- SEO System Complete Migration for SABO ARENA @ longsang.org
-- Deploy all SEO tracking tables and functions

-- SEO Tracking Tables for SABO ARENA
-- Tạo các bảng để theo dõi SEO performance và analytics

-- Bảng theo dõi keyword rankings
CREATE TABLE IF NOT EXISTS seo_keyword_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL UNIQUE,
  position INTEGER NOT NULL,
  previous_position INTEGER,
  position_change INTEGER GENERATED ALWAYS AS (previous_position - position) STORED,
  search_volume INTEGER DEFAULT 0,
  competition VARCHAR(20) DEFAULT 'medium' CHECK (competition IN ('low', 'medium', 'high')),
  trend VARCHAR(10) DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  tracked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng SEO metrics cho pages
CREATE TABLE IF NOT EXISTS seo_page_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255) NOT NULL,
  page_type VARCHAR(50) DEFAULT 'blog_post' CHECK (page_type IN ('blog_post', 'tournament', 'agent', 'static')),
  seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  organic_traffic INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0, -- seconds
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  backlinks_count INTEGER DEFAULT 0,
  internal_links_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  page_load_time DECIMAL(5,2) DEFAULT 0, -- seconds
  mobile_friendly BOOLEAN DEFAULT TRUE,
  indexed_by_google BOOLEAN DEFAULT FALSE,
  featured_snippet BOOLEAN DEFAULT FALSE,
  tracked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_url, tracked_at::date)
);

-- Bảng competitor analysis
CREATE TABLE IF NOT EXISTS seo_competitor_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_domain VARCHAR(255) NOT NULL,
  estimated_traffic INTEGER DEFAULT 0,
  domain_authority INTEGER DEFAULT 0 CHECK (domain_authority >= 0 AND domain_authority <= 100),
  backlinks_count INTEGER DEFAULT 0,
  referring_domains INTEGER DEFAULT 0,
  organic_keywords INTEGER DEFAULT 0,
  paid_keywords INTEGER DEFAULT 0,
  content_gap_opportunities INTEGER DEFAULT 0,
  overlap_keywords TEXT[], -- Array of shared keywords
  competitor_strengths TEXT[],
  opportunities TEXT[],
  analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(competitor_domain, analyzed_at::date)
);

-- Bảng SEO audit results
CREATE TABLE IF NOT EXISTS seo_audit_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN ('technical', 'content', 'keywords', 'backlinks', 'performance')),
  page_url VARCHAR(500),
  issue_category VARCHAR(100) NOT NULL,
  issue_description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'ignored')),
  recommendations TEXT,
  fix_priority INTEGER DEFAULT 3 CHECK (fix_priority >= 1 AND fix_priority <= 5),
  estimated_impact VARCHAR(20) DEFAULT 'medium' CHECK (estimated_impact IN ('low', 'medium', 'high')),
  assigned_to VARCHAR(100),
  due_date TIMESTAMP,
  resolved_at TIMESTAMP,
  audit_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng content performance analytics
CREATE TABLE IF NOT EXISTS seo_content_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID, -- References blog_posts(id) but made optional for flexibility
  content_type VARCHAR(50) DEFAULT 'blog_post',
  target_keywords TEXT[] NOT NULL,
  primary_keyword VARCHAR(255) NOT NULL,
  keyword_density DECIMAL(5,2) DEFAULT 0,
  title_optimization_score INTEGER DEFAULT 0 CHECK (title_optimization_score >= 0 AND title_optimization_score <= 100),
  meta_description_score INTEGER DEFAULT 0 CHECK (meta_description_score >= 0 AND meta_description_score <= 100),
  content_quality_score INTEGER DEFAULT 0 CHECK (content_quality_score >= 0 AND content_quality_score <= 100),
  user_engagement_score INTEGER DEFAULT 0 CHECK (user_engagement_score >= 0 AND user_engagement_score <= 100),
  social_shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  time_on_page INTEGER DEFAULT 0, -- seconds
  scroll_depth DECIMAL(5,2) DEFAULT 0, -- percentage
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  conversion_events INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng backlink tracking
CREATE TABLE IF NOT EXISTS seo_backlinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_domain VARCHAR(255) NOT NULL,
  source_url VARCHAR(500) NOT NULL,
  target_url VARCHAR(500) NOT NULL,
  anchor_text VARCHAR(255),
  link_type VARCHAR(20) DEFAULT 'dofollow' CHECK (link_type IN ('dofollow', 'nofollow', 'ugc', 'sponsored')),
  domain_authority INTEGER DEFAULT 0 CHECK (domain_authority >= 0 AND domain_authority <= 100),
  page_authority INTEGER DEFAULT 0 CHECK (page_authority >= 0 AND page_authority <= 100),
  spam_score INTEGER DEFAULT 0 CHECK (spam_score >= 0 AND spam_score <= 100),
  link_status VARCHAR(20) DEFAULT 'active' CHECK (link_status IN ('active', 'removed', 'noindex', 'redirect')),
  first_detected TIMESTAMP DEFAULT NOW(),
  last_checked TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_url, target_url)
);

-- Bảng search console data integration
CREATE TABLE IF NOT EXISTS seo_search_console_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url VARCHAR(500) NOT NULL,
  query VARCHAR(500) NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0 GENERATED ALWAYS AS (
    CASE 
      WHEN impressions > 0 THEN ROUND((clicks::DECIMAL / impressions) * 100, 4)
      ELSE 0 
    END
  ) STORED,
  position DECIMAL(5,2) DEFAULT 0,
  date_recorded DATE NOT NULL,
  country_code VARCHAR(3) DEFAULT 'VN',
  device_type VARCHAR(20) DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_url, query, date_recorded, device_type)
);

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON seo_keyword_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_tracked_at ON seo_keyword_rankings(tracked_at);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_position ON seo_keyword_rankings(position);

CREATE INDEX IF NOT EXISTS idx_page_metrics_url ON seo_page_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_page_metrics_type ON seo_page_metrics(page_type);
CREATE INDEX IF NOT EXISTS idx_page_metrics_score ON seo_page_metrics(seo_score);
CREATE INDEX IF NOT EXISTS idx_page_metrics_tracked_at ON seo_page_metrics(tracked_at);

CREATE INDEX IF NOT EXISTS idx_competitor_domain ON seo_competitor_analysis(competitor_domain);
CREATE INDEX IF NOT EXISTS idx_competitor_analyzed_at ON seo_competitor_analysis(analyzed_at);

CREATE INDEX IF NOT EXISTS idx_audit_status ON seo_audit_results(status);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON seo_audit_results(severity);
CREATE INDEX IF NOT EXISTS idx_audit_type ON seo_audit_results(audit_type);

CREATE INDEX IF NOT EXISTS idx_content_performance_content_id ON seo_content_performance(content_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_primary_keyword ON seo_content_performance(primary_keyword);

CREATE INDEX IF NOT EXISTS idx_backlinks_target_url ON seo_backlinks(target_url);
CREATE INDEX IF NOT EXISTS idx_backlinks_source_domain ON seo_backlinks(source_domain);
CREATE INDEX IF NOT EXISTS idx_backlinks_status ON seo_backlinks(link_status);

CREATE INDEX IF NOT EXISTS idx_search_console_url_date ON seo_search_console_data(page_url, date_recorded);
CREATE INDEX IF NOT EXISTS idx_search_console_query ON seo_search_console_data(query);
CREATE INDEX IF NOT EXISTS idx_search_console_date ON seo_search_console_data(date_recorded);

-- Utility function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto-update triggers
CREATE OR REPLACE TRIGGER update_seo_keyword_rankings_updated_at 
  BEFORE UPDATE ON seo_keyword_rankings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_seo_page_metrics_updated_at 
  BEFORE UPDATE ON seo_page_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_seo_competitor_analysis_updated_at 
  BEFORE UPDATE ON seo_competitor_analysis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_seo_audit_results_updated_at 
  BEFORE UPDATE ON seo_audit_results 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_seo_backlinks_updated_at 
  BEFORE UPDATE ON seo_backlinks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analytics views for easy data access

-- SEO overview dashboard view
CREATE OR REPLACE VIEW seo_overview AS
SELECT 
  'keywords' as metric_type,
  COUNT(*)::INTEGER as total_count,
  AVG(position)::INTEGER as avg_position,
  COUNT(*) FILTER (WHERE position <= 10)::INTEGER as top_10_count,
  COUNT(*) FILTER (WHERE position <= 3)::INTEGER as top_3_count
FROM seo_keyword_rankings
WHERE tracked_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
  'pages' as metric_type,
  COUNT(*)::INTEGER as total_count,
  AVG(seo_score)::INTEGER as avg_score,
  COUNT(*) FILTER (WHERE seo_score >= 80)::INTEGER as high_score_count,
  COUNT(*) FILTER (WHERE seo_score >= 90)::INTEGER as excellent_count
FROM seo_page_metrics
WHERE tracked_at >= CURRENT_DATE - INTERVAL '7 days';

-- Top performing content view (generic version without blog_posts dependency)
CREATE OR REPLACE VIEW top_performing_content AS
SELECT 
  scp.content_id,
  scp.primary_keyword,
  scp.content_quality_score,
  scp.user_engagement_score,
  spm.organic_traffic,
  spm.seo_score,
  scp.social_shares,
  scp.time_on_page,
  scp.conversion_events,
  scp.last_updated
FROM seo_content_performance scp
LEFT JOIN seo_page_metrics spm ON spm.page_url LIKE '%' || scp.content_id::text || '%'
WHERE scp.last_updated >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY (scp.content_quality_score + scp.user_engagement_score + COALESCE(spm.seo_score, 0)) DESC
LIMIT 20;

-- SEO issues summary view
CREATE OR REPLACE VIEW seo_issues_summary AS
SELECT 
  audit_type,
  severity,
  status,
  COUNT(*)::INTEGER as issue_count,
  AVG(fix_priority)::DECIMAL(3,1) as avg_priority
FROM seo_audit_results
WHERE audit_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY audit_type, severity, status
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    ELSE 4 
  END,
  issue_count DESC;

-- Sample test data for immediate functionality
INSERT INTO seo_keyword_rankings (keyword, position, previous_position, search_volume, competition, trend) VALUES
('sabo arena longsang', 1, 2, 8900, 'low', 'up'),
('gaming platform vietnam', 15, 18, 2400, 'medium', 'up'),
('esports vietnam longsang', 8, 12, 5600, 'high', 'up'),
('billiards vietnam arena', 3, 4, 1800, 'low', 'down'),
('ai gaming automation longsang', 25, 30, 890, 'medium', 'up'),
('longsang arena tournament', 12, 15, 1200, 'medium', 'up')
ON CONFLICT (keyword) DO UPDATE SET
  previous_position = seo_keyword_rankings.position,
  position = EXCLUDED.position,
  search_volume = EXCLUDED.search_volume,
  competition = EXCLUDED.competition,
  trend = EXCLUDED.trend,
  tracked_at = NOW();

-- Sample page metrics data
INSERT INTO seo_page_metrics (page_url, page_title, page_type, seo_score, organic_traffic, bounce_rate) VALUES
('https://longsang.org/arena', 'SABO ARENA - Gaming Platform', 'static', 85, 1200, 45.5),
('https://longsang.org/arena/tournaments', 'Tournaments - SABO ARENA', 'tournament', 78, 890, 52.3),
('https://longsang.org/blog/gaming-tips', 'Gaming Tips & Strategies', 'blog_post', 82, 650, 38.7)
ON CONFLICT (page_url, tracked_at::date) DO UPDATE SET
  seo_score = EXCLUDED.seo_score,
  organic_traffic = EXCLUDED.organic_traffic,
  bounce_rate = EXCLUDED.bounce_rate,
  updated_at = NOW();

-- Enable Row Level Security
ALTER TABLE seo_keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_page_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_search_console_data ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (can be customized later)
CREATE POLICY "Users can view SEO data" ON seo_keyword_rankings FOR SELECT USING (true);
CREATE POLICY "Users can view page metrics" ON seo_page_metrics FOR SELECT USING (true);
CREATE POLICY "Users can view competitor data" ON seo_competitor_analysis FOR SELECT USING (true);
CREATE POLICY "Users can view audit results" ON seo_audit_results FOR SELECT USING (true);
CREATE POLICY "Users can view content performance" ON seo_content_performance FOR SELECT USING (true);
CREATE POLICY "Users can view backlinks" ON seo_backlinks FOR SELECT USING (true);
CREATE POLICY "Users can view search console data" ON seo_search_console_data FOR SELECT USING (true);

-- Table comments for documentation
COMMENT ON TABLE seo_keyword_rankings IS 'Theo dõi thứ hạng từ khóa trên search engines cho longsang.org';
COMMENT ON TABLE seo_page_metrics IS 'Metrics hiệu suất SEO cho từng trang của longsang.org';
COMMENT ON TABLE seo_competitor_analysis IS 'Phân tích competitor và cơ hội cho longsang.org';
COMMENT ON TABLE seo_audit_results IS 'Kết quả audit SEO và issues cần fix cho longsang.org';
COMMENT ON TABLE seo_content_performance IS 'Hiệu suất content và engagement cho longsang.org';
COMMENT ON TABLE seo_backlinks IS 'Theo dõi backlinks và link building cho longsang.org';
COMMENT ON TABLE seo_search_console_data IS 'Data từ Google Search Console cho longsang.org';
