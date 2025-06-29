-- Create text_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS text_questions (
  id SERIAL PRIMARY KEY,
  text_id INTEGER REFERENCES texts(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) DEFAULT 'comprehension',
  difficulty VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for text_questions
ALTER TABLE text_questions ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read questions
CREATE POLICY "Allow authenticated users to read text_questions" ON text_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow admin users to insert questions
CREATE POLICY "Allow admin users to insert text_questions" ON text_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow admin users to update questions
CREATE POLICY "Allow admin users to update text_questions" ON text_questions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy to allow admin users to delete questions
CREATE POLICY "Allow admin users to delete text_questions" ON text_questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_text_questions_text_id ON text_questions(text_id);
CREATE INDEX IF NOT EXISTS idx_text_questions_question_number ON text_questions(question_number); 