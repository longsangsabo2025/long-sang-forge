-- Add payment tracking fields to consultations table
-- Run this migration in Supabase SQL Editor

-- Add payment-related columns
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_amount INTEGER;

-- Add index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_consultations_payment_status
ON consultations(payment_status);

-- Add index for transaction ID lookups
CREATE INDEX IF NOT EXISTS idx_consultations_payment_tx
ON consultations(payment_transaction_id);

-- Comment for documentation
COMMENT ON COLUMN consultations.payment_status IS 'Payment status: pending, paid, refunded, free';
COMMENT ON COLUMN consultations.payment_transaction_id IS 'Bank transaction ID from Casso webhook';
COMMENT ON COLUMN consultations.payment_confirmed_at IS 'When payment was confirmed';
COMMENT ON COLUMN consultations.payment_amount IS 'Payment amount in VND';
