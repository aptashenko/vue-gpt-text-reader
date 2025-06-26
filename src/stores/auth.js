import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '../supabase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const initialized = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email)

  // Actions
  const initializeAuth = async () => {
    if (initialized.value) return
    
    try {
      loading.value = true
      // Get current user
      const currentUser = await auth.getCurrentUser()
      user.value = currentUser
      
      // Listen for auth state changes
      auth.onAuthStateChange((event, session) => {
        user.value = session?.user || null
        loading.value = false
        initialized.value = true
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      loading.value = false
      initialized.value = true
    }
  }

  const signUp = async (email, password) => {
    try {
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      user.value = data.user
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      user.value = null
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await auth.resetPassword(email)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return {
    // State
    user,
    loading,
    initialized,
    
    // Computed
    isAuthenticated,
    userEmail,
    
    // Actions
    initializeAuth,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
}) 