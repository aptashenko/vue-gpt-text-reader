// Check text_questions table structure
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'your_supabase_url_here'
const supabaseKey = 'your_anon_key_here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTextQuestionsTable() {
  try {
    console.log('Checking text_questions table structure...')
    
    // Check if table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'text_questions')
    
    if (tableError) {
      console.error('Error checking table:', tableError)
      return
    }
    
    if (!tableInfo || tableInfo.length === 0) {
      console.error('text_questions table does not exist!')
      return
    }
    
    console.log('✅ text_questions table exists')
    
    // Check table structure
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'text_questions')
      .order('ordinal_position')
    
    if (columnError) {
      console.error('Error checking columns:', columnError)
      return
    }
    
    console.log('📋 Table structure:')
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`)
    })
    
    // Check RLS policies
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual, with_check')
      .eq('tablename', 'text_questions')
    
    if (policyError) {
      console.error('Error checking policies:', policyError)
      return
    }
    
    console.log('🔒 RLS Policies:')
    policies.forEach(policy => {
      console.log(`  ${policy.policyname}: ${policy.cmd}`)
    })
    
    // Try to insert a test question
    console.log('🧪 Testing question insertion...')
    const testQuestion = {
      text_id: 1, // Assuming text with ID 1 exists
      question_text: 'Test question',
      question_number: 1,
      question_type: 'comprehension',
      difficulty: 'A1',
      created_at: new Date().toISOString()
    }
    
    const { data: testInsert, error: testError } = await supabase
      .from('text_questions')
      .insert(testQuestion)
      .select()
    
    if (testError) {
      console.error('❌ Test insertion failed:', testError)
      console.error('Error details:', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code
      })
    } else {
      console.log('✅ Test insertion successful:', testInsert)
      
      // Clean up test data
      await supabase
        .from('text_questions')
        .delete()
        .eq('id', testInsert[0].id)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkTextQuestionsTable() 