<template>
  <div class="saved-words-page">
    <div class="container">
      <h1 class="title">{{ $t('savedWords.title') }}</h1>
      <div v-if="loading" class="loading">{{ $t('savedWords.loading') }}</div>
      <div v-else-if="flashcards.length === 0" class="no-words">
        <p>{{ $t('savedWords.noWords') }}</p>
        <router-link to="/app" class="back-link">{{ $t('savedWords.backToApp') }}</router-link>
      </div>
      <div v-else class="flashcard-section">
        <div class="flashcard-wrapper">
          <div
            class="flashcard"
            :class="{ flipped: isFlipped }"
            @click="flipCard"
            tabindex="0"
            @keyup.enter="flipCard"
          >
            <div class="flashcard-face flashcard-front">
              <span class="word">{{ currentCard.word }}</span>
            </div>
            <div class="flashcard-face flashcard-back">
              <span class="translation">{{ currentCard.translation }}</span>
            </div>
          </div>
        </div>
        <div class="flashcard-controls">
          <button @click="prevCard" :disabled="currentIndex === 0">{{ $t('savedWords.previous') }}</button>
          <span class="counter">{{ $t('savedWords.counter', { current: currentIndex + 1, total: flashcards.length }) }}</span>
          <button @click="nextCard" :disabled="currentIndex === flashcards.length - 1">{{ $t('savedWords.next') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { SavedWordsService } from '../services/savedWords.js'
import { UserPreferencesService } from '../services/userPreferences.js'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const flashcards = ref([])
const currentIndex = ref(0)
const isFlipped = ref(false)
const userNativeLanguage = ref('en')

const currentCard = computed(() => flashcards.value[currentIndex.value] || {})

function flipCard() {
  isFlipped.value = !isFlipped.value
}
function nextCard() {
  if (currentIndex.value < flashcards.value.length - 1) {
    currentIndex.value++
    isFlipped.value = false
  }
}
function prevCard() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isFlipped.value = false
  }
}

async function loadSavedWords() {
  loading.value = true
  try {
    const user = authStore.user
    if (!user) {
      router.push('/login')
      return
    }
    // Get user's native language
    const prefs = await UserPreferencesService.getUserPreferences(user.id)
    userNativeLanguage.value = prefs.native_language || 'en'
    // Fetch saved words
    const saved = await SavedWordsService.getUserSavedWords(user.id)
    // Map to flashcard format
    flashcards.value = saved.map(item => ({
      word: item.dictionary.word,
      translation: item.dictionary[`translation_${userNativeLanguage.value}`] || item.dictionary.translation_en || item.dictionary.word
    }))
    currentIndex.value = 0
    isFlipped.value = false
  } catch (e) {
    console.error('Failed to load saved words:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated && !authStore.isGuestMode) {
    router.push('/login')
    return
  }
  loadSavedWords()
})
</script>

<style scoped>
.saved-words-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}
.container {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px 20px 40px 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08);
  text-align: center;
}
.title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 30px;
}
.loading {
  color: #667eea;
  font-size: 1.2rem;
  margin: 40px 0;
}
.no-words {
  color: #718096;
  font-size: 1.1rem;
  margin: 40px 0;
}
.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}
.flashcard-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.flashcard-wrapper {
  perspective: 1200px;
  margin-bottom: 24px;
  width: 100%;
}
.flashcard {
  width: 100%;
  height: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: transform 0.5s cubic-bezier(.4,2,.3,1), box-shadow 0.3s;
  transform-style: preserve-3d;
  outline: none;
}
.flashcard:active {
  box-shadow: 0 12px 36px rgba(102, 126, 234, 0.22);
}
.flashcard.flipped {
  transform: rotateY(180deg);
}
.flashcard-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 20px;
}
.flashcard-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.flashcard-back {
  background: linear-gradient(135deg, #48bb78 0%, #38b2ac 100%);
  color: #fff;
  transform: rotateY(180deg);
}
.word {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.translation {
  font-size: 1.7rem;
  font-weight: 600;
  letter-spacing: 1px;
}
.flashcard-controls {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 10px;
}
.flashcard-controls button {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.flashcard-controls button:disabled {
  background: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
}
.counter {
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 600;
}
@media (max-width: 600px) {
  .container {
    padding: 10px 2px 20px 2px;
  }
  .flashcard {
    max-width: 98vw;
    height: 250px;;
    font-size: 1.2rem;
  }
  .flashcard-face {
    padding: 10px;
  }
}
</style> 