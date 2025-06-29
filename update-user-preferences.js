import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateUserPreferences() {
  console.log('Adding user preferences table...')

  try {
    // Create user preferences table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          native_language VARCHAR(10) NOT NULL DEFAULT 'en',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    })

    if (createError) {
      console.log('Error creating user_preferences table:', createError.message)
      console.log('You may need to run this SQL manually in your Supabase dashboard:')
      console.log(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          native_language VARCHAR(10) NOT NULL DEFAULT 'en',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `)
    } else {
      console.log('✓ User preferences table created')
    }

    // Enable RLS for user_preferences
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can read their own preferences" ON user_preferences;
        CREATE POLICY "Users can read their own preferences" ON user_preferences
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
        CREATE POLICY "Users can insert their own preferences" ON user_preferences
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
        CREATE POLICY "Users can update their own preferences" ON user_preferences
          FOR UPDATE USING (auth.uid() = user_id);
      `
    })

    if (rlsError) {
      console.log('Error setting up RLS for user_preferences:', rlsError.message)
      console.log('You may need to run this SQL manually in your Supabase dashboard:')
      console.log(`
        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can read their own preferences" ON user_preferences
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own preferences" ON user_preferences
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own preferences" ON user_preferences
          FOR UPDATE USING (auth.uid() = user_id);
      `)
    } else {
      console.log('✓ Row Level Security configured for user_preferences')
    }

    console.log('\n🎉 User preferences setup completed!')
    console.log('\nNew features:')
    console.log('- Users can set their native language in Settings')
    console.log('- All translations are from text language to user\'s native language')
    console.log('- Personalized learning experience')

  } catch (error) {
    console.error('Error updating user preferences:', error)
    process.exit(1)
  }
}

updateUserPreferences() 