<template>
  <div class="feedback-page">
    <div class="container">
      <header class="header">
        <div class="header-top">
          <BackButton />
          <h1 class="title">{{ $t('feedback.title') }}</h1>
        </div>
        <p class="subtitle">{{ $t('feedback.subtitle') }}</p>
      </header>

      <form @submit.prevent="submitFeedback" class="feedback-form">
        <div class="form-section">
          <label class="form-label">{{ $t('feedback.email') }}</label>
          <input
            v-model="email"
            type="email"
            class="email-input"
            :placeholder="$t('feedback.emailPlaceholder')"
            required
          />
        </div>

        <div class="form-section">
          <label class="form-label">{{ $t('feedback.message') }}</label>
          <textarea
            v-model="message"
            class="message-input"
            :placeholder="$t('feedback.messagePlaceholder')"
            rows="6"
            required
          ></textarea>
        </div>

        <div class="form-section">
          <button
            type="submit"
            class="submit-button"
            :disabled="!isFormValid || submitting"
            :class="{ disabled: !isFormValid || submitting }"
          >
            <span v-if="submitting" class="loader"></span>
            {{ submitting ? $t('feedback.submitting') : $t('feedback.submit') }}
          </button>
        </div>

        <div v-if="submitStatus" class="status-message" :class="submitStatus.type">
          {{ submitStatus.message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BackButton from './BackButton.vue'
import { FeedbackService } from '../services/feedback'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// Form data
const email = ref('')
const message = ref('')
const submitting = ref(false)
const submitStatus = ref(null)

// Computed properties
const isFormValid = computed(() => {
  return email.value.trim() && 
         message.value.trim() && 
         email.value.includes('@')
})

// Methods
async function submitFeedback() {
  if (!isFormValid.value || submitting.value) return
  
  submitting.value = true
  submitStatus.value = null
  
  try {
    await FeedbackService.submitFeedback({
      email: email.value.trim(),
      message: message.value.trim(),
      userId: authStore.user?.id || null
    })
    
    submitStatus.value = {
      type: 'success',
      message: t('feedback.successMessage')
    }
    
    // Clear form after successful submission
    email.value = ''
    message.value = ''
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)
    
  } catch (error) {
    console.error('Error submitting feedback:', error)
    submitStatus.value = {
      type: 'error',
      message: t('feedback.errorMessage')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.email-input, .message-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.email-input:focus, .message-input:focus {
  outline: none;
  border-color: #667eea;
}

.message-input {
  resize: vertical;
  min-height: 120px;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-button.disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-message {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.status-message.success {
  background: #f0fff4;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.status-message.error {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #feb2b2;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 10px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .header-top {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 