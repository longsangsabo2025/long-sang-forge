-- Migration: Add consultation discount code support
-- Created: 2025-12-31

-- Update existing discount codes to include 'consultation'
UPDATE discount_codes
SET applicable_plans = array_append(applicable_plans, 'consultation')
WHERE NOT ('consultation' = ANY(applicable_plans)
);

-- Create a consultation-specific discount code for testing
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
    'TUVAN10',
    'Giảm 10% phí tư vấn',
    'percent',
    10,
    NOW() + INTERVAL
'1 year',
    100,
    true,
    ARRAY['consultation', 'pro', 'vip'],
    ARRAY['monthly', 'yearly'],
    0
  ),
(
    'TUVAN50K',
    'Giảm 50.000đ phí tư vấn',
    'fixed',
    50000,
    NOW
() + INTERVAL '1 year',
    50,
    true,
    ARRAY['consultation', 'pro', 'vip'],
    ARRAY['monthly', 'yearly'],
    100000
  )
ON CONFLICT
(code) DO NOTHING;
