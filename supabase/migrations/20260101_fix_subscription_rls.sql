-- Fix RLS policies for user_subscriptions
-- Run this in Supabase Dashboard > SQL Editor

-- Drop existing policies (if any)
DROP POLICY
IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY
IF EXISTS "Users can create own subscriptions" ON user_subscriptions;
DROP POLICY
IF EXISTS "Service role full access to subscriptions" ON user_subscriptions;
DROP POLICY
IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
DROP POLICY
IF EXISTS "authenticated users can view own" ON user_subscriptions;

-- Ensure RLS is enabled
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR
SELECT
  USING (is_active = true);

CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR
SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON user_subscriptions FOR
INSERT
  WITH CHECK (auth.uid() =
user_id);

-- Service role can do everything (for webhooks, admin)
CREATE POLICY "Service role full access"
  ON user_subscriptions FOR ALL
  USING
(true);

-- Verify
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'user_subscriptions';
