-- Create word_folders table for thematic folders
CREATE TABLE IF NOT EXISTS word_folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  theme VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_folder_words table to link users, folders, and words
CREATE TABLE IF NOT EXISTS user_folder_words (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES word_folders(id) ON DELETE CASCADE,
  word_id INTEGER REFERENCES dictionary(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, folder_id, word_id)
);

-- Enable Row Level Security
ALTER TABLE word_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_folder_words ENABLE ROW LEVEL SECURITY;

-- Allow all users to view folders (they are public)
CREATE POLICY "Anyone can view folders" ON word_folders
  FOR SELECT USING (true);

-- Allow users to view their folder words
CREATE POLICY "Users can view their folder words" ON user_folder_words
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to add words to folders
CREATE POLICY "Users can add words to folders" ON user_folder_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to remove words from folders
CREATE POLICY "Users can remove words from folders" ON user_folder_words
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_folder_words_user_id ON user_folder_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_folder_words_folder_id ON user_folder_words(folder_id);
CREATE INDEX IF NOT EXISTS idx_user_folder_words_word_id ON user_folder_words(word_id);
CREATE INDEX IF NOT EXISTS idx_word_folders_theme ON word_folders(theme);

-- Insert default folders
INSERT INTO word_folders (name, description, theme, is_default) VALUES
('All Words', 'All your saved words from reading', 'all', true),
('Food & Dining', 'Words related to food, cooking, and dining', 'food', false),
('Travel & Transportation', 'Words for traveling and getting around', 'travel', false),
('Emotions & Feelings', 'Words to express emotions and feelings', 'emotions', false),
('Nature & Environment', 'Words about nature, weather, and environment', 'nature', false),
('Work & Business', 'Professional and workplace vocabulary', 'work', false),
('Family & Relationships', 'Family members and relationship terms', 'family', false),
('Technology & Digital', 'Modern technology and digital world', 'technology', false),
('Clothes & Fashion', 'Clothing and fashion vocabulary', 'clothes', false),
('Health & Wellness', 'Health, body, and wellness terms', 'health', false),
('Daily Life', 'Everyday activities and routines', 'daily', false)
ON CONFLICT DO NOTHING; 