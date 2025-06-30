// Utility functions for analytics user ID handling
import { useAuthStore } from '../stores/auth'

// Generate a unique guest user ID
export function generateGuestUserId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `guest_${timestamp}_${random}`
}

// Get current user ID for analytics (handles both authenticated and guest users)
export function getAnalyticsUserId() {
  const authStore = useAuthStore()
  
  // If authenticated user exists, use their ID
  if (authStore.user?.id) {
    return String(authStore.user.id)
  }
  
  let guestId = localStorage.getItem('guestUserId')
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('guestUserId', guestId)
  }
  return guestId
}

// Clear guest user ID when needed
export function clearAnalyticsGuestUserId() {
  localStorage.removeItem('guestUserId')
} 