-- Clear all texts and dictionary entries from database
-- Run this in your Supabase SQL Editor

-- 1. Clear all texts
DELETE FROM texts;

-- 2. Clear all dictionary entries
DELETE FROM dictionary;

-- 3. Reset the auto-increment counters (optional)
-- This will reset the ID counters to start from 1 again
ALTER SEQUENCE texts_id_seq RESTART WITH 1;
ALTER SEQUENCE dictionary_id_seq RESTART WITH 1;

-- 4. Verify the tables are empty
SELECT 'Texts count:' as table_name, COUNT(*) as count FROM texts
UNION ALL
SELECT 'Dictionary count:' as table_name, COUNT(*) as count FROM dictionary;

-- 5. Show table structure for reference
SELECT 'texts' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'texts' 
ORDER BY ordinal_position;

SELECT 'dictionary' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dictionary' 
ORDER BY ordinal_position; 