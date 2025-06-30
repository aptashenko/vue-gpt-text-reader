<template>
  <div class="analytics-dashboard">
    <div class="dashboard-header">
      <h2>{{ $t('analytics.title') }}</h2>
      <div class="date-range">
        <label>{{ $t('analytics.dateRange') }}:</label>
        <select v-model="dateRange" @change="onDateRangeChange">
          <option value="7d">{{ $t('analytics.last7Days') }}</option>
          <option value="30d">{{ $t('analytics.last30Days') }}</option>
          <option value="90d">{{ $t('analytics.last90Days') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('analytics.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>{{ $t('analytics.errorTitle') }}</h3>
      <p>{{ error }}</p>
      <button @click="fetchAnalytics" class="retry-button">
        {{ $t('analytics.retry') }}
      </button>
    </div>

    <!-- Analytics Content -->
    <div v-else>
      <div class="metrics-grid">
        <!-- User Engagement Metrics -->
        <div class="metric-card">
          <div class="metric-header">
            <h3>{{ $t('analytics.userEngagement') }}</h3>
            <span class="metric-icon">👥</span>
          </div>
          <div class="metric-content">
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.activeUsers') }}</span>
              <span class="metric-value">{{ metrics.activeUsers || 0 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.newUsers') }}</span>
              <span class="metric-value">{{ metrics.newUsers || 0 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.returningUsers') }}</span>
              <span class="metric-value">{{ metrics.returningUsers || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Content Metrics -->
        <div class="metric-card">
          <div class="metric-header">
            <h3>{{ $t('analytics.contentMetrics') }}</h3>
            <span class="metric-icon">📚</span>
          </div>
          <div class="metric-content">
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.textsRead') }}</span>
              <span class="metric-value">{{ metrics.textsRead || 0 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.textsCompleted') }}</span>
              <span class="metric-value">{{ metrics.textsCompleted || 0 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.wordsAdded') }}</span>
              <span class="metric-value">{{ metrics.wordsAdded || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Learning Metrics -->
        <div class="metric-card">
          <div class="metric-header">
            <h3>{{ $t('analytics.learningMetrics') }}</h3>
            <span class="metric-icon">🎯</span>
          </div>
          <div class="metric-content">
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.questionsAnswered') }}</span>
              <span class="metric-value">{{ metrics.questionsAnswered || 0 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.correctAnswers') }}</span>
              <span class="metric-value">{{ metrics.correctAnswers || 0 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.accuracyRate') }}</span>
              <span class="metric-value">{{ accuracyRate }}%</span>
            </div>
          </div>
        </div>

        <!-- Feedback Metrics -->
        <div class="metric-card">
          <div class="metric-header">
            <h3>{{ $t('analytics.feedbackMetrics') }}</h3>
            <span class="metric-icon">💬</span>
          </div>
          <div class="metric-content">
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.feedbackSubmitted') }}</span>
              <span class="metric-value">{{ metrics.feedbackSubmitted || 0 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ $t('analytics.avgRating') }}</span>
              <span class="metric-value">{{ averageRating }}/5</span>
            </div>
          </div>
        </div>

        <!-- Coffee Metrics -->
        <div class="metric-card">
          <div class="metric-header">
            <h3>Support Metrics</h3>
            <span class="metric-icon">☕</span>
          </div>
          <div class="metric-content">
            <div class="metric-item">
              <span class="metric-label">Coffee Button Clicks</span>
              <span class="metric-value">{{ metrics.coffeeButtonClicks || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Language Distribution -->
      <div class="chart-section">
        <h3>{{ $t('analytics.languageDistribution') }}</h3>
        <div class="language-chart">
          <div 
            v-for="lang in languageStats" 
            :key="lang.language"
            class="language-bar"
          >
            <div class="language-info">
              <span class="language-name">{{ getLanguageName(lang.language) }}</span>
              <span class="language-count">{{ lang.count }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: lang.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3>{{ $t('analytics.recentActivity') }}</h3>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { logsnag } from '../services/logsnag.js'

const { t } = useI18n()

// Reactive data
const loading = ref(true)
const error = ref(null)
const dateRange = ref('7d') // 7d, 30d, 90d

const metrics = ref({
  activeUsers: 0,
  newUsers: 0,
  returningUsers: 0,
  textsRead: 0,
  textsCompleted: 0,
  wordsAdded: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  feedbackSubmitted: 0,
  totalRating: 0,
  coffeeButtonClicks: 0
})

const languageStats = ref([])
const recentActivity = ref([])

// Computed properties
const accuracyRate = computed(() => {
  if (!metrics.value.questionsAnswered) return 0
  return Math.round((metrics.value.correctAnswers / metrics.value.questionsAnswered) * 100)
})

const averageRating = computed(() => {
  if (!metrics.value.feedbackSubmitted) return 0
  return (metrics.value.totalRating / metrics.value.feedbackSubmitted).toFixed(1)
})

// Methods
const fetchAnalytics = async () => {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      fetchUserMetrics(),
      fetchContentMetrics(),
      fetchLearningMetrics(),
      fetchFeedbackMetrics(),
      fetchCoffeeMetrics(),
      fetchLanguageStats(),
      fetchRecentActivity()
    ])
  } catch (err) {
    console.error('Error fetching analytics:', err)
    error.value = 'Failed to load analytics data'
  } finally {
    loading.value = false
  }
}

const fetchUserMetrics = async () => {
  try {
    // Получаем метрики пользователей за выбранный период
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange.value) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    // Получаем события регистрации и входа
    const signupEvents = await logsnag.getInsights('user_signup', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    const loginEvents = await logsnag.getInsights('user_login', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    // Получаем уникальных пользователей
    const uniqueUsers = await logsnag.getInsights('unique_users', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    metrics.value.newUsers = signupEvents?.value || 0
    metrics.value.activeUsers = uniqueUsers?.value || 0
    metrics.value.returningUsers = (loginEvents?.value || 0) - (signupEvents?.value || 0)
  } catch (err) {
    console.error('Error fetching user metrics:', err)
  }
}

const fetchContentMetrics = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange.value) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    // Получаем метрики чтения текстов
    const textReadEvents = await logsnag.getInsights('text_read', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    const textCompletedEvents = await logsnag.getInsights('text_completed', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    const wordAddedEvents = await logsnag.getInsights('word_added', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    metrics.value.textsRead = textReadEvents?.value || 0
    metrics.value.textsCompleted = textCompletedEvents?.value || 0
    metrics.value.wordsAdded = wordAddedEvents?.value || 0
  } catch (err) {
    console.error('Error fetching content metrics:', err)
  }
}

const fetchLearningMetrics = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange.value) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    // Получаем метрики вопросов
    const questionsAnsweredEvents = await logsnag.getInsights('question_answered', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    const correctAnswersEvents = await logsnag.getInsights('correct_answer', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    metrics.value.questionsAnswered = questionsAnsweredEvents?.value || 0
    metrics.value.correctAnswers = correctAnswersEvents?.value || 0
  } catch (err) {
    console.error('Error fetching learning metrics:', err)
  }
}

const fetchFeedbackMetrics = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange.value) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    // Получаем метрики обратной связи
    const feedbackEvents = await logsnag.getInsights('feedback_submitted', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    const ratingEvents = await logsnag.getInsights('feedback_rating', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    metrics.value.feedbackSubmitted = feedbackEvents?.value || 0
    metrics.value.totalRating = ratingEvents?.value || 0
  } catch (err) {
    console.error('Error fetching feedback metrics:', err)
  }
}

const fetchCoffeeMetrics = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange.value) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    // Получаем метрики кликов по кнопке кофе
    const coffeeClickEvents = await logsnag.getInsights('coffee_button_clicked', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    metrics.value.coffeeButtonClicks = coffeeClickEvents?.value || 0
  } catch (err) {
    console.error('Error fetching coffee metrics:', err)
  }
}

const fetchLanguageStats = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange.value) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    // Получаем статистику по языкам
    const languageEvents = await logsnag.getInsights('language_used', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    })

    // Если нет данных, используем дефолтные значения
    if (!languageEvents || !languageEvents.breakdown) {
      languageStats.value = [
        { language: 'en', count: 0, percentage: 0 },
        { language: 'fr', count: 0, percentage: 0 },
        { language: 'es', count: 0, percentage: 0 },
        { language: 'de', count: 0, percentage: 0 },
        { language: 'uk', count: 0, percentage: 0 },
        { language: 'ru', count: 0, percentage: 0 }
      ]
      return
    }

    const total = Object.values(languageEvents.breakdown).reduce((sum, count) => sum + count, 0)
    
    languageStats.value = Object.entries(languageEvents.breakdown).map(([lang, count]) => ({
      language: lang,
      count: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count)
  } catch (err) {
    console.error('Error fetching language stats:', err)
    // Fallback к дефолтным значениям
    languageStats.value = [
      { language: 'en', count: 0, percentage: 0 },
      { language: 'fr', count: 0, percentage: 0 },
      { language: 'es', count: 0, percentage: 0 },
      { language: 'de', count: 0, percentage: 0 },
      { language: 'uk', count: 0, percentage: 0 },
      { language: 'ru', count: 0, percentage: 0 }
    ]
  }
}

const fetchRecentActivity = async () => {
  try {
    // Получаем последние события
    const events = await logsnag.getEvents({
      limit: 10,
      event: ['text_read', 'active_users', 'user_signup', 'text_completed', 'word_added', 'question_answered', 'feedback_submitted', 'coffee_button_clicked', 'unique_users']
    })

    if (!events || !events.data) {
      recentActivity.value = []
      return
    }

    recentActivity.value = events.data.map((event, index) => {
      const iconMap = {
        'text_read': '📖',
        'text_completed': '✅',
        'word_added': '📝',
        'question_answered': '❓',
        'feedback_submitted': '💬',
        'coffee_button_clicked': '☕',
        'coffee_button_clicked': '☕'
      }

      const titleMap = {
        'text_read': 'User started reading a text',
        'text_completed': 'User completed a text',
        'word_added': 'New word added to dictionary',
        'question_answered': 'User answered a question',
        'feedback_submitted': 'New feedback submitted',
        'coffee_button_clicked': 'User clicked coffee button',
        'coffee_button_clicked': 'User clicked coffee button'
      }

      return {
        id: index + 1,
        icon: iconMap[event.event] || '📊',
        title: titleMap[event.event] || 'Activity recorded',
        timestamp: new Date(event.timestamp)
      }
    })
  } catch (err) {
    console.error('Error fetching recent activity:', err)
    recentActivity.value = []
  }
}

const onDateRangeChange = () => {
  fetchAnalytics()
}

const getLanguageName = (code) => {
  const languages = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    uk: 'Ukrainian',
    ru: 'Russian'
  }
  return languages[code] || code
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes} ${t('analytics.minutesAgo')}`
  } else if (hours < 24) {
    return `${hours} ${t('analytics.hoursAgo')}`
  } else {
    return `${days} ${t('analytics.daysAgo')}`
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<style scoped>
.analytics-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.dashboard-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-range label {
  font-weight: 600;
  color: #2d3748;
}

.date-range select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #2d3748;
  transition: border-color 0.2s ease;
}

.date-range select:focus {
  outline: none;
  border-color: #667eea;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #fed7d7;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-state h3 {
  color: #e53e3e;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.error-state p {
  color: #718096;
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.retry-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.metric-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 700;
}

.metric-icon {
  font-size: 1.5rem;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f7fafc;
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.metric-value {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
}

.chart-section, .activity-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.chart-section h3, .activity-section h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 700;
}

.language-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.language-bar {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.language-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.language-name {
  font-weight: 600;
  color: #2d3748;
}

.language-count {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: #edf2f7;
  border-color: #667eea;
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.activity-time {
  font-size: 0.85rem;
  color: #718096;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-dashboard {
    padding: 15px;
  }
  
  .dashboard-header h2 {
    font-size: 2rem;
  }
}
</style> 