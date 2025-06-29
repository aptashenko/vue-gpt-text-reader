import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTexts() {
  console.log('🔍 Checking texts in database...')
  
  try {
    // Check if we can connect to the database
    console.log('📡 Testing database connection...')
    
    // Get all texts
    const { data: texts, error } = await supabase
      .from('texts')
      .select('*')
      .order('id')
    
    if (error) {
      console.error('❌ Database error:', error)
      return
    }
    
    console.log(`✅ Found ${texts.length} texts in database`)
    
    if (texts.length === 0) {
      console.log('📝 No texts found. You need to add some texts to the database.')
      console.log('💡 You can run the SQL commands from database-setup.sql in your Supabase SQL Editor')
      return
    }
    
    // Display all texts
    console.log('\n📚 Available texts:')
    texts.forEach((text, index) => {
      console.log(`${index + 1}. ID: ${text.id} - "${text.title}" (${text.language}, ${text.level})`)
    })
    
    // Check specific text with ID 1
    console.log('\n🔍 Checking text with ID 1...')
    const { data: text1, error: error1 } = await supabase
      .from('texts')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (error1) {
      console.error('❌ Error fetching text with ID 1:', error1)
    } else if (text1) {
      console.log('✅ Text with ID 1 found:', text1.title)
    } else {
      console.log('❌ Text with ID 1 not found')
    }
    
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

checkTexts() 