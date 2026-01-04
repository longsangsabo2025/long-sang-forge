-- Performance Optimization Indexes
-- Migration: 20260103_performance_indexes.sql
-- Run in Supabase SQL Editor

-- =================================================
-- INDEX 1: User subscription lookup by user_id + status
-- Used in: useSubscription hook, subscription checks
-- =================================================
CREATE INDEX
IF NOT EXISTS idx_user_subscriptions_user_status
ON user_subscriptions
(user_id, status);

-- =================================================
-- INDEX 2: Expiring subscriptions query
-- Used in: pg_cron expire job, admin dashboard
-- =================================================
CREATE INDEX
IF NOT EXISTS idx_user_subscriptions_expires
ON user_subscriptions
(expires_at)
WHERE status = 'active';

-- =================================================
-- INDEX 3: Chat credits lookup by user + period
-- Used in: get_chat_credits, use_chat_credit functions
-- =================================================
CREATE INDEX
IF NOT EXISTS idx_chat_credits_user_period
ON chat_credits
(user_id, period_start DESC);

-- =================================================
-- INDEX 4: Payment transaction lookup
-- Used in: Payment confirmation, duplicate check
-- =================================================
CREATE INDEX
IF NOT EXISTS idx_user_subscriptions_payment
ON user_subscriptions
(payment_transaction_id)
WHERE payment_transaction_id IS NOT NULL;

-- =================================================
-- INDEX 5: Created_at for recent queries
-- Used in: Admin dashboard sorting
-- =================================================
CREATE INDEX
IF NOT EXISTS idx_user_subscriptions_created
ON user_subscriptions
(created_at DESC);

-- =================================================
-- ANALYZE: Update statistics for query planner
-- =================================================
ANALYZE user_subscriptions;
ANALYZE chat_credits;
ANALYZE subscription_plans;

-- =================================================
-- VERIFY: Check created indexes
-- =================================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('user_subscriptions', 'chat_credits')
ORDER BY tablename, indexname;
