<template>
  <div class="start-page">
    <div class="container">
      <h1 class="title">Choose a language to start reading</h1>

      <div class="language-grid">
        <template
            v-for="item in textsStore.languagesList"
        >
          <button
              v-for="(isActive, lang) in item"
              :key="lang"
              class="language-card"
              :class="{ active: selected === lang }"
              :disabled="!isActive"
              @click="selectLanguage(lang)"
          >
            <div class="flag">{{ flags[lang] }}</div>
            <div class="name">{{ lang.toUpperCase() }}</div>
            <span v-if="!isActive" class="coming-soon">Coming soon</span>
          </button>
        </template>
      </div>

      <div class="actions">
        <button
            class="start-btn"
            :disabled="!selected || loading"
            @click="start"
        >
          {{ loading ? 'Loading...' : 'Start reading' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.store'
import { useTextsStore } from '../stores/texts.store'

const router = useRouter()
const userStore = useUserStore()
const textsStore = useTextsStore()

const selected = ref(null)
const loading = ref(false)

const availableLanguages = [
  { code: 'en', label: 'English', flag: '' },
  { code: 'fr', label: 'French', flag: '' },
  { code: 'es', label: 'Spanish', flag: '' },
  { code: 'de', label: 'German', flag: '' },
  { code: 'uk', label: 'Ukrainian', flag: '' },
  { code: 'ru', label: 'Russian', flag: '' },
]

const flags = {
  en: '🇺🇸',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
  uk: '🇺🇦',
  ru: '🏳️'
}

function selectLanguage(code) {
  selected.value = code
}

async function start() {
  if (!selected.value) return
  loading.value = true

  const payload = {
    level: userStore.user.level,
    language_learning: selected.value,
    language_native: userStore.user.language
  }

  try {
    await textsStore.getRandomText(payload)
    router.push({
      name: 'TextSession',
      params: { id: textsStore.currentText.id },
      query: payload
    })
  } catch (err) {
    console.error('Failed to start reading:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 30px;
}

.language-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.language-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.language-card.active {
  background: #667eea;
  border-color: #667eea;
}

.language-card.active .name {
  color: white !important;
}

.flag {
  font-size: 2rem;
  margin-bottom: 8px;
}

.name {
  font-weight: 600;
  font-size: 1rem;
}

.actions {
  display: flex;
  justify-content: center;
}

.start-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.start-btn:hover:enabled {
  background: #5a67d8;
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.language-card:disabled {
  background: rgba(247, 250, 252, 0.5);
  cursor: not-allowed;
  border-color: #e2e8f0;
  position: relative;
  pointer-events: none;
}

.language-card:disabled div {
  opacity: 0.6;
}

.coming-soon {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  background: #f56565;
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 500;
}
</style>
