-- =====================================================
-- CONSULTATION DELIVERABLES & ACTION ITEMS
-- Elon Musk Strategy: Create sticky platform with continuous value
-- =====================================================

-- Bảng lưu tài liệu/deliverables từ mỗi cuộc tư vấn
CREATE TABLE
IF NOT EXISTS public.consultation_deliverables
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations
(id) ON
DELETE CASCADE,
  title VARCHAR(255)
NOT NULL,
  description TEXT,
  file_url TEXT, -- Link Google Drive hoặc storage
  file_type VARCHAR
(50), -- pdf, doc, spreadsheet, presentation, video, link
  category VARCHAR
(100), -- summary, analysis, proposal, report, resource, other
  is_public BOOLEAN DEFAULT false, -- User có thể share không
  created_by UUID REFERENCES auth.users
(id),
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- Bảng lưu các action items/bước tiếp theo
CREATE TABLE
IF NOT EXISTS public.consultation_action_items
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations
(id) ON
DELETE CASCADE,
  title VARCHAR(255)
NOT NULL,
  description TEXT,
  due_date DATE,
  priority VARCHAR
(20) DEFAULT 'medium' CHECK
(priority IN
('low', 'medium', 'high', 'urgent')),
  status VARCHAR
(20) DEFAULT 'pending' CHECK
(status IN
('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to VARCHAR
(50) DEFAULT 'client' CHECK
(assigned_to IN
('client', 'consultant', 'both')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- Bảng lưu notes/comments cho mỗi consultation (timeline)
CREATE TABLE
IF NOT EXISTS public.consultation_notes
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations
(id) ON
DELETE CASCADE,
  author_id UUID
REFERENCES auth.users
(id),
  author_type VARCHAR
(20) DEFAULT 'consultant' CHECK
(author_type IN
('client', 'consultant', 'system')),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false, -- Private notes only visible to consultant
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- Indexes
CREATE INDEX
IF NOT EXISTS idx_deliverables_consultation ON public.consultation_deliverables
(consultation_id);
CREATE INDEX
IF NOT EXISTS idx_action_items_consultation ON public.consultation_action_items
(consultation_id);
CREATE INDEX
IF NOT EXISTS idx_action_items_status ON public.consultation_action_items
(status);
CREATE INDEX
IF NOT EXISTS idx_notes_consultation ON public.consultation_notes
(consultation_id);

-- Enable RLS
ALTER TABLE public.consultation_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliverables
CREATE POLICY "Users can view deliverables for their consultations"
  ON public.consultation_deliverables FOR
SELECT
  USING (
    EXISTS (
      SELECT 1
  FROM public.consultations c
  WHERE c.id = consultation_id
    AND (c.client_email = auth.jwt() ->> 'email' OR c.consultant_id = auth.uid())
    )
  );

CREATE POLICY "Consultants can manage deliverables"
  ON public.consultation_deliverables FOR ALL
  USING
(
    EXISTS
(
      SELECT 1
FROM public.consultations c
WHERE c.id = consultation_id AND c.consultant_id = auth.uid()
    )
);

-- RLS Policies for action items
CREATE POLICY "Users can view action items for their consultations"
  ON public.consultation_action_items FOR
SELECT
  USING (
    EXISTS (
      SELECT 1
  FROM public.consultations c
  WHERE c.id = consultation_id
    AND (c.client_email = auth.jwt() ->> 'email' OR c.consultant_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their action items"
  ON public.consultation_action_items FOR
UPDATE
  USING (
    EXISTS (
      SELECT 1
FROM public.consultations c
WHERE c.id = consultation_id
  AND (c.client_email = auth.jwt() ->> 'email' OR c.consultant_id = auth.uid())
    )
);

CREATE POLICY "Consultants can manage action items"
  ON public.consultation_action_items FOR ALL
  USING
(
    EXISTS
(
      SELECT 1
FROM public.consultations c
WHERE c.id = consultation_id AND c.consultant_id = auth.uid()
    )
);

-- RLS Policies for notes
CREATE POLICY "Users can view non-private notes"
  ON public.consultation_notes FOR
SELECT
  USING (
    EXISTS (
      SELECT 1
  FROM public.consultations c
  WHERE c.id = consultation_id
    AND (
        (c.client_email = auth.jwt() ->> 'email' AND is_private = false)
    OR c.consultant_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create notes"
  ON public.consultation_notes FOR
INSERT
  WITH CHECK
  (
  EXISTS (
  
ELECT 1 FROM public.consult

  WHERE c.id = consultatio
  AND (c.client_email = auth.jwt() ->> 'email' OR c.consultant_id = auth.uid())
    )
);

CREATE POLICY "Consultants can manage all notes"
  ON public.consultation_notes FOR ALL
  USING
(
    EXISTS
(
      SELECT 1
FROM public.consultations c
WHERE c.id = consultation_id AND c.consultant_id = auth.uid()
    )
);

-- Add user_id to consultations for better user lookup
ALTER TABLE public.consultations ADD COLUMN
IF NOT EXISTS user_id UUID REFERENCES auth.users
(id);
CREATE INDEX
IF NOT EXISTS idx_consultations_user ON public.consultations
(user_id);

-- Update RLS to include user_id matching
DROP POLICY
IF EXISTS "Users can view their own consultations" ON public.consultations;
CREATE POLICY "Users can view their own consultations"
  ON public.consultations FOR
SELECT
  USING (
    client_email = auth.jwt() ->> 'email'
    OR user_id = auth.uid()
    OR consultant_id = auth.uid()
  );

-- Allow users to update their consultations (for reschedule)
CREATE POLICY "Users can update their own consultations"
  ON public.consultations FOR
UPDATE
  USING (
    client_email = auth.jwt() ->> 'email'
OR user_id = auth.uid
()
  );

-- Triggers for updated_at
CREATE TRIGGER update_deliverables_updated_at
  BEFORE
UPDATE ON public.consultation_deliverables
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_action_items_updated_at
  BEFORE
UPDATE ON public.consultation_action_items
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_notes_updated_at
  BEFORE
UPDATE ON public.consultation_notes
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
