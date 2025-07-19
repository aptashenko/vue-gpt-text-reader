<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <header class="login-header">
          <h1 class="app-title">{{ $t('app.title') }}</h1>
          <p class="app-description">
            {{ $t('auth.loginDescription') }}
          </p>
        </header>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <BaseInput
              name="email"
              v-model="email"
              :label="$t('auth.email')"
              placeholder="Enter your email"
              :error="errors.email"
          />

          <BaseInput
              name="password"
              v-model="password"
              type="password"
              :label="$t('auth.password')"
              placeholder="Enter your password"
              :error="errors.password"
          />

          <base-button
              type="submit"
              variant="primary"
              :pending="authStore.authLoader"
              :disabled="authStore.authLoader"
          >
            {{ authStore.authLoader ? $t('app.loading') : $t('auth.login') }}
          </base-button>

          <base-button
              type="button"
              variant="guest"
              @click="handleGuestLogin"
          >
            {{ $t('auth.continueAsGuest') }}
          </base-button>
        </form>

        <!-- Sign Up Link -->
        <div class="signup-link">
          {{ $t('auth.dontHaveAccount') }}
          <router-link to="/signup" class="signup-text">{{ $t('auth.signup') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from 'vue'
import { useRouter } from 'vue-router'
import {useAuthStore1} from "../stores/auth.store.js";
import BaseInput from "../shared/ui/Form/BaseInput.vue";
import BaseButton from "../shared/ui/BaseButton.vue";
import {useValidationErrors} from "../composables/validationErrors.js";
const router = useRouter()
const authStore = useAuthStore1();

const errors = reactive({
  password: '',
  email: ''
})

const { applyErrorsFromBackend, resetErrors } = useValidationErrors(errors)

const email = ref('')
const password = ref('')

// Login method
async function handleLogin() {
  resetErrors();

  if (!email.value.includes('@')) {
    errors.email = 'Invalid email format'
    return
  }

  try {
    await authStore.userSignIn({
      email: email.value,
      password: password.value
    })
    router.push('/app')
  } catch (error) {
    console.error(error)
    applyErrorsFromBackend(error)
  }
}

const handleGuestLogin = () => {
  authStore.loginAsGuest();
  router.push('/app')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: white;
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
  color: #718096;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.signup-link {
  color: #2d3748;
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.signup-link p {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
}

.signup-text {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.signup-text:hover {
  color: #5a67d8;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .app-description {
    font-size: 0.9rem;
  }
}
</style>
