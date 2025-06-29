-- Fix Dictionary Delete Policy (Safe Version)
-- Run this in your Supabase SQL Editor

-- Check current policies on dictionary table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'dictionary';

-- Check if DELETE policy exists for dictionary
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'DELETE policy exists for dictionary'
    ELSE 'DELETE policy missing for dictionary'
  END as status
FROM pg_policies 
WHERE tablename = 'dictionary' AND cmd = 'DELETE';

-- Add DELETE policy for dictionary table only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dictionary' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete dictionary entries" ON dictionary
      FOR DELETE USING (auth.role() = 'authenticated');
    RAISE NOTICE 'DELETE policy created for dictionary table';
  ELSE
    RAISE NOTICE 'DELETE policy already exists for dictionary table';
  END IF;
END $$;

-- Check current policies on texts table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'texts';

-- Check if DELETE policy exists for texts
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'DELETE policy exists for texts'
    ELSE 'DELETE policy missing for texts'
  END as status
FROM pg_policies 
WHERE tablename = 'texts' AND cmd = 'DELETE';

-- Add DELETE policy for texts table only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'texts' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete texts" ON texts
      FOR DELETE USING (auth.role() = 'authenticated');
    RAISE NOTICE 'DELETE policy created for texts table';
  ELSE
    RAISE NOTICE 'DELETE policy already exists for texts table';
  END IF;
END $$;

-- Final verification - show all policies for both tables
SELECT 
  tablename as table_name,
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
WHERE tablename IN ('dictionary', 'texts')
ORDER BY tablename, cmd; 