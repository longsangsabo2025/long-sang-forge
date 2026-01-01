-- ================================================
-- UPGRADE CONTACTS TABLE FOR CRM
-- Add phone, budget, source for customer nurturing
-- ================================================

-- Add new columns to contacts table
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS budget VARCHAR(50),
ADD COLUMN IF NOT EXISTS source VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS followed_up_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Add index for CRM queries
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON public.contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);

-- Comment for documentation
COMMENT ON COLUMN public.contacts.phone IS 'Customer phone number for follow-up';
COMMENT ON COLUMN public.contacts.budget IS 'Estimated budget range';
COMMENT ON COLUMN public.contacts.source IS 'How customer found us (Google, Facebook, Referral, etc.)';
COMMENT ON COLUMN public.contacts.status IS 'Lead status: new, contacted, qualified, converted, lost';
COMMENT ON COLUMN public.contacts.notes IS 'Internal notes for sales team';
COMMENT ON COLUMN public.contacts.followed_up_at IS 'When we last contacted this lead';
COMMENT ON COLUMN public.contacts.converted_at IS 'When lead converted to customer';
