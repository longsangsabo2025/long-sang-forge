-- =============================================
-- USER WORKSPACE: Ideas & Projects Tables
-- =============================================

-- 1. User Projects Table (Create first for foreign key reference)
CREATE TABLE IF NOT EXISTS user_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    category VARCHAR(100) DEFAULT 'personal',
    start_date DATE,
    target_date DATE,
    budget_estimate DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'VND',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    cover_image TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    collaborators UUID[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Ideas Table (Brainstorming)
CREATE TABLE IF NOT EXISTS user_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    color VARCHAR(20) DEFAULT '#3B82F6',
    is_pinned BOOLEAN DEFAULT FALSE,
    related_project_id UUID REFERENCES user_projects(id) ON DELETE SET NULL,
    ai_suggestions JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project Tasks Table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    order_index INTEGER DEFAULT 0,
    parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Saved Products (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_slug VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) DEFAULT 'showcase',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_slug, product_type)
);

-- 5. Idea Comments (for collaboration)
CREATE TABLE IF NOT EXISTS idea_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES user_ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES idea_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON user_projects(status);
CREATE INDEX IF NOT EXISTS idx_user_projects_created_at ON user_projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_ideas_user_id ON user_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON user_ideas(status);
CREATE INDEX IF NOT EXISTS idx_user_ideas_category ON user_ideas(category);
CREATE INDEX IF NOT EXISTS idx_user_ideas_created_at ON user_ideas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);

CREATE INDEX IF NOT EXISTS idx_saved_products_user_id ON saved_products(user_id);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE user_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_comments ENABLE ROW LEVEL SECURITY;

-- User Projects: Users can see their own + public projects
CREATE POLICY "Users can view own or public projects" ON user_projects
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create own projects" ON user_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON user_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON user_projects
    FOR DELETE USING (auth.uid() = user_id);

-- User Ideas: Users can only see their own ideas
CREATE POLICY "Users can view own ideas" ON user_ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ideas" ON user_ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON user_ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON user_ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Project Tasks
CREATE POLICY "Users can view tasks of own projects" ON project_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage tasks of own projects" ON project_tasks
    FOR ALL USING (auth.uid() = user_id);

-- Saved Products
CREATE POLICY "Users can manage own saved products" ON saved_products
    FOR ALL USING (auth.uid() = user_id);

-- Idea Comments
CREATE POLICY "Users can view comments on own ideas" ON idea_comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_ideas WHERE id = idea_comments.idea_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create comments" ON idea_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_projects_updated_at ON user_projects;
CREATE TRIGGER update_user_projects_updated_at
    BEFORE UPDATE ON user_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_ideas_updated_at ON user_ideas;
CREATE TRIGGER update_user_ideas_updated_at
    BEFORE UPDATE ON user_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
