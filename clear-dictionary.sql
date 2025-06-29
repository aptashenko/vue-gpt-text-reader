-- Clear All Dictionary Entries
-- Run this in your Supabase SQL Editor

-- First, let's see how many entries we have
SELECT 
  language,
  COUNT(*) as word_count
FROM dictionary 
GROUP BY language
ORDER BY language;

-- Show total count
SELECT COUNT(*) as total_words FROM dictionary;

-- Clear all dictionary entries
DELETE FROM dictionary;

-- Verify the dictionary is empty
SELECT 
  'Dictionary entries after deletion:' as info,
  COUNT(*) as remaining_words 
FROM dictionary;

-- Reset the auto-increment counter (optional)
-- This will reset the ID counter to start from 1 again
ALTER SEQUENCE dictionary_id_seq RESTART WITH 1;

-- Final verification
SELECT 
  'Dictionary is now empty!' as status,
  COUNT(*) as total_remaining_words 
FROM dictionary; 