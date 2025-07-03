-- Create user_saved_words table to track saved words for each user
CREATE TABLE IF NOT EXISTS user_saved_words (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id INTEGER REFERENCES dictionary(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Enable Row Level Security
ALTER TABLE user_saved_words ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own saved words
CREATE POLICY "Users can view their saved words" ON user_saved_words
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to save words
CREATE POLICY "Users can save words" ON user_saved_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to remove their saved words
CREATE POLICY "Users can delete their saved words" ON user_saved_words
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_saved_words_user_id ON user_saved_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_words_word_id ON user_saved_words(word_id); 