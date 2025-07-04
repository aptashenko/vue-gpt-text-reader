const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  try {
    console.log('Starting migration...')
    
    // Add word_status column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE user_folder_words 
            ADD COLUMN IF NOT EXISTS word_status VARCHAR(20) DEFAULT 'unknown' 
            CHECK (word_status IN ('known', 'unknown'))`
    })
    
    if (alterError) {
      console.error('Error adding word_status column:', alterError)
      return
    }
    
    console.log('✓ Added word_status column')
    
    // Update existing words to be 'unknown' by default
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE user_folder_words 
            SET word_status = 'unknown' 
            WHERE word_status IS NULL`
    })
    
    if (updateError) {
      console.error('Error updating existing words:', updateError)
      return
    }
    
    console.log('✓ Updated existing words to unknown status')
    
    // Create index for performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_user_folder_words_status 
            ON user_folder_words(user_id, folder_id, word_status)`
    })
    
    if (indexError) {
      console.error('Error creating index:', indexError)
      return
    }
    
    console.log('✓ Created performance index')
    
    // Add policy to allow users to update word status
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Users can update their folder word status" 
            ON user_folder_words
            FOR UPDATE USING (auth.uid() = user_id)`
    })
    
    if (policyError) {
      console.error('Error creating policy:', policyError)
      return
    }
    
    console.log('✓ Added update policy')
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMigration() 