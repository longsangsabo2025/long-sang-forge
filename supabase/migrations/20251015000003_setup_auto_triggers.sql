-- ================================================
-- AUTO-TRIGGERS SETUP
-- Database triggers to invoke Edge Functions
-- ================================================

-- Create contacts table if it doesn't exist (for demo/testing)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT false
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert contacts (for contact form)
CREATE POLICY IF NOT EXISTS "Anyone can submit contact form"
ON public.contacts FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated to view contacts
CREATE POLICY IF NOT EXISTS "Authenticated can view contacts"
ON public.contacts FOR SELECT
TO authenticated
USING (true);

-- ================================================
-- Function to increment agent run counts
-- ================================================
CREATE OR REPLACE FUNCTION increment_agent_runs(
  agent_id UUID,
  success BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ai_agents
  SET 
    total_runs = total_runs + 1,
    successful_runs = CASE WHEN success THEN successful_runs + 1 ELSE successful_runs END,
    last_run = NOW(),
    updated_at = NOW()
  WHERE id = agent_id;
END;
$$;

-- ================================================
-- Trigger function to call Edge Function
-- ================================================
CREATE OR REPLACE FUNCTION trigger_content_writer_on_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  request_id BIGINT;
BEGIN
  -- Get Supabase project URL from environment
  -- In production, this would be your actual project URL
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/trigger-content-writer';
  
  -- Call Edge Function asynchronously using pg_net
  -- Note: pg_net extension must be enabled in Supabase
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  ) INTO request_id;
  
  -- Mark contact as processed
  NEW.processed := true;
  
  RETURN NEW;
END;
$$;

-- ================================================
-- Create trigger on contacts table
-- ================================================
DROP TRIGGER IF EXISTS on_contact_submitted ON public.contacts;

CREATE TRIGGER on_contact_submitted
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  WHEN (NEW.processed = false)
  EXECUTE FUNCTION trigger_content_writer_on_contact();

-- ================================================
-- Alternative: Webhook-based trigger (simpler, recommended)
-- ================================================
-- Instead of pg_net, you can use Supabase webhooks:
-- 1. Go to Supabase Dashboard > Database > Webhooks
-- 2. Create webhook for "contacts" table, INSERT event
-- 3. Point to Edge Function URL
-- 4. This is easier and doesn't require pg_net extension

-- ================================================
-- Sample data for testing
-- ================================================
-- Uncomment to insert test contact:
-- INSERT INTO public.contacts (name, email, service, message)
-- VALUES (
--   'Test User',
--   'test@example.com',
--   'Web Development',
--   'I need help building an AI-powered automation system for my business. Can you help?'
-- );

-- ================================================
-- Indexes for performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_processed ON public.contacts(processed) WHERE processed = false;

-- ================================================
-- Comments for documentation
-- ================================================
COMMENT ON TABLE public.contacts IS 'Contact form submissions that trigger automation workflows';
COMMENT ON FUNCTION trigger_content_writer_on_contact() IS 'Automatically triggers Content Writer agent when new contact is submitted';
COMMENT ON FUNCTION increment_agent_runs(UUID, BOOLEAN) IS 'Helper function to update agent run statistics';
