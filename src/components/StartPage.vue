<template>
  <div class="start-page">
    <div class="container">
      <header class="header">
        <div class="header-top">
          <h1 class="title">{{ pageTitle }}</h1>
        </div>
        <p class="subtitle">{{ pageSubtitle }}</p>
      </header>

      <form @submit.prevent="startLearning" class="setup-form">
        
        <!-- Target Language Selection -->
        <div class="form-section">
          <label class="form-label">{{ targetLanguageLabel }}</label>
          <div class="language-grid">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              type="button"
              class="language-card"
              :class="{ 
                active: targetLanguage === lang.code,
                disabled: ['es', 'de'].includes(lang.code)
              }"
              @click="['es', 'de'].includes(lang.code) ? null : targetLanguage = lang.code"
              :disabled="['es', 'de'].includes(lang.code)"
              :title="['es', 'de'].includes(lang.code) ? $t('startPage.comingSoon') : ''"
            >
              <div class="language-flag">{{ getFlag(lang.code) }}</div>
              <div class="language-name">{{ getLanguageName(lang.code) }}</div>
              <div v-if="['es', 'de'].includes(lang.code)" class="coming-soon-badge">
                {{ $t('startPage.comingSoon') }}
              </div>
            </button>
          </div>
        </div>

        <!-- Native Language Selection -->
        <div class="form-section">
          <label class="form-label">{{ nativeLanguageLabel }}</label>
          <div class="language-grid">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              type="button"
              class="language-card"
              :class="{ 
                active: nativeLanguage === lang.code,
                disabled: ['es', 'de'].includes(lang.code)
              }"
              @click="['es', 'de'].includes(lang.code) ? null : selectNativeLanguage(lang.code)"
              :disabled="['es', 'de'].includes(lang.code)"
              :title="['es', 'de'].includes(lang.code) ? $t('startPage.comingSoon') : ''"
            >
              <div class="language-flag">{{ getFlag(lang.code) }}</div>
              <div class="language-name">{{ getLanguageName(lang.code) }}</div>
              <div v-if="['es', 'de'].includes(lang.code)" class="coming-soon-badge">
                {{ $t('startPage.comingSoon') }}
              </div>
            </button>
          </div>
        </div>

        <!-- Level Selection -->
        <div class="form-section">
          <label class="form-label">{{ levelLabel }}</label>
          <div class="level-grid">
            <button
              v-for="level in availableLevels"
              :key="level.code"
              type="button"
              class="level-card"
              :class="{ 
                active: selectedLevel === level.code,
                disabled: ['B2', 'C1', 'C2'].includes(level.code)
              }"
              @click="['B2', 'C1', 'C2'].includes(level.code) ? null : selectedLevel = level.code"
              :disabled="['B2', 'C1', 'C2'].includes(level.code)"
              :title="['B2', 'C1', 'C2'].includes(level.code) ? $t('startPage.comingSoon') : ''"
            >
              <div class="level-code">{{ level.code }}</div>
              <div class="level-name">{{ $t(level.nameKey) }}</div>
              <div class="level-description">{{ $t(level.descriptionKey) }}</div>
              <div v-if="['B2', 'C1', 'C2'].includes(level.code)" class="coming-soon-badge">
                {{ $t('startPage.comingSoon') }}
              </div>
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
            {{ startLearningText }}
          </button>
          
          <button
            v-if="isAdmin"
            type="button"
            @click="goToImport"
            class="import-button"
          >
            {{ importTextsText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLanguageLearningStore } from '../stores/languageLearning'
import { useAuthStore } from '../stores/auth.js'
import { setLocale } from '../i18n'

const router = useRouter()
const store = useLanguageLearningStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

// Check authentication
if (!authStore.isAuthenticated && !authStore.isGuestMode) {
  router.push('/')
}

// Admin state
const isAdmin = ref(false)

// Form data
const targetLanguage = ref(store.targetLanguage)
const nativeLanguage = ref(store.nativeLanguage)
const selectedLevel = ref(store.level)

// Get available options from store
const availableLanguages = store.availableLanguages
const availableLevels = store.availableLevels

// Computed properties
const currentLocale = computed(() => {
  return locale.value
})

// Computed translations to ensure reactivity
const pageTitle = computed(() => t('startPage.title'))
const pageSubtitle = computed(() => t('startPage.subtitle'))
const targetLanguageLabel = computed(() => t('startPage.targetLanguage'))
const nativeLanguageLabel = computed(() => t('startPage.nativeLanguage'))
const levelLabel = computed(() => t('startPage.level'))
const startLearningText = computed(() => t('startPage.startLearning'))
const importTextsText = computed(() => t('startPage.importTexts'))

// Computed function for language names
const getLanguageName = computed(() => (code) => t('languages.' + code))

onMounted(() => {
  checkAdminAccess()
  checkAuthentication()
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

const checkAuthentication = () => {
  if (!authStore.isAuthenticated && !authStore.isGuestMode) {
    router.push('/')
  }
}

// Watch for native language changes and update i18n locale
watch(nativeLanguage, async (newLanguage) => {
  if (newLanguage) {
    // Set the locale using the i18n setLocale function
    setLocale(newLanguage)
    // Also update the reactive locale
    locale.value = newLanguage
  }
}, { immediate: true })

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

async function startLearning() {
  if (!isFormValid.value) return

  // Save user preferences to store
  store.setUserPreferences(
    targetLanguage.value,
    nativeLanguage.value,
    selectedLevel.value
  )
  
  // Load random text and navigate to session
  await store.loadRandomText()
  router.push(`/session/${store.currentText.id}`)
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

function selectNativeLanguage(langCode) {

  nativeLanguage.value = langCode
  // Update the store's nativeLanguage using the proper method
  store.setUserPreferences(
    store.targetLanguage,
    langCode,
    store.level
  )
  
  // Immediately set the locale
  setLocale(langCode)
  locale.value = langCode
}

function clearLocalStorage() {
  localStorage.removeItem('languageLearningPreferences')
  console.log('localStorage cleared')
  window.location.reload()
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
  position: relative;
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

.language-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #64748b;
}

.language-card.disabled:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  transform: none;
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
  position: relative;
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

.level-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #64748b;
}

.level-card.disabled:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  transform: none;
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

.coming-soon-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 10px 0;
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