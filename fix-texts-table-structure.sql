-- Fix texts table structure to remove old question columns
-- Run this in your Supabase SQL Editor

-- 1. Check current texts table structure
SELECT 'Current texts table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'texts' 
ORDER BY ordinal_position;

-- 2. Check if question1 and question2 columns exist
SELECT 'Checking for old question columns...' as info;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Found question1 column'
    ELSE 'No question1 column found'
  END as question1_status
FROM information_schema.columns 
WHERE table_name = 'texts' AND column_name = 'question1';

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Found question2 column'
    ELSE 'No question2 column found'
  END as question2_status
FROM information_schema.columns 
WHERE table_name = 'texts' AND column_name = 'question2';

-- 3. Migrate existing questions to text_questions table (if they exist)
SELECT 'Migrating existing questions...' as info;
DO $$
BEGIN
  -- Migrate question1 if it exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'texts' AND column_name = 'question1'
  ) THEN
    INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
    SELECT 
      id as text_id,
      question1 as question_text,
      1 as question_number,
      'comprehension' as question_type,
      'medium' as difficulty
    FROM texts 
    WHERE question1 IS NOT NULL AND question1 != ''
    ON CONFLICT (text_id, question_number) DO NOTHING;
    
    RAISE NOTICE 'Migrated question1 data to text_questions table';
  END IF;
  
  -- Migrate question2 if it exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'texts' AND column_name = 'question2'
  ) THEN
    INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
    SELECT 
      id as text_id,
      question2 as question_text,
      2 as question_number,
      'comprehension' as question_type,
      'medium' as difficulty
    FROM texts 
    WHERE question2 IS NOT NULL AND question2 != ''
    ON CONFLICT (text_id, question_number) DO NOTHING;
    
    RAISE NOTICE 'Migrated question2 data to text_questions table';
  END IF;
END $$;

-- 4. Remove old question columns from texts table
SELECT 'Removing old question columns...' as info;
DO $$
BEGIN
  -- Remove question1 column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'texts' AND column_name = 'question1'
  ) THEN
    ALTER TABLE texts DROP COLUMN question1;
    RAISE NOTICE 'Removed question1 column from texts table';
  END IF;
  
  -- Remove question2 column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'texts' AND column_name = 'question2'
  ) THEN
    ALTER TABLE texts DROP COLUMN question2;
    RAISE NOTICE 'Removed question2 column from texts table';
  END IF;
END $$;

-- 5. Show updated texts table structure
SELECT 'Updated texts table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'texts' 
ORDER BY ordinal_position;

-- 6. Show text_questions table structure
SELECT 'text_questions table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'text_questions' 
ORDER BY ordinal_position;

-- 7. Show relationship between texts and questions
SELECT 'Texts and their questions:' as info;
SELECT 
  t.id as text_id,
  t.title,
  t.language,
  t.level,
  COUNT(tq.id) as question_count
FROM texts t
LEFT JOIN text_questions tq ON t.id = tq.text_id
GROUP BY t.id, t.title, t.language, t.level
ORDER BY t.id;

-- 8. Test the relationship
SELECT 'Testing text-question relationship...' as info;
DO $$
DECLARE
  test_text_id INTEGER;
BEGIN
  -- Insert test text
  INSERT INTO texts (title, content, language, level)
  VALUES ('Test Text for Relationship', 'This is a test text to verify the relationship.', 'en', 'A1')
  RETURNING id INTO test_text_id;
  
  RAISE NOTICE '✅ Test text inserted with ID: %', test_text_id;
  
  -- Insert test questions
  INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
  VALUES 
    (test_text_id, 'What is this text about?', 1, 'comprehension', 'A1'),
    (test_text_id, 'What language is this text in?', 2, 'comprehension', 'A1');
  
  RAISE NOTICE '✅ Test questions inserted';
  
  -- Verify relationship
  SELECT COUNT(*) INTO test_text_id FROM text_questions WHERE text_id = test_text_id;
  RAISE NOTICE '✅ Found % questions for the test text', test_text_id;
  
  -- Clean up
  DELETE FROM text_questions WHERE text_id = test_text_id;
  DELETE FROM texts WHERE id = test_text_id;
  
  RAISE NOTICE '✅ Test data cleaned up';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

-- 9. Show final data counts
SELECT 'Final data counts:' as info;
SELECT 'texts' as table_name, COUNT(*) as count FROM texts
UNION ALL
SELECT 'text_questions' as table_name, COUNT(*) as count FROM text_questions
UNION ALL
SELECT 'dictionary' as table_name, COUNT(*) as count FROM dictionary;

SELECT 'Texts table structure fixed successfully!' as status; 