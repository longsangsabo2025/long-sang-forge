-- ============================================
-- 📋 CHAT CREDITS UPGRADE - Per Subscription Plan
-- Free: 10 credits/ngày (reset daily)
-- Pro: 500 credits/tháng (reset monthly)
-- VIP: 2000 credits/tháng (reset monthly)
-- ============================================

-- Add columns for monthly tracking
ALTER TABLE chat_credits
ADD COLUMN
IF NOT EXISTS period_type text DEFAULT 'daily' CHECK
(period_type IN
('daily', 'monthly')),
ADD COLUMN
IF NOT EXISTS period_start date DEFAULT CURRENT_DATE,
ADD COLUMN
IF NOT EXISTS subscription_plan text DEFAULT 'free';

-- Create index for period lookups
CREATE INDEX
IF NOT EXISTS idx_chat_credits_period ON chat_credits
(user_id, period_type, period_start);

-- ============================================
-- Function: get_user_subscription_plan
-- Returns the current subscription plan for a user
-- ============================================
CREATE OR REPLACE FUNCTION get_user_subscription_plan
(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id text;
BEGIN
  SELECT plan_id
  INTO v_plan_id
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(v_plan_id
  , 'free');
END;
$$;

-- ============================================
-- Function: get_credit_config
-- Returns credit limit based on subscription plan
-- ============================================
CREATE OR REPLACE FUNCTION get_credit_config
(p_plan text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  CASE p_plan
    WHEN 'vip' THEN
  RETURN jsonb_build_object(
        'limit', 2000,
        'period_type', 'monthly',
        'label', '2000/tháng'
      );
  WHEN 'pro' THEN
  RETURN jsonb_build_object(
        'limit', 500,
        'period_type', 'monthly',
        'label', '500/tháng'
      );
  ELSE
  -- 'free' or unknown
  RETURN jsonb_build_object(
        'limit', 10,
        'period_type', 'daily',
        'label', '10/ngày'
      );
END
CASE;
END;
$$;

-- ============================================
-- Function: use_chat_credit (UPGRADED)
-- Check subscription and deduct 1 credit accordingly
-- ============================================
CREATE OR REPLACE FUNCTION use_chat_credit
(p_user_id uuid)
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
  v_record chat_credits%ROWTYPE;
BEGIN
  -- Get user's subscription plan
  v_plan := get_user_subscription_plan
(p_user_id);
  v_config := get_credit_config
(v_plan);
  v_period_type := v_config->>'period_type';
  v_credit_limit :=
(v_config->>'limit')::int;

-- Calculate period start
IF v_period_type = 'monthly' THEN
    v_period_start := date_trunc
('month', CURRENT_DATE)::date;
  ELSE
    v_period_start := CURRENT_DATE;
END
IF;

  -- Get or create record for this period
  INSERT INTO chat_credits
  (user_id, date, period_type, period_start, subscription_plan, credits_used, credits_limit)
VALUES
  (p_user_id, CURRENT_DATE, v_period_type, v_period_start, v_plan, 0, v_credit_limit)
ON CONFLICT
(user_id, date) DO
UPDATE SET
    period_type = EXCLUDED.period_type,
    period_start = EXCLUDED.period_start,
    subscription_plan = EXCLUDED.subscription_plan,
    credits_limit = EXCLUDED.credits_limit,
    updated_at = now();

-- Get current usage for the period
IF v_period_type = 'monthly' THEN
SELECT COALESCE(SUM(credits_used), 0) as total_used
INTO v_record.credits_used
FROM chat_credits
WHERE user_id = p_user_id
  AND period_type = 'monthly'
  AND period_start = v_period_start;
ELSE
SELECT *
INTO v_record
FROM chat_credits
WHERE user_id = p_user_id AND date = CURRENT_DATE;
END
IF;

  -- Check if credits available
  IF v_record.credits_used >= v_credit_limit THEN
RETURN jsonb_build_object(
      'success', false,
      'credits_used', v_record.credits_used,
      'credits_limit', v_credit_limit,
      'credits_remaining', 0,
      'plan', v_plan,
      'period_type', v_period_type,
      'label', v_config->>'label',
      'message', CASE
        WHEN v_period_type = 'monthly' THEN 'Bạn đã hết lượt hỏi tháng này!'
        ELSE 'Bạn đã hết lượt hỏi hôm nay. Vui lòng quay lại ngày mai!'
      END
    );
END
IF;

  -- Use 1 credit
  UPDATE chat_credits
  SET credits_used = credits_used + 1, updated_at = now()
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

-- Get updated totals
IF v_period_type = 'monthly' THEN
SELECT COALESCE(SUM(credits_used), 0)
INTO v_record.credits_used
FROM chat_credits
WHERE user_id = p_user_id
  AND period_type = 'monthly'
  AND period_start = v_period_start;
ELSE
SELECT credits_used
INTO v_record.credits_used
FROM chat_credits
WHERE user_id = p_user_id AND date = CURRENT_DATE;
END
IF;

  RETURN jsonb_build_object(
    'success', true,
    'credits_used', v_record.credits_used,
    'credits_limit', v_credit_limit,
    'credits_remaining', v_credit_limit - v_record.credits_used,
    'plan', v_plan,
    'period_type', v_period_type,
    'label', v_config->>'label',
    'message', 'OK'
  );
END;
$$;

-- ============================================
-- Function: get_chat_credits (UPGRADED)
-- Get current credits without using
-- ============================================
CREATE OR REPLACE FUNCTION get_chat_credits
(p_user_id uuid)
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
  v_plan := get_user_subscription_plan
(p_user_id);
  v_config := get_credit_config
(v_plan);
  v_period_type := v_config->>'period_type';
  v_credit_limit :=
(v_config->>'limit')::int;

-- Calculate period start
IF v_period_type = 'monthly' THEN
    v_period_start := date_trunc
('month', CURRENT_DATE)::date;

-- Sum all credits for this month
SELECT COALESCE(SUM(credits_used), 0)
INTO v_credits_used
FROM chat_credits
WHERE user_id = p_user_id
  AND period_type = 'monthly'
  AND period_start = v_period_start;
ELSE
-- Get today's usage
SELECT COALESCE(credits_used, 0)
INTO v_credits_used
FROM chat_credits
WHERE user_id = p_user_id AND date = CURRENT_DATE;
END
IF;

  RETURN jsonb_build_object(
    'credits_used', v_credits_used,
    'credits_limit', v_credit_limit,
    'credits_remaining', GREATEST(0, v_credit_limit - v_credits_used),
    'plan', v_plan,
    'period_type', v_period_type,
    'label', v_config->>'label'
  );
END;
$$;
