export default [
  {
    path: '/',
    name: 'Landing',
    component: () => import('./components/LandingPage.vue'),
    meta: {
      requiresAuth: false,
      isPublicPage: true
    }
  },
  {
    path: '/app',
    name: 'App',
    component: () => import('./components/StartPage.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./components/LoginPage.vue'),
    meta: {
      requiresAuth: false,
      isAuthPage: true,
      isPublicPage: true
    }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('./components/SignUpPage.vue'),
    meta: {
      requiresAuth: false,
      isAuthPage: true,
      isPublicPage: true
    }
  },
  {
    path: '/session/:id',
    name: 'TextSession',
    component: () => import('./components/TextSessionPage.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('./components/ResultPage.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('./components/FeedbackPage.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('./components/AdminPage.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/admin/feedback',
    name: 'AdminFeedback',
    component: () => import('./components/AdminFeedbackPage.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/import',
    name: 'TextImporter',
    component: () => import('./components/TextImporter.vue'),
    meta: {
      requiresAuth: true // Requires authentication or guest mode
    }
  },
  {
    path: '/saved-words',
    name: 'SavedWords',
    component: () => import('./components/SavedWordsPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./components/NotFoundPage.vue'),
    meta: {
      requiresAuth: false,
      isPublicPage: true
    }
  }
] 
