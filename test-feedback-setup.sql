-- Simple feedback table creation (without user_metadata references)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON feedback(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can delete feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;
DROP POLICY IF EXISTS "Guest users can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Guest mode - Admins can view feedback" ON feedback;

-- Simple RLS policies (JWT claims only, no auth.users queries)
CREATE POLICY "Anyone can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own feedback or admins view all" ON feedback
  FOR SELECT USING (
    auth.uid() = user_id
    OR current_setting('request.jwt.claims', true)::jsonb->>'email' IN (
      'aptashenko2019@gmail.com', 
      'admin@example.com', 
      'your-email@example.com'
    )
  );

CREATE POLICY "Admins can delete feedback" ON feedback
  FOR DELETE USING (
    current_setting('request.jwt.claims', true)::jsonb->>'email' IN (
      'aptashenko2019@gmail.com', 
      'admin@example.com', 
      'your-email@example.com'
    )
  );

CREATE POLICY "Admins can update feedback" ON feedback
  FOR UPDATE USING (
    current_setting('request.jwt.claims', true)::jsonb->>'email' IN (
      'aptashenko2019@gmail.com', 
      'admin@example.com', 
      'your-email@example.com'
    )
  );

-- Test insert
INSERT INTO feedback (email, message, user_id) VALUES
  ('test@example.com', 'This is a test feedback message. The app is great!', NULL)
ON CONFLICT DO NOTHING;

-- Verify table
SELECT 'Feedback table created successfully!' as status; 