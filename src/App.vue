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
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/auth.js'
import LoadingSpinner from './components/LoadingSpinner.vue'
import AppHeader from './components/AppHeader.vue'

const authStore = useAuthStore()

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
</style>
