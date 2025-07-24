import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes.js'
import {authGuard} from "./guards/auth.js";

const router = createRouter({
  history: createWebHistory(),
  routes
})

let lastQuery = {}

export function preserveQuery(to) {
  // если в маршруте есть query — сохраняем его
  if (Object.keys(to.query).length > 0) {
    lastQuery = { ...lastQuery, ...to.query }
    return true
  }

  // если маршрут не содержит query, но есть сохранённый — добавим
  if (Object.keys(lastQuery).length > 0) {
    return {
      ...to,
      query: lastQuery
    }
  }

  return true
}

router.beforeEach(async (to) => {
  const authResult = await authGuard(to)

  if (authResult !== true) return authResult

  return preserveQuery(to)
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
