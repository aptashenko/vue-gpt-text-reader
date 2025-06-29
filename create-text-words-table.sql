-- Create text_words table to link specific words to specific texts
-- Run this in your Supabase SQL Editor

-- 1. Create text_words table
CREATE TABLE IF NOT EXISTS text_words (
  id SERIAL PRIMARY KEY,
  text_id INTEGER REFERENCES texts(id) ON DELETE CASCADE,
  word_id INTEGER REFERENCES dictionary(id) ON DELETE CASCADE,
  word_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(text_id, word_id)
);

-- 2. Enable RLS for text_words table
ALTER TABLE text_words ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for text_words table
DROP POLICY IF EXISTS "Allow all users to read text_words" ON text_words;
DROP POLICY IF EXISTS "Allow authenticated users to insert text_words" ON text_words;
DROP POLICY IF EXISTS "Allow authenticated users to update text_words" ON text_words;
DROP POLICY IF EXISTS "Allow authenticated users to delete text_words" ON text_words;

-- Read policy - allow everyone to read text_words
CREATE POLICY "Allow all users to read text_words" ON text_words
  FOR SELECT USING (true);

-- Insert policy - allow authenticated users to insert text_words
CREATE POLICY "Allow authenticated users to insert text_words" ON text_words
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update policy - allow authenticated users to update text_words
CREATE POLICY "Allow authenticated users to update text_words" ON text_words
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Delete policy - allow authenticated users to delete text_words
CREATE POLICY "Allow authenticated users to delete text_words" ON text_words
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_words_text_id ON text_words(text_id);
CREATE INDEX IF NOT EXISTS idx_text_words_word_id ON text_words(word_id);
CREATE INDEX IF NOT EXISTS idx_text_words_word_order ON text_words(word_order);

-- 5. Show the created table structure
SELECT 'text_words table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'text_words' 
ORDER BY ordinal_position;

-- 6. Test the table creation
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

-- 7. Show final table status
SELECT 'text_words table created successfully!' as status; 