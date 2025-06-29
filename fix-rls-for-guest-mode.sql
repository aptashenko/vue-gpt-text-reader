-- Fix RLS policies to allow guest mode users to insert texts
-- Run this in your Supabase SQL Editor

-- 1. Drop existing policies for texts table
DROP POLICY IF EXISTS "Allow authenticated users to read texts" ON texts;
DROP POLICY IF EXISTS "Allow authenticated users to insert texts" ON texts;
DROP POLICY IF EXISTS "Allow authenticated users to update texts" ON texts;
DROP POLICY IF EXISTS "Allow authenticated users to delete texts" ON texts;

-- 2. Create new policies that allow both authenticated and guest users
-- Read policy - allow everyone to read texts
CREATE POLICY "Allow all users to read texts" ON texts
  FOR SELECT USING (true);

-- Insert policy - allow authenticated users to insert texts
CREATE POLICY "Allow authenticated users to insert texts" ON texts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update policy - allow authenticated users to update texts
CREATE POLICY "Allow authenticated users to update texts" ON texts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Delete policy - allow authenticated users to delete texts
CREATE POLICY "Allow authenticated users to delete texts" ON texts
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Drop existing policies for dictionary table
DROP POLICY IF EXISTS "Allow authenticated users to read dictionary" ON dictionary;
DROP POLICY IF EXISTS "Allow authenticated users to insert dictionary entries" ON dictionary;
DROP POLICY IF EXISTS "Allow authenticated users to update dictionary entries" ON dictionary;
DROP POLICY IF EXISTS "Allow authenticated users to delete dictionary entries" ON dictionary;

-- 4. Create new policies for dictionary table
-- Read policy - allow everyone to read dictionary
CREATE POLICY "Allow all users to read dictionary" ON dictionary
  FOR SELECT USING (true);

-- Insert policy - allow authenticated users to insert dictionary entries
CREATE POLICY "Allow authenticated users to insert dictionary entries" ON dictionary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update policy - allow authenticated users to update dictionary entries
CREATE POLICY "Allow authenticated users to update dictionary entries" ON dictionary
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Delete policy - allow authenticated users to delete dictionary entries
CREATE POLICY "Allow authenticated users to delete dictionary entries" ON dictionary
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Drop existing policies for text_questions table
DROP POLICY IF EXISTS "Allow authenticated users to read text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to insert text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to update text_questions" ON text_questions;
DROP POLICY IF EXISTS "Allow authenticated users to delete text_questions" ON text_questions;

-- 6. Create new policies for text_questions table
-- Read policy - allow everyone to read questions
CREATE POLICY "Allow all users to read text_questions" ON text_questions
  FOR SELECT USING (true);

-- Insert policy - allow authenticated users to insert questions
CREATE POLICY "Allow authenticated users to insert text_questions" ON text_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update policy - allow authenticated users to update questions
CREATE POLICY "Allow authenticated users to update text_questions" ON text_questions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Delete policy - allow authenticated users to delete questions
CREATE POLICY "Allow authenticated users to delete text_questions" ON text_questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Show the updated policies
SELECT 'Updated RLS policies for texts table:' as info;
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
  END as operation,
  qual as condition
FROM pg_policies 
WHERE tablename IN ('texts', 'dictionary', 'text_questions')
ORDER BY tablename, cmd;

-- 8. Alternative approach: If you want to allow guest mode users to insert texts,
-- you can create a service role key and use it for guest mode operations
-- This would require updating the frontend to use the service role key when in guest mode

SELECT 'RLS policies updated successfully!' as status;
SELECT 'Note: Guest mode users can now read texts, but only authenticated users can insert/update/delete' as note; 