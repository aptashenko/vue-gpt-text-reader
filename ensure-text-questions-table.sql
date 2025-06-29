-- Ensure text_questions table exists with correct structure
-- Run this in your Supabase SQL Editor

-- 1. Create text_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS text_questions (
  id SERIAL PRIMARY KEY,
  text_id INTEGER REFERENCES texts(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) DEFAULT 'comprehension',
  difficulty VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(text_id, question_number)
);

-- 2. Add any missing columns
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'text_questions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE text_questions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to text_questions';
    END IF;
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'text_questions_text_id_question_number_key'
    ) THEN
        ALTER TABLE text_questions ADD CONSTRAINT text_questions_text_id_question_number_key 
        UNIQUE (text_id, question_number);
        RAISE NOTICE 'Added unique constraint for (text_id, question_number)';
    END IF;
END $$;

-- 3. Enable RLS if not already enabled
ALTER TABLE text_questions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies and recreate them
DROP POLICY IF EXISTS "Allow authenticated users to read text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to insert text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to update text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to delete text_questions" ON text_questions;

-- 5. Create new policies
-- Read policy - allow everyone to read questions
CREATE POLICY "Allow all users to read text_questions" ON text_questions
  FOR SELECT USING (true);

-- Insert policy - allow authenticated users to insert questions
CREATE POLICY "Allow authenticated users to insert text_questions" ON text_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update policy - allow authenticated users to update questions
CREATE POLICY "Allow authenticated users to update text_questions" ON text_questions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Delete policy - allow authenticated users to delete questions
CREATE POLICY "Allow authenticated users to delete text_questions" ON text_questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_questions_text_id ON text_questions(text_id);
CREATE INDEX IF NOT EXISTS idx_text_questions_question_number ON text_questions(question_number);

-- 7. Show the table structure
SELECT 'text_questions table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'text_questions' 
ORDER BY ordinal_position;

-- 8. Show the policies
SELECT 'text_questions RLS policies:' as info;
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'text_questions'
ORDER BY cmd;

-- 9. Test insertion
SELECT 'Testing question insertion...' as test_info;
INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
VALUES (1, 'Test question', 1, 'comprehension', 'A1')
ON CONFLICT (text_id, question_number) DO NOTHING;

SELECT 'Test insertion completed!' as test_result; 