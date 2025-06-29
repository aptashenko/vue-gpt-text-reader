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
  const isGuestMode = authStore.isGuestMode
  const canAccessProtectedRoutes = authStore.canAccessProtectedRoutes
  
  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth !== false // Default to requiring auth
  const isAuthPage = to.meta.isAuthPage === true
  const isPublicPage = to.meta.isPublicPage === true

  // If user is authenticated and trying to access auth pages (login/signup)
  if (isAuthenticated && isAuthPage) {
    next('/app') // Redirect to app page
    return
  }

  // If user is in guest mode and trying to access auth pages
  if (isGuestMode && isAuthPage) {
    next('/app') // Redirect to app page
    return
  }

  // If user is not authenticated, not in guest mode, and trying to access protected pages
  if (!canAccessProtectedRoutes && requiresAuth) {
    next('/login') // Redirect to login page
    return
  }

  // Allow navigation for public pages
  if (isPublicPage) {
    next()
    return
  }

  // Allow navigation for authenticated users or guest mode users
  if (canAccessProtectedRoutes) {
    next()
    return
  }

  // Fallback: redirect to login
  next('/login')
})

// Global afterEach hook to scroll to top after route changes
router.afterEach((to, from) => {
  // Scroll to top of the page
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })
})

export default router 