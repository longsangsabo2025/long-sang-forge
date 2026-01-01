-- Project Showcase CMS Database Schema
-- Lưu trữ thông tin các dự án showcase với đầy đủ chi tiết

-- Project Showcase Table
CREATE TABLE IF NOT EXISTS project_showcase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Web App',
  status TEXT DEFAULT 'development' CHECK (status IN ('live', 'development', 'planned', 'maintenance')),
  status_label TEXT, -- Custom status label
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  icon TEXT DEFAULT 'Zap',
  production_url TEXT,
  logo_url TEXT,

  -- Hero Section
  hero_title TEXT,
  hero_description TEXT,
  hero_stats JSONB DEFAULT '[]'::jsonb,
  -- hero_stats format: [{ icon: string, label: string, value: string, color: string }]

  -- Overview Section
  overview_title TEXT DEFAULT 'TỔNG QUAN DỰ ÁN',
  overview_description TEXT,
  objectives JSONB DEFAULT '[]'::jsonb, -- Array of strings
  impacts JSONB DEFAULT '[]'::jsonb, -- Array of strings

  -- Features
  features JSONB DEFAULT '[]'::jsonb,
  -- features format: [{ icon: string, title: string, points: string[], color: string }]

  -- Metrics
  metrics JSONB DEFAULT '[]'::jsonb,
  -- metrics format: [{ label: string, value: string, unit: string }]

  -- Tech Stack
  tech_stack JSONB DEFAULT '[]'::jsonb,
  -- tech_stack format: [{ name: string, category: string, iconifyIcon: string }]

  -- Technical Details
  performance JSONB DEFAULT '[]'::jsonb, -- [{ label, value }]
  infrastructure JSONB DEFAULT '[]'::jsonb, -- [{ label, value }]
  tools JSONB DEFAULT '[]'::jsonb, -- [{ name, iconifyIcon }]

  -- Media
  screenshots JSONB DEFAULT '[]'::jsonb, -- Array of URLs

  -- Tech Architecture (optional, for diagram)
  tech_nodes JSONB DEFAULT '[]'::jsonb,
  tech_connections JSONB DEFAULT '[]'::jsonb,

  -- Chart Data (optional)
  bar_data JSONB DEFAULT '[]'::jsonb,
  line_data JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_showcase_slug ON project_showcase(slug);
CREATE INDEX IF NOT EXISTS idx_project_showcase_status ON project_showcase(status);
CREATE INDEX IF NOT EXISTS idx_project_showcase_category ON project_showcase(category);
CREATE INDEX IF NOT EXISTS idx_project_showcase_updated_at ON project_showcase(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_showcase_display_order ON project_showcase(display_order);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_showcase_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_showcase_updated_at_trigger ON project_showcase;
CREATE TRIGGER project_showcase_updated_at_trigger
  BEFORE UPDATE ON project_showcase
  FOR EACH ROW
  EXECUTE FUNCTION update_project_showcase_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE project_showcase ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can read all projects (for showcase display)
DROP POLICY IF EXISTS "Public can read projects" ON project_showcase;
CREATE POLICY "Public can read projects"
  ON project_showcase
  FOR SELECT
  USING (true);

-- Authenticated users can insert projects
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON project_showcase;
CREATE POLICY "Authenticated users can insert projects"
  ON project_showcase
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update projects
DROP POLICY IF EXISTS "Authenticated users can update projects" ON project_showcase;
CREATE POLICY "Authenticated users can update projects"
  ON project_showcase
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete projects
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON project_showcase;
CREATE POLICY "Authenticated users can delete projects"
  ON project_showcase
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data from existing projects-data.ts
INSERT INTO project_showcase (name, slug, description, category, status, progress, icon, production_url, hero_title, hero_description, hero_stats, overview_title, overview_description, objectives, impacts, features, metrics, tech_stack, performance, infrastructure, screenshots)
VALUES
(
  'SABO Arena',
  'sabo-arena',
  'Nền tảng thi đấu bi-a cho cộng đồng',
  'Mobile App',
  'live',
  95,
  'Zap',
  'https://saboarena.com',
  'SABO ARENA',
  'Nền tảng thi đấu bi-a cho cộng đồng Vũng Tàu - 8 định dạng giải đấu, ELO ranking minh bạch, kiếm SPA Points đổi voucher thật',
  '[{"icon": "Users", "label": "Người Chơi", "value": "1,500+", "color": "neon-green"}, {"icon": "Trophy", "label": "Giải Đấu", "value": "120+", "color": "neon-cyan"}, {"icon": "Cloud", "label": "Câu Lạc Bộ", "value": "15+", "color": "neon-blue"}]'::jsonb,
  'TỔNG QUAN DỰ ÁN',
  'SABO Arena là nền tảng thi đấu bi-a tại Vũng Tàu, tích hợp hệ thống ELO ranking minh bạch, 8 định dạng giải đấu quốc tế, và chương trình SPA Points cho phép người chơi kiếm điểm và đổi voucher thật.',
  '["Xây dựng hệ thống giải đấu bi-a với ELO ranking minh bạch", "Kết nối cộng đồng người chơi bi-a qua mạng xã hội tích hợp", "Hỗ trợ chủ câu lạc bộ quản lý giải đấu tự động"]'::jsonb,
  '["1,500+ người chơi đã tham gia nền tảng", "120+ giải đấu đã tổ chức tại 15+ câu lạc bộ", "Phản hồi tích cực từ cộng đồng người chơi"]'::jsonb,
  '[{"icon": "Trophy", "title": "8 Định Dạng Giải Đấu", "points": ["Single Elimination (SE8, SE16, SE32)", "Double Elimination (DE8, DE16, DE32)", "Round Robin và Swiss System", "Tự động tạo bracket và ghép cặp"], "color": "cyan"}, {"icon": "Target", "title": "ELO Rating Minh Bạch", "points": ["Hệ thống xếp hạng chuẩn quốc tế", "Mọi người bắt đầu từ 1000 điểm", "Công thức toán học công bằng", "Leaderboard real-time"], "color": "blue"}]'::jsonb,
  '[{"label": "Người Chơi", "value": "1,500+", "unit": "Players"}, {"label": "Giải Đấu", "value": "120+", "unit": "Tournaments"}, {"label": "Câu Lạc Bộ", "value": "15+", "unit": "Clubs"}]'::jsonb,
  '[{"name": "Flutter", "category": "Framework", "iconifyIcon": "logos:flutter"}, {"name": "Firebase", "category": "Backend", "iconifyIcon": "logos:firebase"}, {"name": "Supabase", "category": "Database", "iconifyIcon": "logos:supabase-icon"}]'::jsonb,
  '[{"label": "App Launch Time", "value": "1.8s"}, {"label": "Image Load Speed", "value": "200ms"}, {"label": "Frame Rate", "value": "60 FPS"}]'::jsonb,
  '[{"label": "Hosting", "value": "Firebase Hosting"}, {"label": "Database", "value": "Supabase PostgreSQL"}, {"label": "CDN", "value": "Cloudflare"}]'::jsonb,
  '["/images/sabo-arena-1.jpg", "/images/sabo-arena-2.jpg"]'::jsonb
),
(
  'SaboHub',
  'sabohub',
  'Nền tảng quản lý kinh doanh cho doanh nghiệp dịch vụ',
  'Business Management Platform',
  'live',
  90,
  'Database',
  'https://sabohub.vercel.app',
  'SABOHUB',
  'Nền tảng quản lý kinh doanh được thiết kế cho các doanh nghiệp dịch vụ. 8 hệ thống tích hợp: CRM, HRM, POS, Kho, Lịch hẹn, Marketing, Báo cáo & Phân tích',
  '[{"icon": "Database", "label": "Hệ Thống", "value": "8+", "color": "neon-cyan"}, {"icon": "Users", "label": "Người Dùng", "value": "100+", "color": "neon-blue"}, {"icon": "Zap", "label": "Đồng Bộ", "value": "Realtime", "color": "neon-green"}]'::jsonb,
  'TỔNG QUAN DỰ ÁN',
  'SABOHUB là nền tảng quản lý kinh doanh được thiết kế cho các doanh nghiệp dịch vụ, đặc biệt là hệ thống câu lạc bộ bi-a. Với giao diện thân thiện, SABOHUB giúp chủ doanh nghiệp vận hành mọi hoạt động từ một ứng dụng duy nhất.',
  '["Tích hợp 8 hệ thống quản lý trong 1 ứng dụng", "Đồng bộ dữ liệu theo thời gian thực", "Hệ thống phân quyền theo vai trò (RBAC)", "Hỗ trợ đa nền tảng: iOS, Android, Web"]'::jsonb,
  '["Giảm thời gian quản lý hành chính", "Cải thiện hiệu quả vận hành", "Tiết kiệm chi phí với giải pháp all-in-one", "Báo cáo tổng hợp hỗ trợ ra quyết định"]'::jsonb,
  '[{"icon": "CheckCircle2", "title": "Quản Lý Công Việc", "points": ["Phân công rõ ràng trên app", "Theo dõi thời gian thực", "Tự động nhắc nhở"], "color": "cyan"}, {"icon": "ShoppingCart", "title": "Quản Lý Đơn Hàng", "points": ["Order bằng app", "Tính tiền tự động", "Gán bàn cho mỗi order"], "color": "blue"}]'::jsonb,
  '[{"label": "Người Dùng", "value": "100+", "unit": "Users"}, {"label": "Giao Dịch", "value": "5K+", "unit": "Per Month"}, {"label": "CLB Sử Dụng", "value": "5+", "unit": "Clubs"}]'::jsonb,
  '[{"name": "Flutter", "category": "Framework", "iconifyIcon": "logos:flutter"}, {"name": "Supabase", "category": "Backend", "iconifyIcon": "logos:supabase-icon"}, {"name": "PostgreSQL", "category": "Database", "iconifyIcon": "logos:postgresql"}]'::jsonb,
  '[{"label": "App Launch Time", "value": "1.5s"}, {"label": "Sync Speed", "value": "Real-time"}, {"label": "Frame Rate", "value": "60 FPS"}]'::jsonb,
  '[{"label": "Database", "value": "Supabase PostgreSQL"}, {"label": "Auth", "value": "Supabase Auth + RBAC"}, {"label": "CI/CD", "value": "GitHub Actions"}]'::jsonb,
  '[]'::jsonb
),
(
  'AINewbieVN',
  'ainewbievn',
  'Cộng đồng AI & Workflow tự động hóa',
  'Community Platform',
  'live',
  95,
  'Cpu',
  'https://www.ainewbievn.shop',
  'AINEWBIEVN',
  'Nền tảng sản phẩm số AI, workflow tự động hóa, và kết nối nhân tài công nghệ cho người Việt',
  '[{"icon": "Users", "label": "Thành Viên", "value": "500+", "color": "neon-cyan"}, {"icon": "Zap", "label": "Workflows", "value": "50+", "color": "neon-blue"}, {"icon": "Trophy", "label": "Dự Án", "value": "10+", "color": "neon-green"}]'::jsonb,
  'Cộng Đồng AI Việt Nam',
  'AINewbieVN là nền tảng kết nối và phát triển cộng đồng AI tại Việt Nam, cung cấp workflow tự động hóa, sản phẩm AI, và networking cho cộng đồng thành viên công nghệ.',
  '["Xây dựng cộng đồng AI cho người Việt", "Cung cấp workflows tự động hóa", "Kết nối dự án AI và nhân tài công nghệ", "Đào tạo và phát triển kỹ năng AI"]'::jsonb,
  '["500+ thành viên tham gia cộng đồng", "50+ workflows giúp tiết kiệm thời gian", "10+ dự án AI đang phát triển", "Tăng nhận thức về AI trong cộng đồng VN"]'::jsonb,
  '[{"icon": "Cpu", "title": "AI Technology Platform", "points": ["Workflow automation với AI", "AI product marketplace", "Community-driven learning"], "color": "cyan"}, {"icon": "Users", "title": "Talent Network", "points": ["Kết nối AI developers", "Job board cho AI positions", "Mentorship programs"], "color": "blue"}]'::jsonb,
  '[{"label": "Thành Viên", "value": "500+", "unit": "Members"}, {"label": "Workflows", "value": "50+", "unit": "Templates"}, {"label": "Dự Án", "value": "10+", "unit": "Projects"}]'::jsonb,
  '[{"name": "React 18", "category": "Frontend", "iconifyIcon": "logos:react"}, {"name": "TypeScript", "category": "Language", "iconifyIcon": "logos:typescript-icon"}, {"name": "Tailwind CSS", "category": "Styling", "iconifyIcon": "logos:tailwindcss-icon"}]'::jsonb,
  '[{"label": "Page Load", "value": "0.8s"}, {"label": "First Paint", "value": "1.2s"}, {"label": "Bundle Size", "value": "245 KB"}]'::jsonb,
  '[{"label": "Hosting", "value": "Vercel Edge"}, {"label": "CDN", "value": "Vercel CDN"}, {"label": "Deploy", "value": "Auto on Push"}]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
