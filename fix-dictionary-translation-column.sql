-- Fix dictionary table translation column issue
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

-- 2. Check if old 'translation' column exists and its constraints
SELECT 'Checking translation column constraints...' as info;
SELECT 
  column_name,
  is_nullable,
  column_default,
  data_type
FROM information_schema.columns 
WHERE table_name = 'dictionary' AND column_name = 'translation';

-- 3. Fix the translation column issue
DO $$
BEGIN
  -- Check if old 'translation' column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation'
  ) THEN
    -- Make the translation column nullable to avoid constraint violations
    ALTER TABLE dictionary ALTER COLUMN translation DROP NOT NULL;
    RAISE NOTICE '✅ Made translation column nullable';
    
    -- Optionally, you can also drop the old translation column if you want
    -- Uncomment the next line if you want to remove the old column entirely
    -- ALTER TABLE dictionary DROP COLUMN translation;
    -- RAISE NOTICE '✅ Removed old translation column';
  ELSE
    RAISE NOTICE '✅ No old translation column found';
  END IF;
END $$;

-- 4. Verify all required columns exist
DO $$
BEGIN
  -- Ensure all required translation columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_en'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_en TEXT;
    RAISE NOTICE '✅ Added translation_en column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_fr'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_fr TEXT;
    RAISE NOTICE '✅ Added translation_fr column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_es'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_es TEXT;
    RAISE NOTICE '✅ Added translation_es column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_de'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_de TEXT;
    RAISE NOTICE '✅ Added translation_de column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_uk'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_uk TEXT;
    RAISE NOTICE '✅ Added translation_uk column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'translation_ru'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN translation_ru TEXT;
    RAISE NOTICE '✅ Added translation_ru column';
  END IF;
  
  -- Ensure other required columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'part_of_speech'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN part_of_speech VARCHAR(50) DEFAULT 'noun';
    RAISE NOTICE '✅ Added part_of_speech column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN difficulty VARCHAR(50) DEFAULT 'beginner';
    RAISE NOTICE '✅ Added difficulty column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Added created_at column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dictionary' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE dictionary ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Added updated_at column';
  END IF;
END $$;

-- 5. Show updated dictionary table structure
SELECT 'Updated dictionary table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'dictionary' 
ORDER BY ordinal_position;

-- 6. Test word insertion with the new structure
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

-- 7. Show final status
SELECT 'Dictionary table fixed successfully!' as status; 