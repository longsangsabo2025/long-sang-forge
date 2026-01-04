-- Add RLS policies for saved_features table
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE saved_features ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own saved features
CREATE POLICY "Users can view own saved features" 
ON saved_features FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own saved features
CREATE POLICY "Users can insert own saved features" 
ON saved_features FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own saved features
CREATE POLICY "Users can update own saved features" 
ON saved_features FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own saved features
CREATE POLICY "Users can delete own saved features" 
ON saved_features FOR DELETE 
USING (auth.uid() = user_id);
