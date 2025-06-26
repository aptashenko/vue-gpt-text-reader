import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ujqcpxdqpqlxnowyptbw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWNweGRxcHFseG5vd3lwdGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzUyMjUsImV4cCI6MjA2NjU1MTIyNX0.C2ZTtfGoZ1fm9pmSIHffI8xdYtdIWOWubrfxTm6FPyc'

// Validate URL format
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL. Must be a valid HTTPS URL.')
}

if (!supabaseKey) {
  throw new Error('Supabase key is required.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for authentication
export const auth = {
  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Sign up with email and password
  signUp: async (email, password) => {
    return await supabase.auth.signUp({
      email,
      password,
    })
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  // Sign out
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // Reset password
  resetPassword: async (email) => {
    return await supabase.auth.resetPasswordForEmail(email)
  },

  // Update password
  updatePassword: async (password) => {
    return await supabase.auth.updateUser({
      password: password
    })
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
} 