-- Create contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(100) NOT NULL,
  budget VARCHAR(50),
  message TEXT NOT NULL,
  subscribe_newsletter BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'new',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_email ON public.contacts(email);

-- Add comment for documentation
COMMENT ON TABLE public.contacts IS 'Stores contact form submissions from the website';

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can insert (submit contact form)
CREATE POLICY "Anyone can insert contacts"
ON public.contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Only authenticated users can view all contacts (for admin dashboard)
CREATE POLICY "Authenticated users can view all contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_contacts_updated_at();