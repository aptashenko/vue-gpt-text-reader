-- Check feedback table and data
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name = 'feedback';

-- 2. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'feedback' 
ORDER BY ordinal_position;

-- 3. Check RLS policies
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
WHERE tablename = 'feedback';

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'feedback';

-- 5. Count feedback records
SELECT COUNT(*) as total_feedback FROM feedback;

-- 6. Show all feedback (if any)
SELECT 
  id,
  email,
  LEFT(message, 50) as message_preview,
  user_id,
  submitted_at,
  created_at
FROM feedback 
ORDER BY submitted_at DESC;

-- 7. Check current user context
SELECT 
  current_user as current_user,
  session_user as session_user,
  current_setting('request.jwt.claims', true) as jwt_claims; 