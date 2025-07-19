<template>
  <div class="signup-page">
    <div class="signup-container">
      <div v-if="!success" class="signup-card">
        <!-- Header -->
        <header class="signup-header">
          <h1 class="signup-title">{{ $t('auth.signup') }}</h1>
          <p class="signup-description">
            Join Read & Learn to track your progress and save your learning history.
          </p>
        </header>

        <!-- Form -->
        <form @submit.prevent="handleSignUp" class="signup-form">
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
              placeholder="Create a password"
              :error="errors.password"
          />

          <BaseInput
              name="confirmPassword"
              v-model="confirmPassword"
              type="password"
              :label="$t('auth.confirmPassword')"
              placeholder="Confirm your password"
              :error="errors.confirm_password"
          />
          <!-- Button -->
          <BaseButton
              type="submit"
              variant="primary"
              :pending="authStore.authLoader"
              :disabled="authStore.authLoader"
          >
            {{ authStore.authLoader ? $t('app.loading') : $t('auth.signup') }}
          </BaseButton>
        </form>

        <!-- Login Link -->
        <div class="login-link">
          {{ $t('auth.alreadyHaveAccount') }}
          <router-link to="/login" class="login-text">{{ $t('auth.login') }}</router-link>
        </div>
      </div>
      <div v-else class="signup-card">
        <h2>
          Thank you! Check your email to confirm your registration
        </h2>
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

const success = ref(false);
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
  if (!validateForm()) {
    console.log(errors)
    return
  }

  try {
    await authStore.userSignUp({email: email.value, password: password.value, confirm_password: confirmPassword.value})
    success.value = true;
  } catch (error) {
    console.error(error)
    applyErrorsFromBackend(error)
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
  color: #1a1a1a;
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
}
</style>
