-- Investment Applications Table
CREATE TABLE IF NOT EXISTS investment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project Info
  project_id INTEGER NOT NULL,
  project_slug TEXT NOT NULL,
  project_name TEXT NOT NULL,
  
  -- Personal Information (Step 1)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Investment Details (Step 2)
  investment_amount NUMERIC NOT NULL,
  investor_type TEXT NOT NULL CHECK (investor_type IN ('individual', 'institution', 'fund')),
  company_name TEXT,
  investment_purpose TEXT NOT NULL,
  
  -- Experience & Verification (Step 3)
  investment_experience TEXT NOT NULL,
  risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  identity_document TEXT NOT NULL,
  
  -- Legal Agreements (Step 4)
  agree_terms BOOLEAN NOT NULL DEFAULT false,
  agree_risk BOOLEAN NOT NULL DEFAULT false,
  agree_privacy BOOLEAN NOT NULL DEFAULT false,
  
  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'contacted')),
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Project Interest Table (for "Quan Tâm Dự Án" button)
CREATE TABLE IF NOT EXISTS project_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project Info
  project_id INTEGER NOT NULL,
  project_slug TEXT NOT NULL,
  project_name TEXT NOT NULL,
  
  -- User Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'not_interested')),
  contacted_at TIMESTAMP WITH TIME ZONE,
  contacted_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investment_applications_project_slug ON investment_applications(project_slug);
CREATE INDEX IF NOT EXISTS idx_investment_applications_status ON investment_applications(status);
CREATE INDEX IF NOT EXISTS idx_investment_applications_created_at ON investment_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investment_applications_email ON investment_applications(email);

CREATE INDEX IF NOT EXISTS idx_project_interests_project_slug ON project_interests(project_slug);
CREATE INDEX IF NOT EXISTS idx_project_interests_status ON project_interests(status);
CREATE INDEX IF NOT EXISTS idx_project_interests_created_at ON project_interests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_interests_email ON project_interests(email);

-- Enable Row Level Security (RLS)
ALTER TABLE investment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investment_applications
-- Public can insert (submit application)
CREATE POLICY "Anyone can submit investment application"
ON investment_applications FOR INSERT
TO public
WITH CHECK (true);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON investment_applications FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Admin can view all applications
CREATE POLICY "Admin can view all applications"
ON investment_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Admin can update applications
CREATE POLICY "Admin can update applications"
ON investment_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policies for project_interests
-- Public can insert (submit interest)
CREATE POLICY "Anyone can submit project interest"
ON project_interests FOR INSERT
TO public
WITH CHECK (true);

-- Users can view their own interests
CREATE POLICY "Users can view own interests"
ON project_interests FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Admin can view all interests
CREATE POLICY "Admin can view all interests"
ON project_interests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Admin can update interests
CREATE POLICY "Admin can update interests"
ON project_interests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_investment_applications_updated_at
BEFORE UPDATE ON investment_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_interests_updated_at
BEFORE UPDATE ON project_interests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE investment_applications IS 'Stores investment application submissions from the Investment Portal';
COMMENT ON TABLE project_interests IS 'Stores project interest submissions from the "Quan Tâm Dự Án" button';

COMMENT ON COLUMN investment_applications.status IS 'Application status: pending (default), reviewing, approved, rejected, contacted';
COMMENT ON COLUMN project_interests.status IS 'Interest status: new (default), contacted, converted (became investor), not_interested';
