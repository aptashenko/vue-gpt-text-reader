export default [
  {
    path: '/',
    name: 'Login',
    component: () => import('./components/LoginPage.vue'),
    meta: {
      isAuthPage: true,
      requiresAuth: false
    }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('./components/SignUpPage.vue'),
    meta: {
      isAuthPage: true,
      requiresAuth: false
    }
  },
  {
    path: '/texts',
    name: 'TextList',
    component: () => import('./components/TextListPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/reader/:id',
    name: 'TextReader',
    component: () => import('./components/TextReaderPage.vue'),
    props: true,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/dictionary',
    name: 'DictionaryManager',
    component: () => import('./components/DictionaryManager.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./components/NotFoundPage.vue'),
    meta: {
      requiresAuth: false
    }
  }
] 