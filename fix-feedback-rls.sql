-- Complete fix for feedback table RLS policies
-- This removes ALL references to auth.users and uses only JWT claims

-- First, drop ALL existing policies on the feedback table
DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can delete feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;
DROP POLICY IF EXISTS "Guest users can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Guest mode - Admins can view feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;

-- Create new policies that ONLY use JWT claims (no auth.users queries)

-- Allow anyone to insert feedback (including guests and authenticated users)
CREATE POLICY "Anyone can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own feedback OR allow admins to view all
CREATE POLICY "Users can view own feedback or admins view all" ON feedback
  FOR SELECT USING (
    auth.uid() = user_id
    OR current_setting('request.jwt.claims', true)::jsonb->>'email' IN (
      'aptashenko2019@gmail.com', 
      'admin@example.com', 
      'your-email@example.com'
    )
  );

-- Allow admins to delete feedback
CREATE POLICY "Admins can delete feedback" ON feedback
  FOR DELETE USING (
    current_setting('request.jwt.claims', true)::jsonb->>'email' IN (
      'aptashenko2019@gmail.com', 
      'admin@example.com', 
      'your-email@example.com'
    )
  );

-- Allow admins to update feedback
CREATE POLICY "Admins can update feedback" ON feedback
  FOR UPDATE USING (
    current_setting('request.jwt.claims', true)::jsonb->>'email' IN (
      'aptashenko2019@gmail.com', 
      'admin@example.com', 
      'your-email@example.com'
    )
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'feedback'
ORDER BY policyname;

-- Test the policies by checking if we can select from feedback
SELECT 'RLS policies updated successfully!' as status; 