import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes.js'
import {authGuard} from "./guards/auth.js";

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(authGuard);

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
