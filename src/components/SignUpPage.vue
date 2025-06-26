<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="signUp">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
      <button type="submit" :disabled="loading">Sign Up</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </form>
    <div class="login-link">
      Already have an account? <router-link to="/">Login here</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const signUp = async () => {
  // Reset messages
  error.value = ''
  success.value = ''
  
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  // Validate password strength
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }
  
  loading.value = true
  
  try {
    const { error: signUpError } = await authStore.signUp(email.value, password.value)
    
    if (signUpError) {
      error.value = signUpError.message
    } else {
      success.value = 'Account created successfully! Please check your email to verify your account.'
      // Clear form
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      
      // Optionally redirect to login after a delay
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-container {
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

.success {
  margin-top: 1rem;
  color: #356e4b;
  background-color: #e1f3e9;
  border: 1px solid #cde9d9;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.95rem;
  text-align: center;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #6e5c52;
}

.login-link a {
  color: #d08a6e;
  font-weight: 500;
  text-decoration: none;
}
.login-link a:hover {
  text-decoration: underline;
}

</style> 