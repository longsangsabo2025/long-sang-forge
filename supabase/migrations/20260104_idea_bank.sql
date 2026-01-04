-- =============================================
-- IDEA BANK / FEATURE LIBRARY SYSTEM
-- Save features from showcases for future reference
-- =============================================

-- Drop old saved_products table if exists (migrate to new system)
-- Note: Keep backup if needed
-- DROP TABLE IF EXISTS saved_products CASCADE;

-- Create new saved_features table
CREATE TABLE IF NOT EXISTS saved_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Source reference
    showcase_slug VARCHAR(255) NOT NULL,
    showcase_name VARCHAR(255),
    
    -- Feature details
    feature_index INTEGER NOT NULL, -- Index in features array
    feature_title VARCHAR(255) NOT NULL,
    feature_points TEXT[], -- The feature points/descriptions
    feature_color VARCHAR(50), -- cyan/blue/green
    
    -- User customization
    user_notes TEXT, -- User's personal notes
    use_case TEXT, -- How they want to use it
    target_project VARCHAR(255), -- Which project they want to apply to
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status VARCHAR(30) DEFAULT 'saved' CHECK (status IN ('saved', 'planning', 'requested', 'in_progress', 'implemented')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique feature per user per showcase
    UNIQUE(user_id, showcase_slug, feature_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_features_user_id ON saved_features(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_features_showcase ON saved_features(showcase_slug);
CREATE INDEX IF NOT EXISTS idx_saved_features_status ON saved_features(status);
CREATE INDEX IF NOT EXISTS idx_saved_features_priority ON saved_features(priority);

-- Enable RLS
ALTER TABLE saved_features ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own saved features
CREATE POLICY "Users can manage own saved features" ON saved_features
    FOR ALL USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_saved_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_saved_features_updated_at ON saved_features;
CREATE TRIGGER trigger_saved_features_updated_at
    BEFORE UPDATE ON saved_features
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_features_updated_at();

-- Comment
COMMENT ON TABLE saved_features IS 'User saved features from project showcases - Idea Bank';
