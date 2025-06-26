<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Oops! This page went missing</h2>
      <p>But don't worry — you can go back or explore your texts below.</p>
      <div class="actions">
        <router-link to="/texts" v-if="isAuthenticated" class="btn primary">
          Go to Texts
        </router-link>
        <router-link to="/" v-else class="btn primary">
          Go to Login
        </router-link>
        <button @click="goBack" class="btn secondary">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // If no history, redirect to appropriate page
    if (isAuthenticated.value) {
      router.push('/texts')
    } else {
      router.push('/')
    }
  }
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #fffaf6;
  padding: 2rem;
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
}

.not-found-content {
  text-align: center;
  padding: 3rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  max-width: 500px;
  width: 100%;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: #d08a6e;
  font-weight: 700;
}

h2 {
  font-size: 2rem;
  margin: 1rem 0 0.5rem;
  color: #5a4a42;
}

p {
  font-size: 1.1rem;
  color: #6e5c52;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.6rem;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn.primary {
  background: #98c9a3;
  color: white;
}
.btn.primary:hover {
  background: #82b28d;
}

.btn.secondary {
  background: #c7bcb5;
  color: white;
}
.btn.secondary:hover {
  background: #b0a39b;
}
</style> 