-- ============================================
-- 🔧 FIX: Chat Credits - Reset theo chu kỳ subscription
-- Free: 10 credits/ngày (reset daily - giữ nguyên)
-- Pro/VIP: Reset theo billing cycle (ngày đăng ký)
-- ============================================

-- ============================================
-- Function: get_subscription_billing_date
-- Lấy ngày bắt đầu chu kỳ hiện tại của subscription
-- ============================================
CREATE OR REPLACE FUNCTION get_subscription_billing_date(p_user_id uuid)
RETURNS date
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_start timestamptz;
  v_billing_day int;
  v_current_month_billing date;
BEGIN
  -- Lấy ngày bắt đầu subscription
  SELECT created_at INTO v_subscription_start
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  -- Nếu không có subscription, return ngày đầu tháng (fallback cho free)
  IF v_subscription_start IS NULL THEN
    RETURN date_trunc('month', CURRENT_DATE)::date;
  END IF;

  -- Lấy ngày trong tháng của subscription start (ví dụ: ngày 20)
  v_billing_day := EXTRACT(DAY FROM v_subscription_start)::int;
  
  -- Tính ngày billing của tháng hiện tại
  -- Nếu billing_day > số ngày trong tháng, dùng ngày cuối tháng
  v_current_month_billing := make_date(
    EXTRACT(YEAR FROM CURRENT_DATE)::int,
    EXTRACT(MONTH FROM CURRENT_DATE)::int,
    LEAST(v_billing_day, EXTRACT(DAY FROM (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'))::int)
  );
  
  -- Nếu chưa đến ngày billing tháng này, lấy ngày billing tháng trước
  IF CURRENT_DATE < v_current_month_billing THEN
    v_current_month_billing := (v_current_month_billing - interval '1 month')::date;
  END IF;
  
  -- Đảm bảo không trả về ngày trước subscription_start
  IF v_current_month_billing < v_subscription_start::date THEN
    v_current_month_billing := v_subscription_start::date;
  END IF;
  
  RETURN v_current_month_billing;
END;
$$;

-- ============================================
-- Function: use_chat_credit (FIXED)
-- Reset theo billing cycle thay vì đầu tháng
-- ============================================
CREATE OR REPLACE FUNCTION use_chat_credit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan text;
  v_config jsonb;
  v_period_type text;
  v_credit_limit int;
  v_period_start date;
  v_credits_used int := 0;
BEGIN
  -- Get user's subscription plan
  v_plan := get_user_subscription_plan(p_user_id);
  v_config := get_credit_config(v_plan);
  v_period_type := v_config->>'period_type';
  v_credit_limit := (v_config->>'limit')::int;

  -- Calculate period start based on plan type
  IF v_period_type = 'monthly' THEN
    -- Pro/VIP: Use billing cycle date
    v_period_start := get_subscription_billing_date(p_user_id);
  ELSE
    -- Free: Daily reset
    v_period_start := CURRENT_DATE;
  END IF;

  -- Ensure record exists for today
  INSERT INTO chat_credits (user_id, date, period_type, period_start, subscription_plan, credits_used, credits_limit)
  VALUES (p_user_id, CURRENT_DATE, v_period_type, v_period_start, v_plan, 0, v_credit_limit)
  ON CONFLICT (user_id, date) DO UPDATE SET
    period_type = EXCLUDED.period_type,
    period_start = EXCLUDED.period_start,
    subscription_plan = EXCLUDED.subscription_plan,
    credits_limit = EXCLUDED.credits_limit,
    updated_at = now();

  -- Get current usage for the period
  IF v_period_type = 'monthly' THEN
    -- Sum credits used since billing cycle start
    SELECT COALESCE(SUM(credits_used), 0)
    INTO v_credits_used
    FROM chat_credits
    WHERE user_id = p_user_id
      AND date >= v_period_start;
  ELSE
    -- Daily: just today's usage
    SELECT COALESCE(credits_used, 0)
    INTO v_credits_used
    FROM chat_credits
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;

  -- Check if credits available
  IF v_credits_used >= v_credit_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'credits_used', v_credits_used,
      'credits_limit', v_credit_limit,
      'credits_remaining', 0,
      'plan', v_plan,
      'period_type', v_period_type,
      'period_start', v_period_start,
      'label', v_config->>'label',
      'message', CASE
        WHEN v_period_type = 'monthly' THEN 'Bạn đã hết lượt hỏi chu kỳ này. Đợi chu kỳ mới hoặc nâng cấp gói!'
        ELSE 'Bạn đã hết lượt hỏi hôm nay. Vui lòng quay lại ngày mai!'
      END
    );
  END IF;

  -- Use 1 credit
  UPDATE chat_credits
  SET credits_used = credits_used + 1, updated_at = now()
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  -- Get updated totals
  IF v_period_type = 'monthly' THEN
    SELECT COALESCE(SUM(credits_used), 0)
    INTO v_credits_used
    FROM chat_credits
    WHERE user_id = p_user_id
      AND date >= v_period_start;
  ELSE
    SELECT credits_used
    INTO v_credits_used
    FROM chat_credits
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'credits_used', v_credits_used,
    'credits_limit', v_credit_limit,
    'credits_remaining', v_credit_limit - v_credits_used,
    'plan', v_plan,
    'period_type', v_period_type,
    'period_start', v_period_start,
    'label', v_config->>'label',
    'message', 'OK'
  );
END;
$$;

-- ============================================
-- Function: get_chat_credits (FIXED)
-- Get current credits based on billing cycle
-- ============================================
CREATE OR REPLACE FUNCTION get_chat_credits(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan text;
  v_config jsonb;
  v_period_type text;
  v_credit_limit int;
  v_period_start date;
  v_credits_used int := 0;
  v_next_reset date;
BEGIN
  -- Get user's subscription plan
  v_plan := get_user_subscription_plan(p_user_id);
  v_config := get_credit_config(v_plan);
  v_period_type := v_config->>'period_type';
  v_credit_limit := (v_config->>'limit')::int;

  -- Calculate period start based on plan type
  IF v_period_type = 'monthly' THEN
    v_period_start := get_subscription_billing_date(p_user_id);
    v_next_reset := (v_period_start + interval '1 month')::date;
    
    -- Sum credits used since billing cycle start
    SELECT COALESCE(SUM(credits_used), 0)
    INTO v_credits_used
    FROM chat_credits
    WHERE user_id = p_user_id
      AND date >= v_period_start;
  ELSE
    v_period_start := CURRENT_DATE;
    v_next_reset := CURRENT_DATE + 1;
    
    -- Get today's usage
    SELECT COALESCE(credits_used, 0)
    INTO v_credits_used
    FROM chat_credits
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;

  RETURN jsonb_build_object(
    'credits_used', v_credits_used,
    'credits_limit', v_credit_limit,
    'credits_remaining', GREATEST(0, v_credit_limit - v_credits_used),
    'plan', v_plan,
    'period_type', v_period_type,
    'period_start', v_period_start,
    'next_reset', v_next_reset,
    'label', v_config->>'label'
  );
END;
$$;

-- ============================================
-- COMMENT: Logic giải thích
-- ============================================
COMMENT ON FUNCTION get_subscription_billing_date IS 
'Tính ngày bắt đầu chu kỳ billing hiện tại.
Ví dụ: User đăng ký ngày 20/1
- Ngày 15/2: period_start = 20/1
- Ngày 25/2: period_start = 20/2
- Ngày 5/3: period_start = 20/2 (chưa đến 20/3)';

COMMENT ON FUNCTION use_chat_credit IS
'Trừ 1 credit và trả về trạng thái.
- Free: Reset mỗi ngày (00:00)
- Pro/VIP: Reset theo ngày đăng ký subscription';

COMMENT ON FUNCTION get_chat_credits IS
'Lấy số credit còn lại và thông tin reset.
Bao gồm next_reset để hiển thị cho user';
