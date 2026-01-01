-- Migration: Add SANGDEPTRAI test discount code (90% off)
-- Created: 2025-12-30

INSERT INTO discount_codes
  (
  code,
  description,
  discount_type,
  discount_value,
  valid_until,
  max_uses,
  is_active,
  applicable_plans,
  applicable_cycles,
  min_amount
  )
VALUES
  (
    'SANGDEPTRAI',
    'Mã test giảm 90% - Dùng để test thanh toán',
    'percent',
    90,
    NOW() + INTERVAL
'1 year',
  9999,
  true,
  ARRAY['pro', 'vip'],
  ARRAY['monthly', 'yearly'],
  0
) ON CONFLICT
(code) DO
UPDATE SET
  discount_value = 90,
  is_active = true,
  valid_until = NOW() + INTERVAL
'1 year',
  description = 'Mã test giảm 90% - Dùng để test thanh toán',
  updated_at = NOW
();
