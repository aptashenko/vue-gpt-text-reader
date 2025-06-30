<template>
  <div class="admin-feedback-page">
    <div class="container">
      <header class="header">
        <div class="header-top">
          <BackButton />
          <h1 class="title">{{ $t('adminFeedback.title') }}</h1>
        </div>
        <p class="subtitle">{{ $t('adminFeedback.subtitle') }}</p>
      </header>

      <!-- Access Denied for non-admin users -->
      <div v-if="!isAdmin" class="access-denied">
        <div class="access-denied-content">
          <h2>{{ $t('admin.accessDenied') }}</h2>
          <p>{{ $t('admin.accessDeniedMessage') }}</p>
          <button @click="$router.push('/')" class="back-button">
            {{ $t('admin.backToHome') }}
          </button>
        </div>
      </div>

      <!-- Admin Content -->
      <div v-else class="admin-content">
        <!-- Statistics -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">{{ $t('adminFeedback.totalFeedback') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.thisMonth }}</div>
            <div class="stat-label">{{ $t('adminFeedback.thisMonth') }}</div>
          </div>
        </div>

        <!-- Feedback List -->
        <div class="feedback-section">
          <h2 class="section-title">{{ $t('adminFeedback.allFeedback') }}</h2>
          
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>{{ $t('adminFeedback.loading') }}</p>
          </div>

          <div v-else-if="feedbackList.length === 0" class="no-feedback">
            <p>{{ $t('adminFeedback.noFeedback') }}</p>
          </div>

          <div v-else class="feedback-list">
            <div 
              v-for="feedback in feedbackList" 
              :key="feedback.id"
              class="feedback-item"
            >
              <div class="feedback-header">
                <div class="feedback-info">
                  <div class="feedback-email">{{ feedback.email }}</div>
                  <div class="feedback-date">{{ formatDate(feedback.submitted_at) }}</div>
                </div>
                <button 
                  @click="deleteFeedback(feedback.id)"
                  class="delete-button"
                  :disabled="deleting === feedback.id"
                >
                  <span v-if="deleting === feedback.id" class="loader"></span>
                  {{ $t('adminFeedback.delete') }}
                </button>
              </div>
              
              <div class="feedback-message">
                {{ feedback.message }}
              </div>
              
              <div v-if="feedback.user_id" class="feedback-user">
                {{ $t('adminFeedback.userId') }}: {{ feedback.user_id }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { FeedbackService } from '../services/feedback'
import BackButton from './BackButton.vue'
import { useI18n } from 'vue-i18n'
const authStore = useAuthStore()
const { t } = useI18n()


// State
const feedbackList = ref([])
const loading = ref(true)
const deleting = ref(null)
const stats = ref({ total: 0, thisMonth: 0 })

// Computed properties
const isAdmin = computed(() => {
  const user = authStore.user
  if (!user) return false
  
  const adminEmails = [
    'aptashenko2019@gmail.com',
    'your-email@example.com',
    'admin@example.com'
  ]
  const isAdminUser = adminEmails.includes(user.email)
  
  // Debug logging
  console.log('Admin check:', {
    userEmail: user.email,
    isAdmin: isAdminUser,
    adminEmails: adminEmails
  })
  
  return isAdminUser
})

// Methods
async function loadFeedback() {
  console.log('loadFeedback called, isAdmin:', isAdmin.value)
  
  if (!isAdmin.value) {
    console.log('Not admin, skipping feedback load')
    return
  }
  
  loading.value = true
  try {
    console.log('Fetching feedback data...')
    const [feedback, feedbackStats] = await Promise.all([
      FeedbackService.getAllFeedback(),
      FeedbackService.getFeedbackStats()
    ])
    
    console.log('Feedback data received:', {
      feedbackCount: feedback.length,
      feedback: feedback,
      stats: feedbackStats
    })
    
    feedbackList.value = feedback
    stats.value = feedbackStats
  } catch (error) {
    console.error('Error loading feedback:', error)
  } finally {
    loading.value = false
  }
}

async function deleteFeedback(feedbackId) {
  if (!confirm(t('adminFeedback.confirmDelete'))) return
  
  deleting.value = feedbackId
  try {
    await FeedbackService.deleteFeedback(feedbackId)
    feedbackList.value = feedbackList.value.filter(f => f.id !== feedbackId)
    stats.value.total--
  } catch (error) {
    console.error('Error deleting feedback:', error)
    alert(t('adminFeedback.deleteError'))
  } finally {
    deleting.value = null
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadFeedback()
})
</script>

<style scoped>
.admin-feedback-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
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

.access-denied {
  text-align: center;
  padding: 60px 20px;
}

.access-denied-content h2 {
  color: #e53e3e;
  margin-bottom: 15px;
}

.access-denied-content p {
  color: #718096;
  margin-bottom: 25px;
}

.back-button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.admin-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.feedback-section {
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #ed8936;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.loading {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-feedback {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feedback-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.feedback-info {
  flex: 1;
}

.feedback-email {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
  text-align: start;
}

.feedback-date {
  font-size: 0.9rem;
  color: #718096;
  text-align: start;
}

.delete-button {
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.delete-button:hover:not(:disabled) {
  background: #c53030;
  transform: translateY(-1px);
}

.delete-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.loader {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.feedback-message {
  color: #2d3748;
  line-height: 1.6;
  margin-bottom: 10px;
  white-space: pre-wrap;
  text-align: start;
}

.feedback-user {
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
  text-align: end;
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
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .feedback-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .delete-button {
    align-self: flex-end;
  }
}
</style> 