-- Fix: Allow created_by to be NULL for demo users
ALTER TABLE agents 
ALTER COLUMN created_by DROP NOT NULL;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agents' 
  AND column_name = 'created_by';
