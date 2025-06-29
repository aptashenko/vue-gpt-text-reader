-- Clean up duplicate user preferences records
-- Run this in your Supabase SQL Editor

-- 1. Delete any duplicate user preferences (keep only the most recent one)
DELETE FROM user_preferences 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM user_preferences 
  GROUP BY user_id
);

-- 2. Verify the unique constraint is working
-- This should return 0 if there are no duplicates
SELECT user_id, COUNT(*) 
FROM user_preferences 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 3. Check if the table structure is correct
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
ORDER BY ordinal_position; 