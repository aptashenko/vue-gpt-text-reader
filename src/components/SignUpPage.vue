<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-card">
        <!-- Header -->
        <header class="signup-header">
          <h1 class="signup-title">{{ $t('auth.signup') }}</h1>
          <p class="signup-description">
            Join Read & Learn to track your progress and save your learning history.
          </p>
        </header>

        <!-- Sign Up Form -->
        <form @submit.prevent="handleSignUp" class="signup-form">
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
              placeholder="Create a password"
              required
              @blur="validatePassword"
            />
            <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'error': confirmPasswordError }"
              placeholder="Confirm your password"
              required
              @blur="validateConfirmPassword"
            />
            <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
          </div>

          <!-- Error Message -->
          <div v-if="signupError" class="signup-error">
            {{ signupError }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <!-- Sign Up Button -->
          <button
            type="submit"
            class="signup-button"
            :disabled="loading || !isFormValid"
            :class="{ 'loading': loading }"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? $t('app.loading') : $t('auth.signup') }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="login-link">
          {{ $t('auth.alreadyHaveAccount') }} 
          <router-link to="/login" class="login-text">{{ $t('auth.login') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const signupError = ref('')
const successMessage = ref('')

// Validation errors
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Computed properties
const isFormValid = computed(() => {
  return email.value.trim() && 
         password.value.trim() && 
         confirmPassword.value.trim() &&
         !emailError.value && 
         !passwordError.value &&
         !confirmPasswordError.value
})

// Validation methods
function validateEmail() {
  emailError.value = ''
  const emailValue = email.value.trim()
  
  if (!emailValue) {
    emailError.value = 'Email is required'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  
  return true
}

function validatePassword() {
  passwordError.value = ''
  const passwordValue = password.value.trim()
  
  if (!passwordValue) {
    passwordError.value = 'Password is required'
    return false
  }
  
  if (passwordValue.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  
  // Check if passwords match when confirm password is filled
  if (confirmPassword.value && passwordValue !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else if (confirmPassword.value) {
    confirmPasswordError.value = ''
  }
  
  return true
}

function validateConfirmPassword() {
  confirmPasswordError.value = ''
  const confirmPasswordValue = confirmPassword.value.trim()
  
  if (!confirmPasswordValue) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }
  
  if (confirmPasswordValue !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }
  
  return true
}

// Sign up method
async function handleSignUp() {
  if (!isFormValid.value) return
  
  loading.value = true
  signupError.value = ''
  successMessage.value = ''
  
  try {
    const result = await authStore.signUp(email.value, password.value)
    
    if (result.error) {
      if (result.error.includes('User already registered')) {
        signupError.value = 'An account with this email already exists'
      } else if (result.error.includes('Password should be at least')) {
        signupError.value = 'Password must be at least 6 characters long'
      } else {
        signupError.value = result.error
      }
      return
    }
    
    if (result.success) {
      // Successful registration
      successMessage.value = 'Account created successfully! Please check your email to verify your account.'
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (error) {
    console.error('Sign up error:', error)
    signupError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signup-container {
  width: 100%;
  max-width: 450px;
}

.signup-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.signup-header {
  text-align: center;
  margin-bottom: 32px;
}

.signup-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.signup-description {
  color: #718096;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.signup-form {
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

.signup-error {
  background: #fed7d7;
  color: #742a2a;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  font-size: 0.9rem;
}

.success-message {
  background: #c6f6d5;
  color: #22543d;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #9ae6b4;
  font-size: 0.9rem;
}

.signup-button {
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

.signup-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.signup-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.signup-button.loading {
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

.login-link {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  color: #2d3748;

}

.login-link p {
  font-size: 0.9rem;
  margin: 0;
}

.login-text {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.login-text:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 480px) {
  .signup-card {
    padding: 24px;
  }
  
  .signup-title {
    font-size: 1.75rem;
  }
  
  .signup-description {
    font-size: 0.9rem;
  }
  
  .signup-button {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
}
</style> 