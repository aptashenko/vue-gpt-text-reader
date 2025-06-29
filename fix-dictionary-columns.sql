-- Fix dictionary table by adding missing translation columns
-- Run this in your Supabase SQL Editor

-- 1. Check current dictionary table structure
SELECT 'Current dictionary table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'dictionary' 
ORDER BY ordinal_position;

-- 2. Add missing translation columns
DO $$
BEGIN
  -- Add translation_ru column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_ru'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_ru TEXT;
    RAISE NOTICE '✅ Added translation_ru column to dictionary table';
  ELSE
    RAISE NOTICE '✅ translation_ru column already exists';
  END IF;
  
  -- Add translation_uk column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_uk'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_uk TEXT;
    RAISE NOTICE '✅ Added translation_uk column to dictionary table';
  ELSE
    RAISE NOTICE '✅ translation_uk column already exists';
  END IF;
  
  -- Add translation_es column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_es'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_es TEXT;
    RAISE NOTICE '✅ Added translation_es column to dictionary table';
  ELSE
    RAISE NOTICE '✅ translation_es column already exists';
  END IF;
  
  -- Add translation_de column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_de'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_de TEXT;
    RAISE NOTICE '✅ Added translation_de column to dictionary table';
  ELSE
    RAISE NOTICE '✅ translation_de column already exists';
  END IF;
  
  -- Add translation_fr column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_fr'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_fr TEXT;
    RAISE NOTICE '✅ Added translation_fr column to dictionary table';
  ELSE
    RAISE NOTICE '✅ translation_fr column already exists';
  END IF;
  
  -- Add part_of_speech column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'part_of_speech'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN part_of_speech VARCHAR(50) DEFAULT 'noun';
    RAISE NOTICE '✅ Added part_of_speech column to dictionary table';
  ELSE
    RAISE NOTICE '✅ part_of_speech column already exists';
  END IF;
  
  -- Add difficulty column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN difficulty VARCHAR(50) DEFAULT 'beginner';
    RAISE NOTICE '✅ Added difficulty column to dictionary table';
  ELSE
    RAISE NOTICE '✅ difficulty column already exists';
  END IF;
  
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Added created_at column to dictionary table';
  ELSE
    RAISE NOTICE '✅ created_at column already exists';
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Added updated_at column to dictionary table';
  ELSE
    RAISE NOTICE '✅ updated_at column already exists';
  END IF;
END $$;

-- 3. Show updated dictionary table structure
SELECT 'Updated dictionary table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'dictionary' 
ORDER BY ordinal_position;

-- 4. Test word insertion
SELECT 'Testing word insertion...' as info;
DO $$
BEGIN
  INSERT INTO dictionary (
    word, 
    language, 
    translation_en, 
    translation_fr, 
    translation_es, 
    translation_de, 
    translation_uk, 
    translation_ru, 
    part_of_speech, 
    difficulty
  ) VALUES (
    'test', 
    'en', 
    'test', 
    'test', 
    'test', 
    'test', 
    'тест', 
    'тест', 
    'noun', 
    'A1'
  )
  ON CONFLICT (word, language) DO NOTHING;
  
  RAISE NOTICE '✅ Test word insertion successful';
  
  -- Clean up
  DELETE FROM dictionary WHERE word = 'test' AND language = 'en';
  
  RAISE NOTICE '✅ Test data cleaned up';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

-- 5. Show final status
SELECT 'Dictionary table fixed successfully!' as status; 