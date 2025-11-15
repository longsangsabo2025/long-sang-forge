-- =============================================
-- ACADEMY FOUNDATION TABLES
-- Date: November 14, 2025
-- Purpose: Gamification, Study Groups, Live Sessions, Achievements
-- =============================================

-- =============================================
-- 1. USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL, -- 'first_lesson', 'first_agent_deployed', 'first_dollar', 'first_client', 'ten_clients', 'saas_launched'
  achievement_name TEXT NOT NULL,
  xp_awarded INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Flexible data: { amount: 500, client_name: "ABC Corp", deployment_url: "https://..." }
  earned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- =============================================
-- 2. USER XP & LEVEL TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  total_achievements INTEGER DEFAULT 0,
  total_courses_completed INTEGER DEFAULT 0,
  total_revenue_generated DECIMAL(10,2) DEFAULT 0, -- Track student earnings
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user_xp FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_total_xp ON user_xp(total_xp DESC); -- For leaderboard

-- =============================================
-- 3. STUDY GROUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL, -- 'quick_win', 'scale_up', 'business_mastery'
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 0,
  created_by UUID,
  is_active BOOLEAN DEFAULT TRUE,
  meeting_schedule TEXT, -- e.g., "Every Monday 7pm GMT+7"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_creator FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_study_groups_level ON study_groups(level);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_active ON study_groups(is_active);

-- =============================================
-- 4. STUDY GROUP MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- 'member', 'moderator', 'admin'
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_member FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_group_member UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);

-- =============================================
-- 5. LIVE SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL, -- 'code_along', 'qa', 'demo_day', 'workshop'
  instructor_id UUID,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_attendees INTEGER DEFAULT 100,
  current_attendees INTEGER DEFAULT 0,
  meeting_url TEXT, -- Zoom/Google Meet link
  recording_url TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_instructor FOREIGN KEY (instructor_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled_at ON live_sessions(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_sessions_is_completed ON live_sessions(is_completed);

-- =============================================
-- 6. LIVE SESSION ATTENDEES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS live_session_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  attendance_duration_minutes INTEGER DEFAULT 0,
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendee FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_session_attendee UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_live_session_attendees_session_id ON live_session_attendees(session_id);
CREATE INDEX IF NOT EXISTS idx_live_session_attendees_user_id ON live_session_attendees(user_id);

-- =============================================
-- 7. PROJECT SUBMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  demo_url TEXT,
  screenshots JSONB DEFAULT '[]', -- Array of image URLs
  submission_files JSONB DEFAULT '[]', -- Array of file paths in Supabase Storage
  status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected', 'needs_revision'
  ai_review JSONB, -- AI-generated feedback from GPT-4
  instructor_feedback TEXT,
  grade DECIMAL(5,2), -- Out of 100
  xp_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_submission_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  -- Note: lesson_id and course_id foreign keys removed until those tables exist
);

CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_lesson_id ON project_submissions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_course_id ON project_submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_project_submissions_submitted_at ON project_submissions(submitted_at DESC);

-- =============================================
-- 8. STUDENT REVENUE TRACKING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS student_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  revenue_source TEXT NOT NULL, -- 'client_project', 'saas_subscription', 'marketplace_sale', 'affiliate'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  client_name TEXT,
  project_description TEXT,
  metadata JSONB DEFAULT '{}',
  earned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_revenue_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_revenue_user_id ON student_revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_student_revenue_earned_at ON student_revenue(earned_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger: Update user XP when achievement awarded
CREATE OR REPLACE FUNCTION update_user_xp_on_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total XP and achievement count
  UPDATE user_xp
  SET 
    total_xp = total_xp + NEW.xp_awarded,
    total_achievements = total_achievements + 1,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- Insert user_xp row if doesn't exist
  INSERT INTO user_xp (user_id, total_xp, total_achievements)
  VALUES (NEW.user_id, NEW.xp_awarded, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Calculate new level (every 1000 XP = 1 level)
  UPDATE user_xp
  SET 
    current_level = FLOOR(total_xp / 1000) + 1,
    xp_to_next_level = 1000 - (total_xp % 1000)
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_xp
AFTER INSERT ON user_achievements
FOR EACH ROW
EXECUTE FUNCTION update_user_xp_on_achievement();

-- Trigger: Update study group member count
CREATE OR REPLACE FUNCTION update_study_group_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE study_groups
    SET current_members = current_members + 1, updated_at = NOW()
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE study_groups
    SET current_members = current_members - 1, updated_at = NOW()
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_study_group_member_count
AFTER INSERT OR DELETE ON study_group_members
FOR EACH ROW
EXECUTE FUNCTION update_study_group_count();

-- Trigger: Update live session attendee count
CREATE OR REPLACE FUNCTION update_live_session_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE live_sessions
    SET current_attendees = current_attendees + 1, updated_at = NOW()
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE live_sessions
    SET current_attendees = current_attendees - 1, updated_at = NOW()
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_live_session_attendee_count
AFTER INSERT OR DELETE ON live_session_attendees
FOR EACH ROW
EXECUTE FUNCTION update_live_session_count();

-- Trigger: Update student total revenue
CREATE OR REPLACE FUNCTION update_student_total_revenue()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_xp
  SET 
    total_revenue_generated = total_revenue_generated + NEW.amount,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_student_revenue_update
AFTER INSERT ON student_revenue
FOR EACH ROW
EXECUTE FUNCTION update_student_total_revenue();

-- =============================================
-- SAMPLE DATA (For Testing)
-- =============================================

-- Sample Study Groups
INSERT INTO study_groups (name, description, level, max_members, meeting_schedule) VALUES
('Quick Win Warriors', 'Students working on their first AI Agent (Week 1-2)', 'quick_win', 10, 'Every Monday & Thursday 7pm GMT+7'),
('Scale Masters', 'Scaling from 1 to 10 clients (Week 3-6)', 'scale_up', 10, 'Every Tuesday & Friday 8pm GMT+7'),
('Business Titans', 'Building SaaS/Agency (Week 7-12)', 'business_mastery', 8, 'Every Wednesday 9pm GMT+7');

-- Sample Live Sessions (Next 4 weeks)
INSERT INTO live_sessions (title, description, session_type, scheduled_at, duration_minutes, max_attendees, meeting_url) VALUES
('Build Your First AI Agent Live', 'Code-along workshop: Deploy AI chatbot in 2 hours', 'code_along', NOW() + INTERVAL '3 days', 120, 100, 'https://zoom.us/j/example1'),
('Client Acquisition Masterclass', 'How to find and close your first $500 client', 'workshop', NOW() + INTERVAL '5 days', 90, 100, 'https://zoom.us/j/example2'),
('Demo Day: Show Your Projects', 'Students present their AI Agents to the community', 'demo_day', NOW() + INTERVAL '7 days', 120, 50, 'https://zoom.us/j/example3'),
('Q&A: Scaling to $5K/month', 'Live Q&A about scaling your AI automation business', 'qa', NOW() + INTERVAL '10 days', 60, 100, 'https://zoom.us/j/example4');

-- Achievement Types Reference (Documentation)
COMMENT ON TABLE user_achievements IS 'Student achievements with XP rewards
Achievement Types:
- first_lesson: Completed first lesson (10 XP)
- first_agent_deployed: Deployed first AI Agent (100 XP)
- first_dollar: Earned first dollar (500 XP)
- first_client: Closed first client (1000 XP)
- ten_clients: Reached 10 clients (5000 XP)
- saas_launched: Launched SaaS product (10000 XP)
- course_completed: Finished a course (varies by course)
- perfect_score: Got 100% on project (200 XP)
';

-- =============================================
-- RLS POLICIES (Row Level Security)
-- =============================================

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_session_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_revenue ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own data
CREATE POLICY user_achievements_select ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_xp_select ON user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY project_submissions_select ON project_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY student_revenue_select ON student_revenue FOR SELECT USING (auth.uid() = user_id);

-- Policies: Users can insert their own data
CREATE POLICY user_achievements_insert ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY project_submissions_insert ON project_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY student_revenue_insert ON student_revenue FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies: Study groups and live sessions are public (read-only for all authenticated users)
CREATE POLICY study_groups_select ON study_groups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY live_sessions_select ON live_sessions FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Users can join/leave study groups and register for live sessions
CREATE POLICY study_group_members_select ON study_group_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY study_group_members_insert ON study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY study_group_members_delete ON study_group_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY live_session_attendees_select ON live_session_attendees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY live_session_attendees_insert ON live_session_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY live_session_attendees_delete ON live_session_attendees FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- VIEWS FOR LEADERBOARDS
-- =============================================

-- Top XP Earners
CREATE OR REPLACE VIEW leaderboard_xp AS
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  xp.total_xp,
  xp.current_level,
  xp.total_achievements,
  xp.total_courses_completed,
  ROW_NUMBER() OVER (ORDER BY xp.total_xp DESC) as rank
FROM user_xp xp
JOIN auth.users u ON u.id = xp.user_id
ORDER BY xp.total_xp DESC
LIMIT 100;

-- Top Revenue Generators
CREATE OR REPLACE VIEW leaderboard_revenue AS
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  xp.total_revenue_generated,
  xp.total_xp,
  xp.current_level,
  ROW_NUMBER() OVER (ORDER BY xp.total_revenue_generated DESC) as rank
FROM user_xp xp
JOIN auth.users u ON u.id = xp.user_id
WHERE xp.total_revenue_generated > 0
ORDER BY xp.total_revenue_generated DESC
LIMIT 100;

-- =============================================
-- SUCCESS!
-- =============================================
COMMENT ON SCHEMA public IS 'Academy Foundation Tables Created Successfully!
Tables: 8
Triggers: 4
Views: 2
Sample Data: 3 study groups, 4 live sessions
Ready for gamification, achievements, and community features!
';
