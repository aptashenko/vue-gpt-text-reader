import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, auth } from '../supabase'
import analyticsService from '../services/logsnag'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const loading = ref(true)
  const initialized = ref(false)
  const isGuestMode = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const canAccessProtectedRoutes = computed(() => isAuthenticated.value || isGuestMode.value)

  // Actions
  async function initializeAuth() {
    if (initialized.value) return

    try {
      // Check for guest mode in localStorage
      const guestMode = localStorage.getItem('guestMode') === 'true'
      if (guestMode) {
        isGuestMode.value = true
        loading.value = false
        initialized.value = true
        return
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        user.value = session.user
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            user.value = session.user
          } else {
            user.value = null
          }
          loading.value = false
        }
      )

      // Store subscription for cleanup
      authSubscription.value = subscription
      
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function enableGuestMode() {
    isGuestMode.value = true
    localStorage.setItem('guestMode', 'true')
    // Track user login for analytics
    try {
      await analyticsService.trackUserLogin('guest@guest.com', null)
      await analyticsService.trackActiveUser('daily', null)
    } catch (analyticsError) {
      console.error('Analytics tracking error:', analyticsError)
    }
    return { success: true }
  }

  function disableGuestMode() {
    isGuestMode.value = false
    localStorage.removeItem('guestMode')
    return { success: true }
  }

  async function signIn(email, password) {
    try {
      // Disable guest mode when signing in
      disableGuestMode()
      
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        throw error
      }

      if (data.user) {
        
        // Track user login for analytics
        try {
          await analyticsService.trackUserLogin(email, String(data.user.id))
          await analyticsService.trackActiveUser('daily', String(data.user.id))
        } catch (analyticsError) {
          console.error('Analytics tracking error:', analyticsError)
        }
        return { success: true }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error.message }
    }
  }

  async function signUp(email, password) {
    try {
      // Disable guest mode when signing up
      disableGuestMode()
      
      const { data, error } = await auth.signUp(email, password)
      
      if (error) {
        throw error
      }

      if (data.user) {
        // Track new user signup for analytics
        try {
          await analyticsService.trackUserSignUp(email, String(data.user.id))
          await analyticsService.trackActiveUser('daily', String(data.user.id))
        } catch (analyticsError) {
          console.error('Analytics tracking error:', analyticsError)
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: error.message }
    }
  }

  async function signOut(redirectToLogin = true) {
    try {
      // Clear user data immediately for better UX
      const wasGuestMode = isGuestMode.value
      user.value = null
      isGuestMode.value = false
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('guestMode')
      
      // If in guest mode, just return success
      if (wasGuestMode) {
        return { success: true }
      }
      
      // Sign out from Supabase if authenticated
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error.message }
    }
  }

  async function resetPassword(email) {
    try {
      const { error } = await auth.resetPassword(email)
      
      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error.message }
    }
  }

  async function updatePassword(password) {
    try {
      const { error } = await auth.updatePassword(password)
      
      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: error.message }
    }
  }

  // Cleanup subscription
  const authSubscription = ref(null)

  function cleanup() {
    if (authSubscription.value) {
      authSubscription.value.unsubscribe()
    }
  }

  return {
    // State
    user,
    loading,
    initialized,
    isGuestMode,
    
    // Computed
    isAuthenticated,
    canAccessProtectedRoutes,
    
    // Actions
    initializeAuth,
    enableGuestMode,
    disableGuestMode,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    cleanup
  }
}) 