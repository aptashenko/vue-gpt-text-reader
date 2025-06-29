import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Usage: node setup-admin.js <email>')
    console.error('Example: node setup-admin.js your-email@example.com')
    process.exit(1)
  }

  try {
    console.log(`Setting up admin access for: ${email}`)
    
    // First, get the user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error fetching users:', userError)
      return
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`User with email ${email} not found. Please make sure the user has signed up first.`)
      return
    }
    
    console.log(`Found user: ${user.id}`)
    
    // Update user metadata to add admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'
        }
      }
    )
    
    if (updateError) {
      console.error('Error updating user:', updateError)
      return
    }
    
    console.log('✅ Admin access granted successfully!')
    console.log(`User ${email} now has admin privileges.`)
    console.log('\nYou can now:')
    console.log('1. Sign in with this email')
    console.log('2. Access the admin panel')
    console.log('3. Manage texts and dictionary entries')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

setupAdmin() 