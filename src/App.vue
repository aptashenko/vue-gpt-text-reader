<template>
  <div id="app">
    <LoadingSpinner 
      :show="authStore.loading" 
      message="Loading..."
    />
    <AppHeader v-if="!authStore.loading" />
    <router-view v-if="!authStore.loading" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import LoadingSpinner from './components/LoadingSpinner.vue'
import AppHeader from './components/AppHeader.vue'
import analyticsService from './services/logsnag.js'
import { getAnalyticsUserId } from './utils/analytics.js'

const authStore = useAuthStore()
const route = useRoute()

const isLandingPage = computed(() => {
  return route.path === '/' || route.path === '/landing'
})

function buyMeACoffee() {
  // Track coffee button click
  try {
    analyticsService.trackMetric('coffee_button_clicked', 1, {
      user_id: getAnalyticsUserId(),
      page: route.path
    })
    analyticsService.track('coffee_button_clicked', {
      description: 'User clicked Buy me a coffee button',
      tags: { 
        user_id: getAnalyticsUserId(),
        page: route.path 
      },
      icon: '☕'
    })
  } catch (analyticsError) {
    console.error('Analytics tracking error:', analyticsError)
  }
  

  window.open('https://coff.ee/aptashenko', '_blank')
}

onMounted(async () => {
  await authStore.initializeAuth()
})

onUnmounted(() => {
  authStore.cleanup()
})
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
