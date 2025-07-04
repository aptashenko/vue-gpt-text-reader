import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  try {
    console.log('Starting database migration...')
    
    // Test if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('user_folder_words')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('Cannot connect to database:', testError)
      return
    }
    
    console.log('✓ Database connection successful')
    
    // Check if word_status column already exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_folder_words' })
    
    if (columnsError) {
      console.log('Cannot check columns directly, proceeding with migration...')
    } else {
      const hasWordStatus = columns?.some(col => col.column_name === 'word_status')
      if (hasWordStatus) {
        console.log('✓ word_status column already exists')
        return
      }
    }
    
    // Since we can't run ALTER TABLE directly through the client,
    // we'll provide instructions for manual application
    console.log('\n📋 MANUAL MIGRATION REQUIRED')
    console.log('Please run the following SQL in your Supabase SQL Editor:')
    console.log('\n' + '='.repeat(60))
    console.log(`
-- Add word_status column to user_folder_words table
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
`)
    console.log('='.repeat(60))
    console.log('\nAfter running the SQL above, the known/unknown words feature will work properly!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigration() 