-- ============================================
-- SUBSCRIPTION SYSTEM FOR LONG SANG FORGE
-- Created: 2024-12-30
-- ============================================

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  description TEXT,
  description_vi TEXT,
  price INTEGER NOT NULL DEFAULT 0, -- VND, 0 = free
  duration_days INTEGER NOT NULL DEFAULT 30, -- subscription duration
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'refunded', 'free')),
  payment_amount INTEGER,
  payment_transaction_id TEXT,
  payment_confirmed_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure user has only one active subscription at a time
  CONSTRAINT unique_active_subscription UNIQUE (user_id, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_status ON user_subscriptions(payment_status);

-- Insert default plans
INSERT INTO subscription_plans (id, name, name_vi, description, description_vi, price, duration_days, features, sort_order) VALUES
(
  'free',
  'Free',
  'Miễn Phí',
  'Basic access to AI updates and community',
  'Truy cập cơ bản vào cập nhật AI và cộng đồng',
  0,
  36500, -- ~100 years = forever
  '[
    {"key": "ai_updates", "value": "monthly", "label": "AI Updates", "label_vi": "Cập nhật AI", "desc": "Monthly digest", "desc_vi": "Bản tin hàng tháng"},
    {"key": "product_announcements", "value": "public", "label": "Product News", "label_vi": "Tin sản phẩm", "desc": "Public launch only", "desc_vi": "Chỉ khi ra mắt công khai"},
    {"key": "showcase_access", "value": 3, "label": "Showcase Access", "label_vi": "Xem Showcase", "desc": "3 basic projects", "desc_vi": "3 dự án cơ bản"},
    {"key": "roadmap_access", "value": "public", "label": "Roadmap", "label_vi": "Lộ trình", "desc": "Public milestones", "desc_vi": "Các mốc công khai"},
    {"key": "community", "value": "readonly", "label": "Community", "label_vi": "Cộng đồng", "desc": "Read-only access", "desc_vi": "Chỉ đọc"},
    {"key": "investment_access", "value": false, "label": "Investment", "label_vi": "Đầu tư", "desc": "Not available", "desc_vi": "Không có"},
    {"key": "consultation_discount", "value": 0, "label": "Consultation Discount", "label_vi": "Giảm giá tư vấn", "desc": "0%", "desc_vi": "0%"}
  ]'::jsonb,
  0
),
(
  'pro',
  'Pro',
  'Pro',
  'Weekly updates, early access, and Pro community',
  'Cập nhật hàng tuần, truy cập sớm và cộng đồng Pro',
  49000,
  30,
  '[
    {"key": "ai_updates", "value": "weekly", "label": "AI Updates", "label_vi": "Cập nhật AI", "desc": "Weekly insights", "desc_vi": "Thông tin hàng tuần"},
    {"key": "product_announcements", "value": "early_3days", "label": "Product News", "label_vi": "Tin sản phẩm", "desc": "3 days early access", "desc_vi": "Truy cập sớm 3 ngày"},
    {"key": "showcase_access", "value": 10, "label": "Showcase Access", "label_vi": "Xem Showcase", "desc": "10+ standard projects", "desc_vi": "10+ dự án tiêu chuẩn"},
    {"key": "roadmap_access", "value": "full", "label": "Roadmap", "label_vi": "Lộ trình", "desc": "Full roadmap access", "desc_vi": "Toàn bộ lộ trình"},
    {"key": "community", "value": "pro_channel", "label": "Community", "label_vi": "Cộng đồng", "desc": "Discord Pro channel", "desc_vi": "Kênh Discord Pro"},
    {"key": "investment_access", "value": "notify", "label": "Investment", "label_vi": "Đầu tư", "desc": "Notification only", "desc_vi": "Chỉ thông báo"},
    {"key": "support", "value": "email_48h", "label": "Support", "label_vi": "Hỗ trợ", "desc": "Email (48h response)", "desc_vi": "Email (phản hồi 48h)"},
    {"key": "consultation_discount", "value": 10, "label": "Consultation Discount", "label_vi": "Giảm giá tư vấn", "desc": "10% off", "desc_vi": "Giảm 10%"}
  ]'::jsonb,
  1
),
(
  'vip',
  'VIP',
  'VIP',
  'Real-time updates, priority access, and exclusive benefits',
  'Cập nhật real-time, truy cập ưu tiên và quyền lợi độc quyền',
  99000,
  30,
  '[
    {"key": "ai_updates", "value": "realtime", "label": "AI Updates", "label_vi": "Cập nhật AI", "desc": "Real-time + Early access", "desc_vi": "Real-time + Truy cập sớm"},
    {"key": "product_announcements", "value": "early_7days", "label": "Product News", "label_vi": "Tin sản phẩm", "desc": "7 days early + Beta", "desc_vi": "Sớm 7 ngày + Beta"},
    {"key": "showcase_access", "value": "unlimited", "label": "Showcase Access", "label_vi": "Xem Showcase", "desc": "Premium + Source hints", "desc_vi": "Premium + Gợi ý code"},
    {"key": "roadmap_access", "value": "strategy", "label": "Roadmap", "label_vi": "Lộ trình", "desc": "Strategy + Behind scenes", "desc_vi": "Chiến lược + Hậu trường"},
    {"key": "community", "value": "private_group", "label": "Community", "label_vi": "Cộng đồng", "desc": "Private group + Direct chat", "desc_vi": "Nhóm riêng + Chat trực tiếp"},
    {"key": "investment_access", "value": "priority", "label": "Investment", "label_vi": "Đầu tư", "desc": "Priority + Better terms", "desc_vi": "Ưu tiên + Điều khoản tốt hơn"},
    {"key": "support", "value": "priority_24h", "label": "Support", "label_vi": "Hỗ trợ", "desc": "Priority (24h response)", "desc_vi": "Ưu tiên (phản hồi 24h)"},
    {"key": "consultation_discount", "value": 20, "label": "Consultation Discount", "label_vi": "Giảm giá tư vấn", "desc": "20% off", "desc_vi": "Giảm 20%"}
  ]'::jsonb,
  2
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_vi = EXCLUDED.name_vi,
  description = EXCLUDED.description,
  description_vi = EXCLUDED.description_vi,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Everyone can read plans
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access to subscriptions"
  ON user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Function to get user's current active subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_id TEXT,
  plan_name TEXT,
  plan_name_vi TEXT,
  plan_price INTEGER,
  plan_features JSONB,
  status TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id as subscription_id,
    us.plan_id,
    sp.name as plan_name,
    sp.name_vi as plan_name_vi,
    sp.price as plan_price,
    sp.features as plan_features,
    us.status,
    us.starts_at,
    us.expires_at,
    GREATEST(0, EXTRACT(DAY FROM (us.expires_at - NOW()))::INTEGER) as days_remaining
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.expires_at > NOW()
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific plan or higher
CREATE OR REPLACE FUNCTION user_has_plan(p_user_id UUID, p_min_plan TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_order INTEGER;
  v_user_plan_order INTEGER;
BEGIN
  -- Get minimum plan order
  SELECT sort_order INTO v_plan_order
  FROM subscription_plans WHERE id = p_min_plan;

  IF v_plan_order IS NULL THEN
    RETURN false;
  END IF;

  -- Get user's current plan order
  SELECT sp.sort_order INTO v_user_plan_order
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.expires_at > NOW()
  ORDER BY sp.sort_order DESC
  LIMIT 1;

  -- If no subscription, treat as free (order 0)
  IF v_user_plan_order IS NULL THEN
    v_user_plan_order := 0;
  END IF;

  RETURN v_user_plan_order >= v_plan_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE subscription_plans IS 'Available subscription plans (Free, Pro, VIP)';
COMMENT ON TABLE user_subscriptions IS 'User subscription records';
COMMENT ON FUNCTION get_user_subscription IS 'Get user active subscription with plan details';
COMMENT ON FUNCTION user_has_plan IS 'Check if user has minimum plan level';
