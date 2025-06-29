import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectDatabase() {
  console.log('🔍 Inspecting database structure...')
  console.log('Supabase URL:', supabaseUrl)
  
  try {
    // First, let's check if we can connect at all
    console.log('\n📡 Testing connection...')
    
    // Try to get texts
    const { data: texts, error: textsError } = await supabase
      .from('texts')
      .select('*')
      .limit(5)
    
    console.log('Texts query result:', { data: texts, error: textsError })
    
    if (textsError) {
      console.error('❌ Error with texts table:', textsError)
      
      // Try to see if the table exists by checking the error code
      if (textsError.code === 'PGRST116') {
        console.log('📋 Table "texts" does not exist')
      }
    } else {
      console.log(`✅ Found ${texts.length} texts`)
      
      if (texts.length > 0) {
        console.log('\n📋 Sample text structure:')
        console.log(JSON.stringify(texts[0], null, 2))
      }
    }
    
    // Try other possible table names
    const possibleTableNames = ['text', 'content', 'articles', 'stories', 'lessons']
    
    for (const tableName of possibleTableNames) {
      console.log(`\n🔍 Checking table: ${tableName}`)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ Table "${tableName}" does not exist`)
        } else {
          console.log(`❌ Error with table "${tableName}":`, error.message)
        }
      } else {
        console.log(`✅ Table "${tableName}" exists with ${data.length} rows`)
        if (data.length > 0) {
          console.log('Sample data:', JSON.stringify(data[0], null, 2))
        }
      }
    }
    
    // Check if there are any tables at all by trying a simple query
    console.log('\n🔍 Checking if we can query anything...')
    const { data: testData, error: testError } = await supabase
      .from('texts')
      .select('count')
      .limit(1)
    
    console.log('Test query result:', { data: testData, error: testError })
    
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

inspectDatabase() 