export default [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/landing.vue'),
    meta: {
      requiresAuth: false,
      isPublicPage: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/profile.vue'),
  },
  {
    path: '/app',
    name: 'app',
    component: () => import('../views/start-page.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue'),
    meta: {
      requiresAuth: false,
      isAuthPage: true,
      isPublicPage: true
    }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('../views/registration.vue'),
    meta: {
      requiresAuth: false,
      isAuthPage: true,
      isPublicPage: true
    }
  },
  {
    path: '/session/:id',
    name: 'TextSession',
    component: () => import('../views/text-session-page.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../components/ResultPage.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin-page.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/import',
    name: 'TextImporter',
    component: () => import('../components/TextImporter.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/saved-words',
    name: 'SavedWords',
    component: () => import('../components/SavedWordsPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/NotFoundPage.vue'),
    meta: {
      requiresAuth: false,
      isPublicPage: true
    }
  }
]
