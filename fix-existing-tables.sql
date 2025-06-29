-- Fix existing tables by adding missing columns
-- Run this in your Supabase SQL Editor

-- 1. Add language column to texts table if it doesn't exist
ALTER TABLE texts ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- 2. Add translation_uk column to dictionary table if it doesn't exist
ALTER TABLE dictionary ADD COLUMN IF NOT EXISTS translation_uk TEXT;

-- 3. Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  native_language VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Update existing texts to have language = 'en' (assuming they're English)
UPDATE texts SET language = 'en' WHERE language IS NULL;

-- 5. Enable RLS for user_preferences if not already enabled
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for user_preferences (drop if exists first)
DROP POLICY IF EXISTS "Users can read their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

CREATE POLICY "Users can read their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create index for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 8. Create index for dictionary translation_uk
CREATE INDEX IF NOT EXISTS idx_dictionary_translation_uk ON dictionary(translation_uk) WHERE translation_uk IS NOT NULL; 