<template>
  <div class="start-page" :key="currentLocale">
    <div class="container">
      <header class="header">
        <div class="header-top">
          <h1 class="title">{{ t('startPage.title') }}</h1>
        </div>
        <p class="subtitle">{{ t('startPage.subtitle') }}</p>
      </header>

      <form @submit.prevent="startLearning" class="setup-form">
        <!-- Target Language Selection -->
        <div class="form-section">
          <label class="form-label">{{ t('startPage.targetLanguage') }}</label>
          <div class="language-grid">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              type="button"
              class="language-card"
              :class="{ active: targetLanguage === lang.code }"
              @click="targetLanguage = lang.code"
            >
              <div class="language-flag">{{ getFlag(lang.code) }}</div>
              <div class="language-name">{{ t('languages.' + lang.code) }}</div>
            </button>
          </div>
        </div>

        <!-- Native Language Selection -->
        <div class="form-section">
          <label class="form-label">{{ t('startPage.nativeLanguage') }}</label>
          <div class="language-grid">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              type="button"
              class="language-card"
              :class="{ active: nativeLanguage === lang.code }"
              @click="nativeLanguage = lang.code"
            >
              <div class="language-flag">{{ getFlag(lang.code) }}</div>
              <div class="language-name">{{ t('languages.' + lang.code) }}</div>
            </button>
          </div>
        </div>

        <!-- Level Selection -->
        <div class="form-section">
          <label class="form-label">{{ t('startPage.level') }}</label>
          <div class="level-grid">
            <button
              v-for="level in availableLevels"
              :key="level.code"
              type="button"
              class="level-card"
              :class="{ active: selectedLevel === level.code }"
              @click="selectedLevel = level.code"
            >
              <div class="level-code">{{ level.code }}</div>
              <div class="level-name">{{ t('levels.' + level.code) }}</div>
              <div class="level-description">{{ level.description }}</div>
            </button>
          </div>
        </div>

        <!-- Text Count Display -->
        <div v-if="isFormValid" class="form-section">
          <div v-if="store.textCountLoading">{{ t('startPage.loadingTexts') }}</div>
          <div v-else>{{ t('startPage.availableTexts', { count: store.textCount }) }}</div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            type="submit"
            class="start-button"
            :disabled="!isFormValid"
            :class="{ disabled: !isFormValid }"
          >
            {{ t('startPage.startLearning') }}
          </button>
          
          <button
            v-if="isAdmin"
            type="button"
            @click="goToImport"
            class="import-button"
          >
            {{ t('startPage.importTexts') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLanguageLearningStore } from '../stores/languageLearning'
import { useAuthStore } from '../stores/auth.js'
import LogoutButton from './LogoutButton.vue'
import BackButton from './BackButton.vue'
import { setLocale, getCurrentLocale } from '../i18n'

const router = useRouter()
const store = useLanguageLearningStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

// Admin state
const isAdmin = ref(false)

// Form data
const targetLanguage = ref('')
const nativeLanguage = ref('')
const selectedLevel = ref('')

// Get available options from store
const availableLanguages = store.availableLanguages
const availableLevels = store.availableLevels

// Computed properties
const currentLocale = computed(() => {
  const current = locale.value
  console.log('currentLocale computed called, value:', current)
  return current
})

// Watch for locale changes
watch(currentLocale, (newLocale) => {
  console.log('currentLocale changed to:', newLocale)
})

onMounted(() => {
  checkAdminAccess()
  console.log('StartPage mounted, current locale:', getCurrentLocale())
  console.log('Current nativeLanguage value:', nativeLanguage.value)
})

const checkAdminAccess = () => {
  const user = authStore.user
  if (!user) {
    isAdmin.value = false
    return
  }
  const userMetadata = user.user_metadata
  if (userMetadata && userMetadata.role === 'admin') {
    isAdmin.value = true
    return
  }
  const adminEmails = [
    'aptashenko2019@gmail.com',
    'your-email@example.com',
    'admin@example.com'
  ]
  if (adminEmails.includes(user.email)) {
    isAdmin.value = true
    return
  }
  isAdmin.value = false
}

// Watch for native language changes and update i18n locale
watch(nativeLanguage, async (newLanguage) => {
  if (newLanguage) {
    console.log('Native language changed to:', newLanguage)
    locale.value = newLanguage
    console.log('Locale set to:', newLanguage)
    // Wait for the next tick to ensure the locale change is applied
    await nextTick()
    console.log('After nextTick, current locale:', getCurrentLocale())
  }
})

// Computed properties
const isFormValid = computed(() => {
  return targetLanguage.value && 
         nativeLanguage.value && 
         selectedLevel.value &&
         targetLanguage.value !== nativeLanguage.value &&
         store.textCount > 0
})

// Watch for changes and fetch text count
watch([targetLanguage, selectedLevel], ([lang, level]) => {
  if (lang && level) {
    store.targetLanguage = lang
    store.level = level
    store.fetchTextCount()
    console.log(store.textCount)
  } else {
    store.textCount = 0
  }
}, { immediate: true })

// Methods
function getFlag(langCode) {
  const flags = {
    'en': '🇺🇸',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'de': '🇩🇪',
    'uk': '🇺🇦',
    'ru': '🏳️'
  }
  return flags[langCode] || '🏳️'
}

function startLearning() {
  if (!isFormValid.value) return
  
  // Save user preferences to store
  store.setUserPreferences(
    targetLanguage.value,
    nativeLanguage.value,
    selectedLevel.value
  )
  
  // Load random text and navigate to session
  store.loadRandomText()
  if (store.currentText && store.currentText.id) {
    router.push(`/session/${store.currentText.id}`)
  } else {
    // fallback: wait for nextTick or use a watcher if needed
    setTimeout(() => {
      if (store.currentText && store.currentText.id) {
        router.push(`/session/${store.currentText.id}`)
      }
    }, 100)
  }
}

function goToImport() {
  router.push('/import')
}

function handleLogoutSuccess() {
  // Handle logout success
}

function handleLogoutError() {
  // Handle logout error
}
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 800px;
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
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: #2d3748;
}

.form-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.language-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.language-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  color: #2d3748;
  border-radius: 12px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.language-card:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.language-card.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.language-flag {
  font-size: 2rem;
  margin-bottom: 8px;
  line-height: 1;
}

.language-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.language-code {
  font-size: 0.8rem;
  opacity: 0.8;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.level-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  color: #2d3748;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.level-card:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.level-card.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.level-code {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.level-name {
  font-weight: 600;
  margin-bottom: 6px;
}

.level-description {
  font-size: 0.9rem;
  opacity: 0.8;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.start-button, .import-button {
  flex: 1;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  border-radius: 12px;
}

.start-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.start-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.start-button.disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.import-button {
  background: #ed8936;
  color: white;
}

.import-button:hover {
  background: #dd6b20;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(237, 137, 54, 0.3);
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
  
  .language-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .level-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 