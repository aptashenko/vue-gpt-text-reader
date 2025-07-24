import { useAuthStore } from '../stores/auth'

/**
 * Logout function that signs out the user
 * @param {boolean} redirectToLogin - Whether to redirect to login page (default: true)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logout(redirectToLogin = true) {
  const authStore = useAuthStore()

  try {
    // Sign out from Supabase
    const result = await authStore.signOut()

    if (result.success) {
      // Clear any additional app state if needed
      // For example, clear language learning store if it has user-specific data

      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export async function isAuthenticated() {
  const token = new Promise((resolve, reject) => setTimeout(() => {
    resolve(!!localStorage.getItem('access_token'))
  }), 600)
  return token;
}

/**
 * Get current user
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const authStore = useAuthStore()
  return authStore.user
}

/**
 * Force logout (useful for session expiration)
 */
export async function forceLogout() {
  const authStore = useAuthStore()

  // Clear user data immediately
  authStore.user = null
  authStore.isGuestMode = false

  // Clear any stored data
  localStorage.removeItem('supabase.auth.token')
  localStorage.removeItem('guestMode')
  sessionStorage.clear()

  return { success: true }
}
