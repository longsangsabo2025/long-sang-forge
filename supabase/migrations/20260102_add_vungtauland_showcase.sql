-- =====================================================
-- Add Vungtauland (Vũng Tàu Dream Homes) to Project Showcase
-- Created: January 2, 2026
-- Description: Real Estate Platform for Vũng Tàu
-- =====================================================

INSERT INTO project_showcase (
  name,
  slug,
  description,
  category,
  status,
  progress,
  icon,
  production_url,
  github_url,
  hero_title,
  hero_description,
  hero_stats,
  overview_title,
  overview_description,
  objectives,
  impacts,
  features,
  metrics,
  tech_stack,
  performance,
  infrastructure,
  tools,
  screenshots,
  my_role,
  team_size,
  start_date,
  is_featured,
  is_active,
  display_order
)
VALUES (
  -- Basic Info
  'Vũng Tàu Dream Homes',
  'vungtauland',
  'Nền tảng bất động sản Vũng Tàu - Tìm kiếm, đăng tin và quản lý bất động sản với giao diện hiện đại',
  'Real Estate Platform',
  'live',
  92,
  'Home',
  'https://vungtauland.vercel.app',
  NULL,

  -- Hero Section
  'VŨNG TÀU DREAM HOMES',
  'Nền tảng bất động sản hiện đại cho thành phố biển Vũng Tàu. Tìm kiếm thông minh, đăng tin dễ dàng, quản lý chuyên nghiệp - tất cả trong một ứng dụng.',

  -- Hero Stats
  '[
    {"icon": "Home", "label": "Bất Động Sản", "value": "200+", "color": "neon-orange"},
    {"icon": "Users", "label": "Người Dùng", "value": "500+", "color": "neon-cyan"},
    {"icon": "MapPin", "label": "Khu Vực", "value": "15+", "color": "neon-blue"}
  ]'::jsonb,

  -- Overview
  'TỔNG QUAN DỰ ÁN',
  'Vũng Tàu Dream Homes là nền tảng bất động sản được xây dựng dành riêng cho thị trường Vũng Tàu. Với giao diện hiện đại, hệ thống tìm kiếm thông minh và quy trình đăng tin đơn giản, ứng dụng giúp kết nối người mua/thuê với chủ sở hữu một cách hiệu quả nhất.',

  -- Objectives
  '[
    "Xây dựng nền tảng bất động sản hiện đại cho thị trường Vũng Tàu",
    "Hệ thống tìm kiếm và lọc thông minh theo nhiều tiêu chí",
    "Giao diện responsive tối ưu cho mọi thiết bị",
    "Tích hợp xác thực và quản lý người dùng an toàn",
    "Admin panel toàn diện để quản lý hệ thống"
  ]'::jsonb,

  -- Impacts
  '[
    "200+ bất động sản được đăng tải trên nền tảng",
    "500+ người dùng đã đăng ký và sử dụng",
    "Giảm thời gian tìm kiếm BĐS cho người dùng",
    "Tăng khả năng tiếp cận khách hàng cho người bán/cho thuê",
    "Xây dựng thương hiệu BĐS uy tín tại Vũng Tàu"
  ]'::jsonb,

  -- Features
  '[
    {
      "icon": "Search",
      "title": "Tìm Kiếm Thông Minh",
      "points": [
        "Lọc theo loại BĐS: Nhà, Đất, Căn hộ, Biệt thự",
        "Tìm theo khu vực, giá, diện tích",
        "Lọc theo trạng thái: Bán, Cho thuê",
        "Sắp xếp theo nhiều tiêu chí"
      ],
      "color": "orange"
    },
    {
      "icon": "FileText",
      "title": "Đăng Tin Dễ Dàng",
      "points": [
        "Form đăng tin trực quan với validation",
        "Upload nhiều hình ảnh chất lượng cao",
        "Mô tả chi tiết với rich text",
        "Xem trước trước khi đăng"
      ],
      "color": "cyan"
    },
    {
      "icon": "User",
      "title": "User Dashboard",
      "points": [
        "Quản lý tin đăng cá nhân",
        "Theo dõi lượt xem và tương tác",
        "Chỉnh sửa và cập nhật tin",
        "Lịch sử hoạt động"
      ],
      "color": "blue"
    },
    {
      "icon": "Shield",
      "title": "Admin Panel",
      "points": [
        "Duyệt và quản lý tin đăng",
        "Quản lý người dùng",
        "Thống kê và báo cáo",
        "Cấu hình hệ thống"
      ],
      "color": "green"
    }
  ]'::jsonb,

  -- Metrics
  '[
    {"label": "Bất Động Sản", "value": "200+", "unit": "Listings"},
    {"label": "Người Dùng", "value": "500+", "unit": "Users"},
    {"label": "Khu Vực", "value": "15+", "unit": "Areas"},
    {"label": "Uptime", "value": "99.9%", "unit": "Availability"}
  ]'::jsonb,

  -- Tech Stack
  '[
    {"name": "React 18", "category": "Frontend", "iconifyIcon": "logos:react"},
    {"name": "TypeScript", "category": "Language", "iconifyIcon": "logos:typescript-icon"},
    {"name": "Vite 7", "category": "Build Tool", "iconifyIcon": "logos:vitejs"},
    {"name": "Tailwind CSS", "category": "Styling", "iconifyIcon": "logos:tailwindcss-icon"},
    {"name": "Shadcn/ui", "category": "UI Components", "iconifyIcon": "simple-icons:shadcnui"},
    {"name": "Supabase", "category": "Backend", "iconifyIcon": "logos:supabase-icon"},
    {"name": "PostgreSQL", "category": "Database", "iconifyIcon": "logos:postgresql"},
    {"name": "TanStack Query", "category": "State Management", "iconifyIcon": "logos:react-query-icon"},
    {"name": "Vitest", "category": "Testing", "iconifyIcon": "logos:vitest"},
    {"name": "Sentry", "category": "Monitoring", "iconifyIcon": "logos:sentry-icon"}
  ]'::jsonb,

  -- Performance
  '[
    {"label": "Build Time", "value": "2.31s"},
    {"label": "Bundle Size", "value": "806 KB"},
    {"label": "Test Coverage", "value": "50%+"},
    {"label": "Lighthouse Score", "value": "95+"}
  ]'::jsonb,

  -- Infrastructure
  '[
    {"label": "Hosting", "value": "Vercel Edge"},
    {"label": "Database", "value": "Supabase PostgreSQL"},
    {"label": "Auth", "value": "Supabase Auth"},
    {"label": "CDN", "value": "Vercel CDN"},
    {"label": "Monitoring", "value": "Sentry + GA4"},
    {"label": "CI/CD", "value": "GitHub Actions"}
  ]'::jsonb,

  -- Tools
  '[
    {"name": "VS Code", "iconifyIcon": "logos:visual-studio-code"},
    {"name": "GitHub", "iconifyIcon": "logos:github-icon"},
    {"name": "Figma", "iconifyIcon": "logos:figma"},
    {"name": "Postman", "iconifyIcon": "logos:postman-icon"}
  ]'::jsonb,

  -- Screenshots
  '[
    "/images/vungtauland/home.jpg",
    "/images/vungtauland/search.jpg",
    "/images/vungtauland/detail.jpg",
    "/images/vungtauland/dashboard.jpg"
  ]'::jsonb,

  -- Additional fields
  'Full-stack Developer & Project Lead',
  1,
  '2025-10-01',
  true,
  true,
  4
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  progress = EXCLUDED.progress,
  icon = EXCLUDED.icon,
  production_url = EXCLUDED.production_url,
  hero_title = EXCLUDED.hero_title,
  hero_description = EXCLUDED.hero_description,
  hero_stats = EXCLUDED.hero_stats,
  overview_title = EXCLUDED.overview_title,
  overview_description = EXCLUDED.overview_description,
  objectives = EXCLUDED.objectives,
  impacts = EXCLUDED.impacts,
  features = EXCLUDED.features,
  metrics = EXCLUDED.metrics,
  tech_stack = EXCLUDED.tech_stack,
  performance = EXCLUDED.performance,
  infrastructure = EXCLUDED.infrastructure,
  tools = EXCLUDED.tools,
  screenshots = EXCLUDED.screenshots,
  my_role = EXCLUDED.my_role,
  team_size = EXCLUDED.team_size,
  start_date = EXCLUDED.start_date,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Verify insertion
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM project_showcase WHERE slug = 'vungtauland') THEN
    RAISE NOTICE '✅ Vungtauland showcase added successfully!';
  ELSE
    RAISE EXCEPTION '❌ Failed to add Vungtauland showcase';
  END IF;
END $$;
