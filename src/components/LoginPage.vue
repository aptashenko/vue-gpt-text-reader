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
          <div class="form-group">
            <label for="email" class="form-label">{{ $t('auth.email') }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              :class="{ 'error': emailError }"
              placeholder="Enter your email"
              required
              @blur="validateEmail"
            />
            <span v-if="emailError" class="error-message">{{ emailError }}</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">{{ $t('auth.password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              :class="{ 'error': passwordError }"
              placeholder="Enter your password"
              required
              @blur="validatePassword"
            />
            <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
          </div>

          <!-- Error Message -->
          <div v-if="loginError" class="login-error">
            {{ loginError }}
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            class="login-button"
            :disabled="loading || !isFormValid"
            :class="{ 'loading': loading }"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? $t('app.loading') : $t('auth.login') }}
          </button>

          <!-- Guest Mode Button -->
          <button
            type="button"
            @click="continueAsGuest"
            class="guest-button"
            :disabled="loading"
          >
            {{ $t('auth.continueAsGuest') }}
          </button>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// Form data
const email = ref('')
const password = ref('')
const loading = ref(false)
const loginError = ref('')

// Validation errors
const emailError = ref('')
const passwordError = ref('')

// Computed properties
const isFormValid = computed(() => {
  return email.value.trim() && 
         password.value.trim() && 
         !emailError.value && 
         !passwordError.value
})

// Validation methods
function validateEmail() {
  emailError.value = ''
  const emailValue = email.value.trim()
  
  if (!emailValue) {
    emailError.value = t('auth.emailRequired')
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue)) {
    emailError.value = t('auth.invalidEmail')
    return false
  }
  
  return true
}

function validatePassword() {
  passwordError.value = ''
  const passwordValue = password.value.trim()
  
  if (!passwordValue) {
    passwordError.value = t('auth.passwordRequired')
    return false
  }
  
  if (passwordValue.length < 6) {
    passwordError.value = t('auth.passwordTooShort')
    return false
  }
  
  return true
}

// Login method
async function handleLogin() {
  if (!isFormValid.value) return
  
  loading.value = true
  loginError.value = ''
  
  try {
    const result = await authStore.signIn(email.value, password.value)
    
    if (result.error) {
      if (result.error.includes('Invalid login credentials')) {
        loginError.value = t('auth.invalidCredentials')
      } else {
        loginError.value = result.error
      }
      return
    }
    
    if (result.success) {
      // Successful login
      router.push('/app')
    }
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = t('auth.unexpectedError')
  } finally {
    loading.value = false
  }
}

// Guest mode
async function continueAsGuest() {
  loading.value = true
  
  try {
    const result = await authStore.enableGuestMode()
    
    if (result.success) {
      router.push('/app')
    }
  } catch (error) {
    console.error('Guest mode error:', error)
    loginError.value = t('auth.guestModeError')
  } finally {
    loading.value = false
  }
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  color: #2d3748;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.form-input.error:focus {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 4px;
}

.login-error {
  background: #fed7d7;
  color: #742a2a;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  font-size: 0.9rem;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-button.loading {
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.guest-button {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.guest-button:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.guest-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Responsive design */
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
  
  .login-button,
  .guest-button {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
}
</style>
