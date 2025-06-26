<template>
  <div class="login-container">
    <h2>Welcome Back</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
    <div class="signup-link">
      Don't have an account?
      <router-link to="/signup">Sign up here</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const login = async () => {
  loading.value = true
  error.value = ''
  
  const { error: loginError } = await authStore.signIn(email.value, password.value)
  
  loading.value = false
  
  if (loginError) {
    error.value = loginError.message
  } else {
    router.push('/texts')
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 2rem;
  border-radius: 16px;
  background: #fffaf6;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: #3b3b3b;
}

h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #5a4a42;
}

form {
  display: flex;
  flex-direction: column;
}

input {
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  font-size: 1rem;
  background: #fffaf6;
  color: #3b3b3b;
}

input:focus {
  outline: none;
  border-color: #d8a48f;
  background: #fff5ee;
}

button {
  padding: 0.75rem;
  background-color: #98c9a3;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #82b28d;
}
button:disabled {
  background-color: #b7d2bf;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: #a94442;
  background-color: #fcebea;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.95rem;
  text-align: center;
}

.signup-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #6e5c52;
}

.signup-link a {
  color: #d08a6e;
  font-weight: 500;
  text-decoration: none;
}
.signup-link a:hover {
  text-decoration: underline;
}
</style>
