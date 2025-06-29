-- Check and fix database issues
-- Run this in your Supabase SQL Editor

-- 1. Check if tables exist
SELECT 'Checking table existence...' as info;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('texts', 'dictionary', 'text_questions') THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables 
WHERE table_name IN ('texts', 'dictionary', 'text_questions')
AND table_schema = 'public';

-- 2. Check RLS status
SELECT 'Checking RLS status...' as info;

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as rls_status
FROM pg_tables 
WHERE tablename IN ('texts', 'dictionary', 'text_questions')
AND schemaname = 'public';

-- 3. Check RLS policies
SELECT 'Checking RLS policies...' as info;

SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE cmd
  END as operation
FROM pg_policies 
WHERE tablename IN ('texts', 'dictionary', 'text_questions')
ORDER BY tablename, cmd;

-- 4. Fix RLS policies if needed
DO $$
BEGIN
  -- Fix texts table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'texts' AND cmd = 'INSERT'
  ) THEN
    DROP POLICY IF EXISTS "Allow authenticated users to insert texts" ON texts;
    CREATE POLICY "Allow authenticated users to insert texts" ON texts
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Created INSERT policy for texts table';
  END IF;
  
  -- Fix dictionary table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dictionary' AND cmd = 'INSERT'
  ) THEN
    DROP POLICY IF EXISTS "Allow authenticated users to insert dictionary entries" ON dictionary;
    CREATE POLICY "Allow authenticated users to insert dictionary entries" ON dictionary
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Created INSERT policy for dictionary table';
  END IF;
  
  -- Fix text_questions table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_questions' AND cmd = 'INSERT'
  ) THEN
    DROP POLICY IF EXISTS "Allow authenticated users to insert text_questions" ON text_questions;
    CREATE POLICY "Allow authenticated users to insert text_questions" ON text_questions
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Created INSERT policy for text_questions table';
  END IF;
END $$;

-- 5. Test insertion permissions
SELECT 'Testing insertion permissions...' as info;

-- Test text insertion
DO $$
DECLARE
  test_text_id INTEGER;
BEGIN
  INSERT INTO texts (title, content, language, level)
  VALUES ('Test Text', 'This is a test text.', 'en', 'A1')
  RETURNING id INTO test_text_id;
  
  RAISE NOTICE '✅ Text insertion successful, ID: %', test_text_id;
  
  -- Test question insertion
  INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
  VALUES (test_text_id, 'What is this text about?', 1, 'comprehension', 'A1');
  
  RAISE NOTICE '✅ Question insertion successful';
  
  -- Test word insertion
  INSERT INTO dictionary (word, language, translation_en, part_of_speech, difficulty)
  VALUES ('test', 'en', 'test', 'noun', 'A1')
  ON CONFLICT (word, language) DO NOTHING;
  
  RAISE NOTICE '✅ Word insertion successful';
  
  -- Clean up
  DELETE FROM text_questions WHERE text_id = test_text_id;
  DELETE FROM texts WHERE id = test_text_id;
  DELETE FROM dictionary WHERE word = 'test' AND language = 'en';
  
  RAISE NOTICE '✅ Test data cleaned up';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

-- 6. Show current data counts
SELECT 'Current data counts:' as info;

SELECT 'texts' as table_name, COUNT(*) as count FROM texts
UNION ALL
SELECT 'dictionary' as table_name, COUNT(*) as count FROM dictionary
UNION ALL
SELECT 'text_questions' as table_name, COUNT(*) as count FROM text_questions;

-- 7. Show recent texts
SELECT 'Recent texts:' as info;
SELECT id, title, language, level, created_at 
FROM texts 
ORDER BY created_at DESC 
LIMIT 5; 