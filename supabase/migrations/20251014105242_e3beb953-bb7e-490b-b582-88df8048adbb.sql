-- Fix security warning: Set search_path for the function
-- First drop the trigger, then the function, then recreate both

DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
DROP FUNCTION IF EXISTS public.update_contacts_updated_at();

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_contacts_updated_at();