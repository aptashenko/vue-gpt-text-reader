-- Add word_status column to user_folder_words table
-- This will track whether a word is known or unknown for the user

ALTER TABLE user_folder_words 
ADD COLUMN IF NOT EXISTS word_status VARCHAR(20) DEFAULT 'unknown' CHECK (word_status IN ('known', 'unknown'));

-- Update existing words to be 'unknown' by default
UPDATE user_folder_words 
SET word_status = 'unknown' 
WHERE word_status IS NULL;

-- Create index for performance on word_status queries
CREATE INDEX IF NOT EXISTS idx_user_folder_words_status ON user_folder_words(user_id, folder_id, word_status);

-- Add policy to allow users to update word status
CREATE POLICY "Users can update their folder word status" ON user_folder_words
  FOR UPDATE USING (auth.uid() = user_id); 