<template>
  <div class="signup-page">
    <div class="signup-container">
      <div v-if="!success" class="signup-card">
        <!-- Header -->
        <header class="signup-header">
          <h1 class="signup-title">Sign up</h1>
          <p class="signup-description">
            Join Read & Learn to track your progress and save your learning history.
          </p>
        </header>

        <!-- Form -->
        <form @submit.prevent="handleSignUp" class="signup-form">
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
              placeholder="Create a password"
              :error="errors.password"
          />

          <BaseInput
              name="confirmPassword"
              v-model="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              :error="errors.confirm_password"
          />

          <BaseButton
              type="submit"
              :pending="authStore.authLoader"
              :disabled="authStore.authLoader"
          >
            {{ authStore.authLoader ? 'Loading...' : 'Sign up' }}
          </BaseButton>
        </form>

        <!-- Link to Login -->
        <div class="login-link">
          Already have an account?
          <router-link to="/login" class="login-text">Login</router-link>
        </div>
      </div>

      <div v-else class="signup-card">
        <h2>Thank you! Check your email to confirm your registration.</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore1 } from '../stores/auth.store.js'
import { useValidationErrors } from '../composables/validationErrors'
import BaseInput from '../shared/ui/Form/BaseInput.vue'
import BaseButton from '../shared/ui/BaseButton.vue'

const authStore = useAuthStore1()

const success = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errors = reactive({
  email: '',
  password: '',
  confirm_password: ''
})

const { applyErrorsFromBackend, resetErrors } = useValidationErrors(errors)

function validateForm() {
  resetErrors()

  if (!email.value.includes('@')) {
    errors.email = 'Invalid email format'
    return false
  }

  if (password.value.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return false
  }

  if (password.value !== confirmPassword.value) {
    errors.confirm_password = 'Passwords do not match'
    return false
  }

  return true
}

async function handleSignUp() {
  if (!validateForm()) return

  try {
    await authStore.userSignUp({
      email: email.value,
      password: password.value,
      confirm_password: confirmPassword.value
    })
    success.value = true
  } catch (error) {
    applyErrorsFromBackend(error)
  }
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  color: #1a1a1a;
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
  font-size: 1rem;
  color: #718096;
  line-height: 1.5;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-link {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  font-size: 0.95rem;
}

.login-text {
  margin-left: 4px;
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.login-text:hover {
  text-decoration: underline;
}

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
}
</style>
