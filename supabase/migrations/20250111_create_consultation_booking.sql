-- Tạo bảng lưu cấu hình thời gian làm việc
CREATE TABLE IF NOT EXISTS public.availability_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_of_week, start_time, end_time)
);

-- Tạo bảng lưu các ngày nghỉ/không làm việc
CREATE TABLE IF NOT EXISTS public.unavailable_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tạo bảng lưu các cuộc tư vấn
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  consultation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  consultation_type VARCHAR(100),
  notes TEXT,
  meeting_link TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- Tạo bảng lưu các loại tư vấn
CREATE TABLE IF NOT EXISTS public.consultation_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price DECIMAL(10, 2),
  color VARCHAR(7), -- Hex color code
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_consultations_consultant ON public.consultations(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_email ON public.consultations(client_email);
CREATE INDEX IF NOT EXISTS idx_availability_user ON public.availability_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_unavailable_dates_user ON public.unavailable_dates(user_id);

-- Enable RLS
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unavailable_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho availability_settings
CREATE POLICY "Users can view all availability settings"
  ON public.availability_settings FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own availability settings"
  ON public.availability_settings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies cho unavailable_dates
CREATE POLICY "Users can view all unavailable dates"
  ON public.unavailable_dates FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own unavailable dates"
  ON public.unavailable_dates FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies cho consultations
CREATE POLICY "Anyone can create consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own consultations"
  ON public.consultations FOR SELECT
  USING (
    auth.uid() = consultant_id OR
    client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Consultants can update their consultations"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = consultant_id);

CREATE POLICY "Consultants can delete their consultations"
  ON public.consultations FOR DELETE
  USING (auth.uid() = consultant_id);

-- RLS Policies cho consultation_types
CREATE POLICY "Anyone can view consultation types"
  ON public.consultation_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage consultation types"
  ON public.consultation_types FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_availability_settings_updated_at
  BEFORE UPDATE ON public.availability_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_types_updated_at
  BEFORE UPDATE ON public.consultation_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default consultation types
INSERT INTO public.consultation_types (name, description, duration_minutes, color) VALUES
  ('Tư vấn AI Agent', 'Tư vấn phát triển và tích hợp AI Agent vào doanh nghiệp', 60, '#3B82F6'),
  ('Tư vấn Automation', 'Tư vấn tự động hóa quy trình kinh doanh', 60, '#10B981'),
  ('Tư vấn SEO', 'Tư vấn chiến lược SEO và content marketing', 45, '#F59E0B'),
  ('Tư vấn nhanh', 'Tư vấn nhanh giải đáp thắc mắc', 30, '#8B5CF6')
ON CONFLICT DO NOTHING;
