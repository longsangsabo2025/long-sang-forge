-- App Showcase CMS Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- App Showcase Data Table
CREATE TABLE IF NOT EXISTS app_showcase (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id TEXT UNIQUE NOT NULL,
  app_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  
  -- Hero Section (JSONB for nested data)
  hero JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Branding
  branding JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Download Links
  downloads JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Social Media Links
  social JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Features (array of feature objects)
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- CTA Section
  cta JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_showcase_app_id ON app_showcase(app_id);
CREATE INDEX IF NOT EXISTS idx_app_showcase_status ON app_showcase(status);
CREATE INDEX IF NOT EXISTS idx_app_showcase_updated_at ON app_showcase(updated_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_showcase_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_showcase_updated_at_trigger
  BEFORE UPDATE ON app_showcase
  FOR EACH ROW
  EXECUTE FUNCTION update_app_showcase_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE app_showcase ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can read published apps
CREATE POLICY "Public can read published apps"
  ON app_showcase
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can read all apps (for admin preview)
CREATE POLICY "Authenticated users can read all apps"
  ON app_showcase
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert apps
CREATE POLICY "Authenticated users can insert apps"
  ON app_showcase
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update apps
CREATE POLICY "Authenticated users can update apps"
  ON app_showcase
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only service role can delete (safety)
CREATE POLICY "Only service role can delete apps"
  ON app_showcase
  FOR DELETE
  TO service_role
  USING (true);

-- Insert default SABO Arena data
INSERT INTO app_showcase (
  app_id,
  app_name,
  tagline,
  description,
  hero,
  branding,
  downloads,
  social,
  features,
  cta,
  status,
  published_at
) VALUES (
  'sabo-arena',
  'SABO Arena',
  'Nền tảng thi đấu Bi-a chuyên nghiệp',
  '8 định dạng giải đấu quốc tế, ELO ranking minh bạch, SPA Points đổi voucher thật. Chuyên nghiệp hóa bi-a Việt Nam.',
  '{
    "badge": "Ứng Dụng Thi Đấu Bi-a #1 VN 🎱",
    "title": "SABO ARENA",
    "subtitle": "Nền tảng thi đấu / Bi-a chuyên nghiệp",
    "stats": {
      "users": "1,500+ Người Chơi",
      "rating": "4.8/5.0 Rating",
      "tournaments": "120+ Giải Đấu"
    }
  }'::jsonb,
  '{
    "primaryColor": "#00D9FF",
    "secondaryColor": "#217AFF",
    "accentColor": "#3ECF8E"
  }'::jsonb,
  '{
    "appStore": "https://apps.apple.com/app/sabo-arena",
    "googlePlay": "https://play.google.com/store/apps/details?id=com.saboarena"
  }'::jsonb,
  '{
    "facebook": "https://facebook.com/saboarena",
    "instagram": "https://instagram.com/saboarena",
    "youtube": "https://youtube.com/@saboarena",
    "tiktok": "https://tiktok.com/@saboarena",
    "discord": "https://discord.gg/saboarena",
    "twitter": "https://twitter.com/saboarena"
  }'::jsonb,
  '[
    {
      "id": "home-feed",
      "title": "🏠 Home Feed - Tournament Hub",
      "description": "Theo dõi tất cả giải đấu đang diễn ra và sắp tới. Countdown timer thời gian thực, quick stats hiển thị ELO, SPA Points và Rank badge của bạn ngay trên màn hình chính.",
      "icon": "Trophy",
      "badge": {
        "text": "Core Feature",
        "color": "neon-cyan"
      },
      "stats": [
        { "label": "Real-time Updates", "value": "Cập nhật ngay lập tức", "icon": "Zap" },
        { "label": "Quick Stats", "value": "ELO, SPA, Rank", "icon": "TbTarget" }
      ]
    },
    {
      "id": "bracket-system",
      "title": "🏆 Bracket Visualization - Tournament Tree",
      "description": "Hệ thống bracket trực quan, dễ theo dõi. Xem toàn bộ cây giải đấu từ vòng 1 đến chung kết, cập nhật real-time kết quả và lịch thi đấu của bạn.",
      "icon": "TbTournament",
      "badge": {
        "text": "Tournament Core",
        "color": "neon-blue"
      }
    }
  ]'::jsonb,
  '{
    "heading": "Sẵn sàng tham gia?",
    "description": "Tải ứng dụng SABO Arena ngay hôm nay. Tham gia giải đấu và kiếm SPA Points để đổi voucher thật!",
    "rating": {
      "score": "4.8/5.0",
      "totalUsers": "1,500+ người dùng"
    }
  }'::jsonb,
  'published',
  NOW()
) ON CONFLICT (app_id) DO NOTHING;

-- Storage bucket for app showcase images
-- Run this in Supabase Storage SQL editor or via Dashboard

-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-showcase', 'app-showcase', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for app-showcase bucket

-- Public can view images
CREATE POLICY "Public can view app showcase images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'app-showcase');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload app showcase images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'app-showcase');

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated users can update app showcase images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'app-showcase')
  WITH CHECK (bucket_id = 'app-showcase');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete app showcase images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'app-showcase');

-- Create view for easy querying
CREATE OR REPLACE VIEW app_showcase_published AS
SELECT 
  id,
  app_id,
  app_name,
  tagline,
  description,
  hero,
  branding,
  downloads,
  social,
  features,
  cta,
  published_at,
  updated_at
FROM app_showcase
WHERE status = 'published';

-- Grant access to view
GRANT SELECT ON app_showcase_published TO anon, authenticated;
