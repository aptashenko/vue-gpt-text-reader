-- Check if text_words table exists and create it if needed
-- Run this in your Supabase SQL Editor

-- 1. Check if text_words table exists
SELECT 'Checking text_words table...' as info;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ text_words table exists'
    ELSE '❌ text_words table does not exist'
  END as table_status
FROM information_schema.tables 
WHERE table_name = 'text_words' AND table_schema = 'public';

-- 2. Create text_words table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'text_words' AND table_schema = 'public'
  ) THEN
    -- Create text_words table
    CREATE TABLE text_words (
      id SERIAL PRIMARY KEY,
      text_id INTEGER REFERENCES texts(id) ON DELETE CASCADE,
      word_id INTEGER REFERENCES dictionary(id) ON DELETE CASCADE,
      word_order INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(text_id, word_id)
    );
    
    -- Enable RLS
    ALTER TABLE text_words ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow all users to read text_words" ON text_words
      FOR SELECT USING (true);
    
    CREATE POLICY "Allow authenticated users to insert text_words" ON text_words
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Allow authenticated users to update text_words" ON text_words
      FOR UPDATE USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Allow authenticated users to delete text_words" ON text_words
      FOR DELETE USING (auth.role() = 'authenticated');
    
    -- Create indexes
    CREATE INDEX idx_text_words_text_id ON text_words(text_id);
    CREATE INDEX idx_text_words_word_id ON text_words(word_id);
    CREATE INDEX idx_text_words_word_order ON text_words(word_order);
    
    RAISE NOTICE '✅ text_words table created successfully';
  ELSE
    RAISE NOTICE '✅ text_words table already exists';
  END IF;
END $$;

-- 3. Show table structure
SELECT 'text_words table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'text_words' 
ORDER BY ordinal_position;

-- 4. Test insertion
SELECT 'Testing text_words table...' as info;
DO $$
DECLARE
  test_text_id INTEGER;
  test_word_id INTEGER;
BEGIN
  -- Insert test text
  INSERT INTO texts (title, content, language, level)
  VALUES ('Test Text for Words', 'This is a test text with words.', 'en', 'A1')
  RETURNING id INTO test_text_id;
  
  RAISE NOTICE '✅ Test text inserted with ID: %', test_text_id;
  
  -- Insert test word
  INSERT INTO dictionary (word, language, translation_en, part_of_speech, difficulty)
  VALUES ('testword', 'en', 'test word', 'noun', 'A1')
  RETURNING id INTO test_word_id;
  
  RAISE NOTICE '✅ Test word inserted with ID: %', test_word_id;
  
  -- Link word to text
  INSERT INTO text_words (text_id, word_id, word_order)
  VALUES (test_text_id, test_word_id, 1);
  
  RAISE NOTICE '✅ Word linked to text successfully';
  
  -- Clean up
  DELETE FROM text_words WHERE text_id = test_text_id;
  DELETE FROM dictionary WHERE id = test_word_id;
  DELETE FROM texts WHERE id = test_text_id;
  
  RAISE NOTICE '✅ Test data cleaned up';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

-- 5. Show current data counts
SELECT 'Current data counts:' as info;
SELECT 'texts' as table_name, COUNT(*) as count FROM texts
UNION ALL
SELECT 'dictionary' as table_name, COUNT(*) as count FROM dictionary
UNION ALL
SELECT 'text_questions' as table_name, COUNT(*) as count FROM text_questions
UNION ALL
SELECT 'text_words' as table_name, COUNT(*) as count FROM text_words;

SELECT 'text_words table check completed!' as status; 