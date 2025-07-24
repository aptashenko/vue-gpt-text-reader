<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <header class="login-header">
          <h1 class="app-title">LangReader</h1>
          <p class="app-description">Login to continue learning with context.</p>
        </header>

        <form @submit.prevent="handleLogin" class="login-form">
          <BaseInput
              name="email"
              v-model="email"
              label="Email"
              placeholder="Enter your email"
              :error="errors.email"
          />

          <BaseInput
              name="password"
              v-model="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              :error="errors.password"
          />

          <BaseButton
              type="submit"
              :pending="authStore.authLoader"
              :disabled="authStore.authLoader"
          >
            {{ authStore.authLoader ? 'Loading...' : 'Login' }}
          </BaseButton>

          <BaseButton
              type="button"
              variant="guest"
              @click="handleGuestLogin"
          >
            Continue as Guest
          </BaseButton>
        </form>

        <div class="signup-link">
          Don’t have an account?
          <router-link to="/signup" class="signup-text">Sign up</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore1 } from '../stores/auth.store.js'
import BaseInput from '../shared/ui/Form/BaseInput.vue'
import BaseButton from '../shared/ui/BaseButton.vue'
import { useValidationErrors } from '../composables/validationErrors.js'
import {generateUUID} from "../utils/get-uuid.js";

const router = useRouter()
const authStore = useAuthStore1()

const email = ref('')
const password = ref('')
const errors = reactive({ email: '', password: '' })

const { applyErrorsFromBackend, resetErrors } = useValidationErrors(errors)

async function handleLogin() {
  resetErrors()

  if (!email.value.includes('@')) {
    errors.email = 'Invalid email format'
    return
  }

  try {
    await authStore.userSignIn({ email: email.value, password: password.value })
    router.push('/app')
  } catch (error) {
    applyErrorsFromBackend(error)
  }
}

function handleGuestLogin() {
  const uuid = generateUUID();
  authStore.loginAsGuest(uuid)
  router.push(`/app?guest=${uuid}`)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.app-description {
  font-size: 1rem;
  color: #718096;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.signup-link {
  text-align: center;
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  font-size: 0.95rem;
}

.signup-text {
  margin-left: 4px;
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.signup-text:hover {
  text-decoration: underline;
}
</style>
