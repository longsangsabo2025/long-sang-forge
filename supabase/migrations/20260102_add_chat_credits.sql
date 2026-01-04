-- ============================================
-- 📋 CHAT CREDITS SYSTEM
-- Giới hạn 10 credits/ngày cho mỗi user
-- ============================================

-- Table to track daily chat credits per user
CREATE TABLE
IF NOT EXISTS chat_credits
(
  id uuid DEFAULT gen_random_uuid
() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  credits_used int NOT NULL DEFAULT 0,
  credits_limit int NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now
(),
  updated_at timestamptz DEFAULT now
(),
  UNIQUE
(user_id, date)
);

-- Index for fast lookup
CREATE INDEX
IF NOT EXISTS idx_chat_credits_user_date ON chat_credits
(user_id, date);

-- Enable RLS
ALTER TABLE chat_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own credits
DROP POLICY
IF EXISTS "Users can view own credits" ON chat_credits;
CREATE POLICY "Users can view own credits" ON chat_credits
  FOR
SELECT USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for backend)
DROP POLICY
IF EXISTS "Service role full access" ON chat_credits;
CREATE POLICY "Service role full access" ON chat_credits
  FOR ALL TO service_role USING
(true);

-- ============================================
-- Function: use_chat_credit
-- Check and deduct 1 credit
-- ============================================
CREATE OR REPLACE FUNCTION use_chat_credit
(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record chat_credits%ROWTYPE;
  v_today date := CURRENT_DATE;
BEGIN
  -- Get or create today's record
  INSERT INTO chat_credits
    (user_id, date, credits_used, credits_limit)
  VALUES
    (p_user_id, v_today, 0, 10)
  ON CONFLICT
  (user_id, date) DO NOTHING;

-- Get current record
SELECT *
INTO v_record
FROM chat_credits
WHERE user_id = p_user_id AND date = v_today;

-- Check if credits available
IF v_record.credits_used >= v_record.credits_limit THEN
RETURN jsonb_build_object(
      'success', false,
      'credits_used', v_record.credits_used,
      'credits_limit', v_record.credits_limit,
      'credits_remaining', 0,
      'message', 'Bạn đã hết lượt hỏi hôm nay. Vui lòng quay lại ngày mai!'
    );
END
IF;

  -- Use 1 credit
  UPDATE chat_credits
  SET credits_used = credits_used + 1, updated_at = now()
  WHERE user_id = p_user_id AND date = v_today
RETURNING * INTO v_record;

RETURN jsonb_build_object(
    'success', true,
    'credits_used', v_record.credits_used,
    'credits_limit', v_record.credits_limit,
    'credits_remaining', v_record.credits_limit - v_record.credits_used,
    'message', 'OK'
  );
END;
$$;

-- ============================================
-- Function: get_chat_credits
-- Get current credits (without using)
-- ============================================
CREATE OR REPLACE FUNCTION get_chat_credits
(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record chat_credits%ROWTYPE;
  v_today date := CURRENT_DATE;
BEGIN
  -- Get or create today's record
  INSERT INTO chat_credits
    (user_id, date, credits_used, credits_limit)
  VALUES
    (p_user_id, v_today, 0, 10)
  ON CONFLICT
  (user_id, date) DO NOTHING;

-- Get current record
SELECT *
INTO v_record
FROM chat_credits
WHERE user_id = p_user_id AND date = v_today;

RETURN jsonb_build_object(
    'credits_used', COALESCE(v_record.credits_used, 0),
    'credits_limit', COALESCE(v_record.credits_limit, 10),
    'credits_remaining', COALESCE(v_record.credits_limit - v_record.credits_used, 10)
  );
END;
$$;
