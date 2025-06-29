-- Enhanced Questions System for Vue GPT Text Reader
-- Run this in your Supabase SQL Editor

-- 1. Create a separate questions table for better organization
CREATE TABLE IF NOT EXISTS text_questions (
  id SERIAL PRIMARY KEY,
  text_id INTEGER REFERENCES texts(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) DEFAULT 'comprehension', -- comprehension, vocabulary, grammar, etc.
  difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(text_id, question_number)
);

-- 2. Create a user_answers table to track user responses
CREATE TABLE IF NOT EXISTS user_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id INTEGER REFERENCES texts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES text_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  ai_feedback TEXT,
  score INTEGER, -- 0-100
  is_correct BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_questions_text_id ON text_questions(text_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_text_id ON user_answers(text_id);

-- 4. Enable RLS for new tables
ALTER TABLE text_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for text_questions
CREATE POLICY "Allow authenticated users to read text questions" ON text_questions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert text questions" ON text_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update text questions" ON text_questions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete text questions" ON text_questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Create policies for user_answers
CREATE POLICY "Users can read their own answers" ON user_answers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers" ON user_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" ON user_answers
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Migrate existing questions from texts table to text_questions table
INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
SELECT 
  id as text_id,
  question1 as question_text,
  1 as question_number,
  'comprehension' as question_type,
  'medium' as difficulty
FROM texts 
WHERE question1 IS NOT NULL AND question1 != '';

INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty)
SELECT 
  id as text_id,
  question2 as question_text,
  2 as question_number,
  'comprehension' as question_type,
  'medium' as difficulty
FROM texts 
WHERE question2 IS NOT NULL AND question2 != '';

-- 8. Add some additional sample questions for existing texts
INSERT INTO text_questions (text_id, question_text, question_number, question_type, difficulty) VALUES
-- Additional questions for "The Little Red Hen"
(1, 'What did the other animals say when the hen asked for help?', 3, 'comprehension', 'easy'),
(1, 'What lesson does this story teach about helping others?', 4, 'analysis', 'hard'),

-- Additional questions for "The Three Little Pigs"
(2, 'What happened to the first two houses?', 3, 'comprehension', 'easy'),
(2, 'Why was the brick house the strongest?', 4, 'analysis', 'medium'),

-- Additional questions for "The Tortoise and the Hare"
(3, 'What was the hare''s attitude before the race?', 3, 'comprehension', 'medium'),
(3, 'What is the moral of this story?', 4, 'analysis', 'medium');

-- 9. Show the results
SELECT 'Migration completed!' as status;
SELECT COUNT(*) as total_questions FROM text_questions;
SELECT COUNT(*) as total_user_answers FROM user_answers; 