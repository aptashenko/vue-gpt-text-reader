-- Create missing tables and set up the complete database structure
-- Run this in your Supabase SQL Editor

-- 1. Create texts table if it doesn't exist
CREATE TABLE IF NOT EXISTS texts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create dictionary table if it doesn't exist
CREATE TABLE IF NOT EXISTS dictionary (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  translation_en TEXT,
  translation_fr TEXT,
  translation_es TEXT,
  translation_de TEXT,
  translation_uk TEXT,
  translation_ru TEXT,
  part_of_speech VARCHAR(50) DEFAULT 'noun',
  difficulty VARCHAR(50) DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(word, language)
);

-- 3. Create text_questions table (this was missing!)
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

-- 4. Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  native_language VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Enable RLS for all tables
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for texts table
DROP POLICY IF EXISTS "Allow authenticated users to read texts" ON texts;
DROP POLICY IF EXISTS "Allow authenticated users to insert texts" ON texts;
DROP POLICY IF EXISTS "Allow authenticated users to update texts" ON texts;
DROP POLICY IF EXISTS "Allow authenticated users to delete texts" ON texts;

CREATE POLICY "Allow all users to read texts" ON texts
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert texts" ON texts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update texts" ON texts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete texts" ON texts
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Create RLS policies for dictionary table
DROP POLICY IF EXISTS "Allow authenticated users to read dictionary" ON dictionary;
DROP POLICY IF EXISTS "Allow authenticated users to insert dictionary entries" ON dictionary;
DROP POLICY IF EXISTS "Allow authenticated users to update dictionary entries" ON dictionary;
DROP POLICY IF EXISTS "Allow authenticated users to delete dictionary entries" ON dictionary;

CREATE POLICY "Allow all users to read dictionary" ON dictionary
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert dictionary entries" ON dictionary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update dictionary entries" ON dictionary
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete dictionary entries" ON dictionary
  FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Create RLS policies for text_questions table
DROP POLICY IF EXISTS "Allow authenticated users to read text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to insert text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to update text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to delete text_questions" ON text_questions;

CREATE POLICY "Allow all users to read text_questions" ON text_questions
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert text_questions" ON text_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update text_questions" ON text_questions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete text_questions" ON text_questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Create RLS policies for user_preferences table
DROP POLICY IF EXISTS "Users can read their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

CREATE POLICY "Users can read their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_texts_language ON texts(language);
CREATE INDEX IF NOT EXISTS idx_texts_level ON texts(level);
CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
CREATE INDEX IF NOT EXISTS idx_dictionary_language ON dictionary(language);
CREATE INDEX IF NOT EXISTS idx_text_questions_text_id ON text_questions(text_id);
CREATE INDEX IF NOT EXISTS idx_text_questions_question_number ON text_questions(question_number);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 11. Show the created tables
SELECT 'Created tables:' as info;
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('texts', 'dictionary', 'text_questions', 'user_preferences') THEN '✅ Created'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables 
WHERE table_name IN ('texts', 'dictionary', 'text_questions', 'user_preferences')
AND table_schema = 'public';

-- 12. Show table structures
SELECT 'texts table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'texts' 
ORDER BY ordinal_position;

SELECT 'text_questions table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'text_questions' 
ORDER BY ordinal_position;

-- 13. Test insertion
SELECT 'Testing insertion...' as info;
DO $$
DECLARE
  test_text_id INTEGER;
BEGIN
  -- Insert test text
  INSERT INTO texts (title, content, language, level)
  VALUES ('Test Text', 'This is a test text for import functionality.', 'en', 'A1')
  RETURNING id INTO test_text_id;
  
  RAISE NOTICE '✅ Test text inserted with ID: %', test_text_id;
  
  -- Insert test question
  INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
  VALUES (test_text_id, 'What is this text about?', 1, 'comprehension', 'A1');
  
  RAISE NOTICE '✅ Test question inserted';
  
  -- Insert test word
  INSERT INTO dictionary (word, language, translation_en, part_of_speech, difficulty)
  VALUES ('test', 'en', 'test', 'noun', 'A1')
  ON CONFLICT (word, language) DO NOTHING;
  
  RAISE NOTICE '✅ Test word inserted';
  
  -- Clean up
  DELETE FROM text_questions WHERE text_id = test_text_id;
  DELETE FROM texts WHERE id = test_text_id;
  DELETE FROM dictionary WHERE word = 'test' AND language = 'en';
  
  RAISE NOTICE '✅ Test data cleaned up';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

SELECT 'Database setup completed successfully!' as status; 