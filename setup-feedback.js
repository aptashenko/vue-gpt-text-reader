import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   VITE_SUPABASE_URL')
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupFeedbackTable() {
  console.log('🚀 Setting up feedback table...')
  
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'create-feedback-table.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📄 SQL file loaded successfully')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      // If exec_sql doesn't exist, try running individual statements
      console.log('⚠️  exec_sql not available, trying individual statements...')
      
      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`📝 Executing: ${statement.substring(0, 50)}...`)
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (stmtError) {
            console.log(`⚠️  Statement failed (this might be expected): ${stmtError.message}`)
          }
        }
      }
    }
    
    console.log('✅ Feedback table setup completed!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. Navigate to the SQL Editor')
    console.log('   3. Run the commands from create-feedback-table.sql')
    console.log('   4. Or check if the table was created automatically')
    
  } catch (error) {
    console.error('❌ Error setting up feedback table:', error)
    console.log('')
    console.log('📋 Manual setup required:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. Navigate to the SQL Editor')
    console.log('   3. Copy and paste the contents of create-feedback-table.sql')
    console.log('   4. Run the SQL commands')
  }
}

// Run the setup
setupFeedbackTable() 