import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:')
  console.error('   VITE_SUPABASE_URL')
  console.error('   VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFeedbackTable() {
  console.log('🔍 Testing feedback table...')
  
  try {
    // Test 1: Check if table exists
    console.log('\n1. Checking if feedback table exists...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'feedback')
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError)
    } else {
      console.log('✅ Table check result:', tableInfo)
    }
    
    // Test 2: Try to fetch feedback data
    console.log('\n2. Trying to fetch feedback data...')
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .order('submitted_at', { ascending: false })
    
    if (feedbackError) {
      console.error('❌ Error fetching feedback:', feedbackError)
    } else {
      console.log('✅ Feedback data:', {
        count: feedback?.length || 0,
        data: feedback
      })
    }
    
    // Test 3: Check RLS policies
    console.log('\n3. Checking RLS policies...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'feedback' })
      .catch(() => ({ data: null, error: 'RPC not available' }))
    
    if (policiesError) {
      console.log('⚠️  Could not check policies (RPC not available):', policiesError)
    } else {
      console.log('✅ RLS policies:', policies)
    }
    
    // Test 4: Check current user
    console.log('\n4. Checking current user...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Error getting user:', userError)
    } else {
      console.log('✅ Current user:', {
        id: user?.id,
        email: user?.email,
        isAdmin: ['aptashenko2019@gmail.com', 'admin@example.com'].includes(user?.email)
      })
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testFeedbackTable() 