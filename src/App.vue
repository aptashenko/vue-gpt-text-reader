<template>
  <div id="app">
    <loading-spinner v-if="authStore.loading" message="Loading..." />
    <template v-else>
      <app-header />
      <router-view />
    </template>
  </div>
</template>

<script setup>
import {onBeforeMount, onMounted} from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import {isAuthenticated} from "./utils/auth.js";
import {useAuthStore} from "./stores/auth.js";
import {useAuthStore1} from "./stores/auth.store.js";
import {useUserStore} from "./stores/user.store.js";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import AppHeader from "./components/AppHeader.vue";
import {useTextsStore} from "./stores/texts.store.js";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const authStore1 = useAuthStore1()
const userStore = useUserStore()
const textStore = useTextsStore()

router.isReady().then(isReady => {
  textStore.getLevels();
  textStore.getLanguages();
  handleAuthFlow(route)
})

onBeforeRouteUpdate(async (to, from, next) => {
  await handleAuthFlow(to)
  next()
})

async function handleAuthFlow(currentRoute) {
  const isAuth = await isAuthenticated()
  const isGuest = route.query.guest;
  if (isAuth && !isGuest) {
    await userStore.getUserInfo()
  }

  if (
      isAuth &&
      (!userStore.user.language || !userStore.user.level) &&
      currentRoute.name !== 'profile'
  ) {
    router.push({ name: 'profile' })
  }
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

body {
  padding: 0;
  background: #f7fafc;
}

.floating-coffee-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
  z-index: 1000;
}

.floating-coffee-button:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 8px 20px rgba(139, 69, 19, 0.4);
}

.floating-coffee-button:active {
  transform: translateY(0) scale(1);
}

@media (max-width: 768px) {
  .floating-coffee-button {
    bottom: 15px;
    right: 15px;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}
</style>
