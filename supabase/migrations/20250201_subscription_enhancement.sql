-- =====================================================
-- Subscription Enhancement Migration
-- =====================================================
-- Add discount codes, feature usage tracking, and webhook retry

-- 1. Discount Codes Table
-- =====================================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value INTEGER NOT NULL DEFAULT 0, -- percent (0-100) or fixed amount in VND
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  applicable_plans TEXT[] DEFAULT ARRAY['pro', 'vip'],
  applicable_cycles TEXT[] DEFAULT ARRAY['monthly', 'yearly'],
  min_amount INTEGER DEFAULT 0, -- minimum order amount to apply
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active, valid_until);

-- 2. Discount Code Usage Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS discount_code_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  original_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  final_amount INTEGER NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_usages_user ON discount_code_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usages_code ON discount_code_usages(discount_code_id);

-- 3. Feature Usage Tracking Table
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  feature_key TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  usage_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_key, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_usage_date ON feature_usage(usage_date);

-- 4. Webhook Logs Table for Retry & Debugging
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_type TEXT NOT NULL DEFAULT 'casso', -- casso, stripe, etc
  payload JSONB NOT NULL,
  signature TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed', 'retry_pending', 'retry_failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  matched_subscription_id UUID REFERENCES user_subscriptions(id),
  matched_user_id UUID REFERENCES auth.users(id),
  amount INTEGER,
  transfer_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- 5. Add billing_cycle to user_subscriptions if not exists
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN billing_cycle TEXT DEFAULT 'monthly';
  END IF;
END $$;

-- 6. Add discount_code_id to user_subscriptions if not exists
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'discount_code_id'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN discount_code_id UUID REFERENCES discount_codes(id);
  END IF;
END $$;

-- 7. RLS Policies
-- =====================================================

-- Discount codes: Public read for active codes, admin write
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active discount codes" ON discount_codes;
CREATE POLICY "Public can view active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

DROP POLICY IF EXISTS "Admin can manage discount codes" ON discount_codes;
CREATE POLICY "Admin can manage discount codes" ON discount_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Feature usage: Users can view own usage, admin can view all
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feature usage" ON feature_usage;
CREATE POLICY "Users can view own feature usage" ON feature_usage
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own feature usage" ON feature_usage;
CREATE POLICY "Users can insert own feature usage" ON feature_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own feature usage" ON feature_usage;
CREATE POLICY "Users can update own feature usage" ON feature_usage
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can manage all feature usage" ON feature_usage;
CREATE POLICY "Admin can manage all feature usage" ON feature_usage
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Webhook logs: Admin only
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view webhook logs" ON webhook_logs;
CREATE POLICY "Admin can view webhook logs" ON webhook_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Discount usage: Users can view own, admin can view all
ALTER TABLE discount_code_usages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own discount usage" ON discount_code_usages;
CREATE POLICY "Users can view own discount usage" ON discount_code_usages
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can view all discount usage" ON discount_code_usages;
CREATE POLICY "Admin can view all discount usage" ON discount_code_usages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. Function to validate and apply discount code
-- =====================================================
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_plan_id TEXT,
  p_billing_cycle TEXT,
  p_amount INTEGER
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_id UUID,
  discount_type TEXT,
  discount_value INTEGER,
  final_amount INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code discount_codes%ROWTYPE;
BEGIN
  -- Find the discount code
  SELECT * INTO v_code FROM discount_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until > NOW())
    AND used_count < max_uses;

  IF v_code IS NULL THEN
    RETURN QUERY SELECT
      false,
      NULL::UUID,
      NULL::TEXT,
      0,
      p_amount,
      'Mã giảm giá không hợp lệ hoặc đã hết hạn'::TEXT;
    RETURN;
  END IF;

  -- Check applicable plans
  IF NOT (p_plan_id = ANY(v_code.applicable_plans)) THEN
    RETURN QUERY SELECT
      false,
      NULL::UUID,
      NULL::TEXT,
      0,
      p_amount,
      'Mã giảm giá không áp dụng cho gói này'::TEXT;
    RETURN;
  END IF;

  -- Check applicable cycles
  IF NOT (p_billing_cycle = ANY(v_code.applicable_cycles)) THEN
    RETURN QUERY SELECT
      false,
      NULL::UUID,
      NULL::TEXT,
      0,
      p_amount,
      'Mã giảm giá không áp dụng cho chu kỳ thanh toán này'::TEXT;
    RETURN;
  END IF;

  -- Check minimum amount
  IF p_amount < v_code.min_amount THEN
    RETURN QUERY SELECT
      false,
      NULL::UUID,
      NULL::TEXT,
      0,
      p_amount,
      FORMAT('Đơn hàng tối thiểu %sđ để áp dụng mã này', v_code.min_amount);
    RETURN;
  END IF;

  -- Calculate discount
  DECLARE
    v_discount INTEGER;
    v_final INTEGER;
  BEGIN
    IF v_code.discount_type = 'percent' THEN
      v_discount := FLOOR(p_amount * v_code.discount_value / 100);
    ELSE
      v_discount := v_code.discount_value;
    END IF;

    -- Don't let discount exceed the amount
    IF v_discount > p_amount THEN
      v_discount := p_amount;
    END IF;

    v_final := p_amount - v_discount;

    RETURN QUERY SELECT
      true,
      v_code.id,
      v_code.discount_type,
      v_discount,
      v_final,
      NULL::TEXT;
  END;
END;
$$;

-- 9. Function to increment discount code usage
-- =====================================================
CREATE OR REPLACE FUNCTION use_discount_code(p_code_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE discount_codes
  SET used_count = used_count + 1, updated_at = NOW()
  WHERE id = p_code_id;
END;
$$;

-- 10. Function to track feature usage (upsert)
-- =====================================================
CREATE OR REPLACE FUNCTION track_feature_usage(
  p_user_id UUID,
  p_feature_key TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  INSERT INTO feature_usage (user_id, feature_key, usage_count, usage_date)
  VALUES (p_user_id, p_feature_key, p_increment, CURRENT_DATE)
  ON CONFLICT (user_id, feature_key, usage_date)
  DO UPDATE SET usage_count = feature_usage.usage_count + p_increment
  RETURNING usage_count INTO v_current_count;

  RETURN v_current_count;
END;
$$;

-- 11. Function to get user's feature usage for current period
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_feature_usage(
  p_user_id UUID,
  p_feature_key TEXT,
  p_period TEXT DEFAULT 'month' -- 'day', 'week', 'month'
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_start_date DATE;
  v_total INTEGER;
BEGIN
  CASE p_period
    WHEN 'day' THEN v_start_date := CURRENT_DATE;
    WHEN 'week' THEN v_start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    WHEN 'month' THEN v_start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    ELSE v_start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  END CASE;

  SELECT COALESCE(SUM(usage_count), 0) INTO v_total
  FROM feature_usage
  WHERE user_id = p_user_id
    AND feature_key = p_feature_key
    AND usage_date >= v_start_date;

  RETURN v_total;
END;
$$;

-- 12. Sample discount codes for testing
-- =====================================================
INSERT INTO discount_codes (code, description, discount_type, discount_value, valid_until, max_uses, applicable_plans)
VALUES
  ('WELCOME10', 'Giảm 10% cho khách mới', 'percent', 10, NOW() + INTERVAL '1 year', 1000, ARRAY['pro', 'vip']),
  ('VIP20', 'Giảm 20% cho gói VIP', 'percent', 20, NOW() + INTERVAL '6 months', 100, ARRAY['vip']),
  ('YEARLY50K', 'Giảm 50K cho gói năm', 'fixed', 50000, NOW() + INTERVAL '3 months', 50, ARRAY['pro', 'vip'])
ON CONFLICT (code) DO NOTHING;

-- Done!
-- =====================================================
COMMENT ON TABLE discount_codes IS 'Mã giảm giá cho subscription';
COMMENT ON TABLE feature_usage IS 'Theo dõi sử dụng tính năng theo user';
COMMENT ON TABLE webhook_logs IS 'Log webhook để debug và retry';
