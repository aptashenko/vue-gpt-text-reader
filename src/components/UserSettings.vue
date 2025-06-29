<template>
  <div class="user-settings">
    <div class="settings-header">
      <BackButton :text="$t('userSettings.backToTexts')" small />
      <h2>{{ $t('userSettings.title') }}</h2>
    </div>

    <div class="settings-container">
      <!-- Native Language -->
      <div class="setting-group">
        <h3>{{ $t('userSettings.languagePreferences') }}</h3>
        <p class="setting-description">
          {{ $t('userSettings.languageDescription') }}
        </p>

        <div class="language-setting">
          <label for="native-language">{{ $t('userSettings.myNativeLanguage') }}</label>
          <div class="select-wrapper">
            <select
              id="native-language"
              v-model="nativeLanguage"
              @change="updateNativeLanguage"
              :disabled="saving"
            >
              <option value="en">🇺🇸 {{ $t('languages.en') }}</option>
              <option value="fr">🇫🇷 {{ $t('languages.fr') }}</option>
              <option value="es">🇪🇸 {{ $t('languages.es') }}</option>
              <option value="de">🇩🇪 {{ $t('languages.de') }}</option>
              <option value="uk">🇺🇦 {{ $t('languages.uk') }}</option>
              <option value="ru">🇷🇺 {{ $t('languages.ru') }}</option>
            </select>
          </div>
          <div class="status">
            <span v-if="saving" class="saving">{{ $t('userSettings.saving') }}</span>
            <span v-if="saveSuccess" class="saved">{{ $t('userSettings.settingsSaved') }}</span>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div class="setting-group">
        <h3>{{ $t('userSettings.howItWorks') }}</h3>
        <div class="info-cards">
          <div class="info-card">
            <div class="card-icon">📚</div>
            <h4>{{ $t('userSettings.readTexts') }}</h4>
            <p>{{ $t('userSettings.readTextsDesc') }}</p>
          </div>
          <div class="info-card">
            <div class="card-icon">🔍</div>
            <h4>{{ $t('userSettings.clickWords') }}</h4>
            <p>{{ $t('userSettings.clickWordsDesc') }}</p>
          </div>
          <div class="info-card">
            <div class="card-icon">🎯</div>
            <h4>{{ $t('userSettings.learnEffectively') }}</h4>
            <p>{{ $t('userSettings.learnEffectivelyDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- Example -->
      <div class="setting-group">
        <h3>{{ $t('userSettings.example') }}</h3>
        <div class="example">
          <p><strong>{{ $t('userSettings.exampleScenario') }}</strong></p>
          <div class="example-flow">
            <div class="flow-step">
              <span class="step-number">1</span>
              <span class="step-text">{{ $t('userSettings.exampleStep1') }}</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <span class="step-number">2</span>
              <span class="step-text">{{ $t('userSettings.exampleStep2') }}</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <span class="step-number">3</span>
              <span class="step-text">{{ $t('userSettings.exampleStep3') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Back -->
    <div class="actions">
      <router-link to="/texts" class="back-btn">← Back to Texts</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { UserPreferencesService } from '../services/userPreferences.js'
import BackButton from './BackButton.vue'
import { setLocale } from '../i18n'

const authStore = useAuthStore()
const nativeLanguage = ref('en')
const saving = ref(false)
const saveSuccess = ref(false)

onMounted(async () => {
  await loadUserPreferences()
})

const loadUserPreferences = async () => {
  try {
    const user = authStore.user
    if (user) {
      const preferences = await UserPreferencesService.getUserPreferences(user.id)
      nativeLanguage.value = preferences.native_language
    }
  } catch (error) {
    console.error('Error loading user preferences:', error)
  }
}

const updateNativeLanguage = async () => {
  saving.value = true
  saveSuccess.value = false
  try {
    const user = authStore.user
    if (user) {
      await UserPreferencesService.setNativeLanguage(user.id, nativeLanguage.value)
      setLocale(nativeLanguage.value)
      saveSuccess.value = true
      setTimeout(() => saveSuccess.value = false, 3000)
    }
  } catch (error) {
    console.error('Error updating native language:', error)
    alert('Error saving settings. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.user-settings {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #fffaf6;
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
}

h2 {
  text-align: center;
  font-size: 2.4rem;
  margin-bottom: 2rem;
  color: #5a4a42;
}

.settings-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.setting-group {
  margin-bottom: 3rem;
}
.setting-group h3 {
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  color: #5a4a42;
  border-bottom: 2px solid #e8d8c3;
  padding-bottom: 0.4rem;
}
.setting-description {
  color: #6e6259;
  margin-bottom: 1.5rem;
}

.language-setting {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.language-setting label {
  font-weight: 600;
  min-width: 160px;
  color: #5a4a42;
}
.select-wrapper {
  width: 220px;
}
.select-wrapper select {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid #d8a48f;
  background: white;
  font-weight: 500;
  appearance: none;
  transition: border-color 0.3s;
  color: #000;
}
.select-wrapper select:disabled {
  background: #f4f4f4;
  cursor: not-allowed;
}
.status {
  font-size: 0.95rem;
}
.saving {
  color: #d08a6e;
}
.saved {
  color: #28a745;
  font-weight: 600;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.info-card {
  background: #fff3e6;
  border: 2px solid #e8d8c3;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}
.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(216, 164, 143, 0.1);
}
.card-icon {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
}
.info-card h4 {
  color: #5a4a42;
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}
.info-card p {
  color: #6e6259;
  font-size: 0.95rem;
  line-height: 1.4;
}

.example {
  background: #f9f9f9;
  border-left: 4px solid #d8a48f;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
}
.example p {
  color: #5a4a42;
  margin-bottom: 1rem;
}
.example-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
}
.flow-step {
  background: #fff;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.step-number {
  background: #d8a48f;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step-text {
  color: #5a4a42;
}
.flow-arrow {
  font-size: 1.2rem;
  color: #d8a48f;
  font-weight: bold;
}

.actions {
  text-align: center;
  margin-top: 2rem;
}
.back-btn {
  background: #d8a48f;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s;
}
.back-btn:hover {
  background: #a0522d;
}

@media (max-width: 768px) {
  .user-settings {
    padding: 1rem;
  }

  .language-setting {
    flex-direction: column;
    align-items: flex-start;
  }

  .select-wrapper {
    width: 100%;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .example-flow {
    flex-direction: column;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }
  .step-text {
    font-size: 14px;
    text-align: start;
  }
}
</style>
