<template>
  <LoadingSpinner 
    :show="authStore.loading" 
    message="Checking authentication"
  />
  <router-view />
</template>

<script setup>
import { useAuthStore } from './stores/auth.js'
import LoadingSpinner from './components/LoadingSpinner.vue'

const authStore = useAuthStore()
</script>

<style scoped>
/* Add global styles or layout styles here if needed */
</style>
