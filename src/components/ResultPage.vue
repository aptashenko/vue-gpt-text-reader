<template>
  <div class="result-page">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-top">
          <BackButton text="Back to Session" small />
          <div class="language-info">
            <span class="language-badge">{{ store.getLanguageName(store.targetLanguage) }}</span>
            <span class="level-badge">{{ store.level }}</span>
          </div>
        </div>
        <h1 class="result-title">{{ $t('resultPage.results') }}</h1>
        <div class="overall-score">
          <div class="score-circle">
            <span class="score-number">{{ overallScore }}%</span>
          </div>
          <p class="score-label">{{ $t('resultPage.overallScore') }}</p>
        </div>
      </header>

      <!-- Results Content -->
      <div v-if="sessionResults" class="results-content">
        <!-- Text Info -->
        <section class="text-info-section">
          <h2 class="section-title">{{ $t('resultPage.textInfo', { title: currentText?.title }) }}</h2>
        </section>

        <!-- Individual Results -->
        <section class="question-results-section">
          <h2 class="section-title">{{ $t('resultPage.questionResults') }}</h2>
          <div class="results-list">
            <div 
              v-for="(result, index) in sessionResults.results" 
              :key="index"
              class="question-result"
            >
              <div class="question-header">
                <span class="question-number">{{ $t('resultPage.question', { number: index + 1 }) }}</span>
              </div>
              
              <div class="question-content">
                <div class="question-text">{{ result.question }}</div>
                
                <div class="answer-section">
                  <h4>{{ $t('resultPage.yourAnswer') }}</h4>
                  <div class="user-answer">{{ result.userAnswer || $t('resultPage.noAnswer') }}</div>
                </div>
                
                <div class="answer-section">
                  <h4>{{ $t('resultPage.correctAnswer') }}</h4>
                  <div class="corrected-answer">{{ result.correctedAnswer }}</div>
                </div>
                
                <div class="comment-section">
                  <h4>{{ $t('resultPage.comment') }}</h4>
                  <div class="comment">{{ result.comment }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Action Buttons -->
        <section class="actions-section">
          <div class="action-buttons">
            <button @click="nextText" class="next-button">
              {{ $t('resultPage.nextText') }}
            </button>
            <button @click="restart" class="restart-button">
              {{ $t('resultPage.restart') }}
            </button>
          </div>
        </section>

        <!-- Feedback Prompt -->
        <section class="feedback-prompt-section">
          <div class="feedback-prompt">
            <h3>{{ $t('resultPage.feedbackPrompt.title') }}</h3>
            <p>{{ $t('resultPage.feedbackPrompt.message') }}</p>
            <button @click="goToFeedback" class="feedback-button">
              {{ $t('resultPage.feedbackPrompt.button') }}
            </button>
          </div>
        </section>
      </div>

      <!-- No Results -->
      <div v-else class="no-results">
        <h2>{{ $t('resultPage.noResults') }}</h2>
        <p>{{ $t('resultPage.noResultsError') }}</p>
        <button @click="goBack" class="back-button">
          {{ $t('resultPage.backToSession') }}
        </button>
      </div>
      <section class="feedback-prompt-section">
          <div class="feedback-prompt">
            <h3>{{ $t('resultPage.feedbackPrompt.title') }}</h3>
            <p>{{ $t('resultPage.feedbackPrompt.message') }}</p>
            <button @click="goToFeedback" class="feedback-button">
              {{ $t('resultPage.feedbackPrompt.button') }}
            </button>
          </div>
        </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageLearningStore } from '../stores/languageLearning'
import LogoutButton from './LogoutButton.vue'
import BackButton from './BackButton.vue'

const router = useRouter()
const store = useLanguageLearningStore()

// Computed properties
const currentText = computed(() => store.currentText)
const sessionResults = computed(() => store.sessionResults)

const overallScore = computed(() => {
  if (!sessionResults.value?.results?.length) return 0
  
  const totalScore = sessionResults.value.results.reduce((sum, result) => sum + result.score, 0)
  const averageScore = totalScore / sessionResults.value.results.length
  return Math.round(averageScore * 100)
})

// Methods
function getScoreClass(score) {
  const percentage = score * 100
  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'poor'
}

function nextText() {
  // Load new random text
  store.loadRandomText()
  if (store.currentText && store.currentText.id) {
    router.push(`/session/${store.currentText.id}`)
  } else {
    setTimeout(() => {
      if (store.currentText && store.currentText.id) {
        router.push(`/session/${store.currentText.id}`)
      }
    }, 100)
  }
}

function restart() {
  // Reset everything and go back to start
  store.resetSession()
  router.push('/')
}

function goBack() {
  router.push('/session')
}

function goToFeedback() {
  router.push('/feedback')
}

function handleLogoutSuccess() {
  // Handle logout success
  console.log('Logout successful')
}

function handleLogoutError(error) {
  // Handle logout error
  console.error('Logout error:', error)
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}

.feedback-prompt {
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
  background: #f8fafc;
}

.container {
  max-width: 900px;
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
  margin-bottom: 15px;
}

.language-info {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.language-badge, .level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.result-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.overall-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.score-number {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.score-label {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.feedback-button {
  margin-top: 10px;
}

.text-info-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.question-results-section {
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #48bb78;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.question-result {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.question-number {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.question-content {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 1rem;
}

.answer-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #718096;
  margin: 0 0 8px 0;
}

.user-answer, .corrected-answer {
  background: #f7fafc;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.5;
  min-height: 60px;
}

.user-answer {
  border-left-color: #667eea;
  color: #2d3748;
}

.corrected-answer {
  border-left-color: #48bb78;
  color: #2d3748;
}

.comment-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #718096;
  margin: 0 0 8px 0;
}

.comment {
  background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #ed8936;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #744210;
}

.actions-section {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.next-button, .restart-button {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.next-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.restart-button {
  background: #e2e8f0;
  color: #4a5568;
}

.restart-button:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results h2 {
  color: #2d3748;
  margin-bottom: 15px;
}

.no-results p {
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

/* Responsive design */
@media (max-width: 768px) {
  .result-page {
    padding: 0px;
  }

  .container {
    padding: 20px;
    margin: 10px 0px;
  }
  
  
  .result-title {
    font-size: 1.5rem;
  }
  
  .answer-section {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .next-button, .restart-button {
    width: 100%;
  }
}
</style> 