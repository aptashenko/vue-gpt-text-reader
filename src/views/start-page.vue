<template>
  <div class="start-page">
    <div class="container">
      <header class="header">
        <div class="header-top">
          <h1 class="title">{{ pageTitle }}</h1>
        </div>
      </header>

      <form @submit.prevent="startLearning" class="setup-form">

        <div class="form-section">
          <label class="form-label">{{ targetLanguageLabel }}</label>
          <div class="language-grid">
            <template v-for="langItem in textsStore.languagesList">
              <button
                  v-for="(isActive, lang) in langItem"
                  :key="lang"
                  type="button"
                  class="language-card"
                  :class="{
                    active: currentLanguage === lang,
                    disabled: !isActive
                  }"
                  @click="selectSetting(isActive, lang)"
                  :disabled="!isActive"
                  :title="!isActive ? $t('startPage.comingSoon') : ''"
              >
                <div class="language-flag">{{ getFlag(lang) }}</div>
                <div class="language-name">{{ getLanguageName(lang) }}</div>
                <div v-if="!isActive" class="coming-soon-badge">
                  {{ $t('startPage.comingSoon') }}
                </div>
              </button>
            </template>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <base-button type="submit" :disabled="disableButton" :pending="textsStore.textLoader">
            {{ startLearningText }}
          </base-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import { useI18n } from 'vue-i18n'
import {useTextsStore} from "../stores/texts.store.js";
import BaseButton from "../shared/ui/BaseButton.vue";
import {useUserStore} from "../stores/user.store.js";
import {useRouter} from "vue-router";
import {setLocale} from "../i18n/index.js";
const router = useRouter();

const textsStore = useTextsStore();
const userStore = useUserStore();

const { t, locale } = useI18n();
const currentLanguage = ref(null);
// Computed translations to ensure reactivity
const pageTitle = computed(() => t('startPage.title'))
// const pageSubtitle = computed(() => t('startPage.subtitle'))
const targetLanguageLabel = computed(() => t('startPage.targetLanguage'))
const startLearningText = computed(() => t('startPage.startLearning'))

const getLanguageName = computed(() => (code) => t('languages.' + code))
const selectSetting = (active, lang) => {
  if (!active) return;
  currentLanguage.value = lang;
}

const disableButton = computed(() => !currentLanguage.value)

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

const startLearning = async () => {
  try {
    const payload = {
      level: userStore.user.level,
      language_learning: currentLanguage.value,
      language_native: userStore.user.language
    }

    await textsStore.getRandomText(payload);
    router.push({name: 'TextSession', params: {id: textsStore.currentText.id}, query: payload})
  } catch (err) {
    console.log(err)
  }
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
