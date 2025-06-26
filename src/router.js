import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.initialized) {
    await authStore.initializeAuth()
  }
  
  // Wait for auth to initialize if it's still loading
  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth !== false // Default to requiring auth
  const isAuthPage = to.meta.isAuthPage === true

  // If user is authenticated and trying to access auth pages (login/signup)
  if (isAuthenticated && isAuthPage) {
    next('/texts') // Redirect to texts page
    return
  }

  // If user is not authenticated and trying to access protected pages
  if (!isAuthenticated && requiresAuth) {
    next('/') // Redirect to login page
    return
  }

  // Allow navigation
  next()
})

export default router 