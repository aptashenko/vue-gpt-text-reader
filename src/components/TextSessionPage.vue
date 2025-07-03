<template>
  <div class="text-session-page">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-top">
          <BackButton :text="$t('textSession.backToTexts')" small />
          <div class="language-info">
            <span class="language-badge">{{ store.getLanguageName(store.targetLanguage) }}</span>
            <span class="level-badge">{{ store.level }}</span>
          </div>
        </div>
        <h1 class="text-title">{{ currentText?.title }}</h1>
      </header>

      <!-- Loading State -->
      <div v-if="loadingText" class="loading">
        <div class="spinner"></div>
        <p>{{ $t('textSession.loadingText') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="no-text">
        <h2>{{ $t('textSession.textNotFound') }}</h2>
        <p>{{ fetchError }}</p>
        <button @click="goBack" class="back-button">
          {{ $t('app.back') }}
        </button>
      </div>

      <!-- Text Content -->
      <div v-else-if="currentText" class="content">
        <!-- Text Reading Section -->
        <section class="text-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('textSession.textForReading') }}</h2>
          </div>
          <button 
              @click="playTextPronunciation()" 
              class="text-pronunciation-btn" 
              disabled
              :title="$t('textSession.textPronunciationComingSoon')"
            >
              🔊
            </button>
          <div class="text-content">
            <p 
              v-for="(paragraph, index) in textParagraphs" 
              :key="index"
              class="paragraph"
              v-html="highlightWords(paragraph)"
            ></p>
          </div>
        </section>

        <!-- Dictionary Section -->
        <section class="dictionary-section">
          <h2 class="section-title">{{ $t('textSession.dictionary') }}</h2>
          <div class="dictionary-grid">
            <div 
              v-for="word in currentTextWords" 
              :key="word.word"
              class="dictionary-item"
              :class="{ active: hoveredWord === word.word }"
              :data-word="word.word"
              @mouseenter="hoveredWord = word.word"
              @mouseleave="hoveredWord = null"
            >
              <div class="word">{{ word.word }}</div>
              <div class="translation">
                {{ word.translations[store.nativeLanguage] || $t('textSession.translationNotFound') }}
              </div>
              <div class="dictionary-actions">
                <button
                  v-if="authStore.isAuthenticated && word.id"
                  @click.stop="saveWord(word)"
                  class="action-btn save-btn"
                  :class="{ saved: savedWordIds.has(word.id) }"
                  :disabled="savedWordIds.has(word.id)"
                  :title="savedWordIds.has(word.id) ? 'Saved' : 'Save this word'"
                >
                  <transition name="fade-scale" mode="out-in">
                    <span v-if="savedWordIds.has(word.id)" key="saved" class="save-icon">
                      ✅
                    </span>
                    <span v-else key="unsaved" class="save-icon">
                      💾
                    </span>
                  </transition>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Questions Section -->
        <section class="questions-section">
          <h2 class="section-title">{{ $t('textSession.questions') }}</h2>
          <div class="questions-list">
            <div 
              v-for="(question, index) in currentTextQuestions" 
              :key="index"
              class="question-item"
            >
              <label class="question-label">
                {{ index + 1 }}. {{ question }}
              </label>
              <textarea
                v-model="userAnswers[index]"
                class="answer-input"
                :placeholder="$t('textSession.answerPlaceholder', { number: index + 1 })"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <button 
            @click="checkAnswers"
            class="check-button"
            :disabled="!canSubmit || checking"
            :class="{ disabled: !canSubmit || checking }"
          >
            <span v-if="checking" class="loader"></span>
            {{ checking ? $t('textSession.checkingAnswers') : $t('textSession.checkAnswers') }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageLearningStore } from '../stores/languageLearning'
import { useAuthStore } from '../stores/auth'
import { gptService } from '../services/gpt'
import { supabase } from '../supabase.js'
import LogoutButton from './LogoutButton.vue'
import BackButton from './BackButton.vue'
import analyticsService from '../services/logsnag.js'
import { getAnalyticsUserId } from '../utils/analytics.js'
import { SavedWordsService } from '../services/savedWords.js'

const router = useRouter()
const route = useRoute()
const store = useLanguageLearningStore()
const authStore = useAuthStore()

// Local state
const userAnswers = ref([])
const checking = ref(false)
const loadingText = ref(true)
const fetchError = ref('')
const hoveredWord = ref(null)

const savedWordIds = ref(new Set())

async function fetchSavedWordIds() {
  if (!authStore.user) return
  try {
    const saved = await SavedWordsService.getUserSavedWords(authStore.user.id)
    savedWordIds.value = new Set(saved.map(item => item.dictionary.id))
  } catch (e) {
    console.error('Failed to fetch saved words:', e)
  }
}

async function saveWord(word) {
  if (!authStore.user) return
  try {
    await SavedWordsService.saveWordForUser(authStore.user.id, word.id)
    savedWordIds.value.add(word.id)
  } catch (e) {
    console.error('Failed to save word:', e)
  }
}

// Load user preferences on mount
onMounted(async () => {  
  // Load preferences from localStorage (already done in store)
  // Also load from database if user is authenticated
  if (authStore.user) {
    await store.loadUserPreferencesFromDB(authStore.user.id)
  }

  store.sessionStartTime = Date.now()
  
  // If we have a text ID in the route, fetch the text
  if (route.params.id) {
    await fetchTextById(route.params.id)
  }
  fetchSavedWordIds()
})

// Computed properties
const currentText = computed(() => store.currentText)
const currentTextWords = computed(() => store.currentTextWords)
const currentTextQuestions = computed(() => store.currentTextQuestions)

const textParagraphs = computed(() => {
  if (!currentText.value?.text) return []
  return currentText.value.text.split('\n').filter(p => p.trim())
})

const canSubmit = computed(() => {
  return currentTextQuestions.value.length > 0 && 
         userAnswers.value.some(answer => answer && answer.trim())
})

// Fetch text by id from Supabase
async function fetchTextById(id) {
  loadingText.value = true
  fetchError.value = ''
  try {
    
    // Fetch text data
    const { data: textData, error: textError } = await supabase
      .from('texts')
      .select('*')
      .eq('id', id)
      .single()
        
    if (textError) {
      console.error('Supabase text error:', textError)
      if (textError.code === 'PGRST116') {
        fetchError.value = 'Текст не найден. Возможно, база данных пуста или текст с таким ID не существует.'
      } else {
        fetchError.value = `Ошибка при загрузке текста: ${textError.message}`
      }
      store.currentText = null
      return
    }
    
    if (!textData) {
      fetchError.value = 'Текст не найден или произошла ошибка.'
      store.currentText = null
      return
    }
        
    // Fetch questions for this text
    const { data: questionsData, error: questionsError } = await supabase
      .from('text_questions')
      .select('*')
      .eq('text_id', id)
      .order('question_number')
        
    if (questionsError) {
      console.error('Supabase questions error:', questionsError)
      // Don't fail the entire fetch if questions fail, just log the error
      console.warn('Failed to fetch questions, but continuing with text')
    }
    
    // Fetch words for this text (from text_words table)
    const { data: textWordsData, error: textWordsError } = await supabase
      .from('text_words')
      .select(`
        word_order,
        dictionary (
          id,
          word,
          translation_en,
          translation_fr,
          translation_es,
          translation_de,
          translation_uk,
          translation_ru,
          part_of_speech,
          difficulty
        )
      `)
      .eq('text_id', id)
      .order('word_order')
        
    if (textWordsError) {
      console.error('Supabase text_words error:', textWordsError)
      // Don't fail the entire fetch if words fail, just log the error
      console.warn('Failed to fetch text words, but continuing with text')
    }
    
    // Transform words data to match expected structure
    const transformedWords = (textWordsData || [])
      .filter(item => item.dictionary) // Filter out any null dictionary entries
      .map(item => ({
        word: item.dictionary.word,
        translations: {
          en: item.dictionary.translation_en,
          fr: item.dictionary.translation_fr,
          es: item.dictionary.translation_es,
          de: item.dictionary.translation_de,
          uk: item.dictionary.translation_uk,
          ru: item.dictionary.translation_ru
        },
        part_of_speech: item.dictionary.part_of_speech,
        difficulty: item.dictionary.difficulty,
        id: item.dictionary.id // Add the dictionary ID
      }))
    
    // Normalize to match expected structure
    store.currentText = {
      ...textData,
      text: textData.content || textData.text,
      words: transformedWords,
      questions: questionsData ? questionsData.map(q => q.question_text) : []
    }
    
    // Initialize user answers array with the correct length
    userAnswers.value = new Array(store.currentText.questions.length).fill('')
    store.sessionResults = null
    
    // Отслеживаем начало чтения текста
    try {
      await analyticsService.trackTextRead(
        textData.title, 
        textData.language, 
        getAnalyticsUserId(),
        store.nativeLanguage
      )
      await analyticsService.trackTextSessionStarted(
        textData.id,
        textData.title,
        textData.language,
        getAnalyticsUserId()
      )
      await analyticsService.trackMetric('text_read', 1, {
        text_id: textData.id,
        title: textData.title,
        language: textData.language,
        user_id: getAnalyticsUserId()
      })
      
      // Track active user when they start reading
      await analyticsService.trackActiveUser('daily', getAnalyticsUserId())
    } catch (analyticsError) {
      console.error('Analytics tracking error:', analyticsError)
    }
  } catch (err) {
    console.error('Exception during text fetch:', err)
    fetchError.value = 'Ошибка при загрузке текста.'
    store.currentText = null
    
    // Отслеживаем ошибку загрузки текста
    try {
      await analyticsService.trackAppError(err, 'text_session_fetch', getAnalyticsUserId())
    } catch (analyticsError) {
      console.error('Analytics error tracking failed:', analyticsError)
    }
  } finally {
    loadingText.value = false
  }
}

// Watch for route param changes
watch(() => route.params.id, (id) => {
  if (id) fetchTextById(id)
}, { immediate: false })

// Methods
function highlightWords(text) {
  if (!currentTextWords.value.length) return text
    
  let highlightedText = text
  // Sort by length descending for phrase support
  const wordsSorted = [...currentTextWords.value].sort((a, b) => b.word.length - a.word.length)
  wordsSorted.forEach(word => {
    // Escape regex special chars
    const escaped = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    const translation = word.translations[store.nativeLanguage] || word.word
    highlightedText = highlightedText.replace(
      regex,
      `<span class=\"highlighted-word\" data-word=\"${word.word}\" title=\"${translation}\">${word.word}</span>`
    )
  })
  return highlightedText
}

// Helper to format ms to mm:ss
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

async function checkAnswers() {
  if (!canSubmit.value || checking.value) return
  checking.value = true
  try {
    store.setUserAnswers(userAnswers.value)
    const results = await gptService.checkAnswers(
      currentTextQuestions.value,
      userAnswers.value,
      store.targetLanguage,
      store.nativeLanguage,
      currentText.value?.text || ''
    )
    store.setSessionResults(results)
    
    // Отслеживаем завершение текста и ответы на вопросы
    try {
      const sessionDurationMs = Date.now() - (store.sessionStartTime || Date.now())
      const sessionDuration = formatDuration(sessionDurationMs)
      
      // Отслеживаем завершение текста
      await analyticsService.trackTextCompleted(
        store.currentText.title,
        store.currentText.language,
        getAnalyticsUserId(),
        sessionDuration
      )
      
      // Отслеживаем ответы на вопросы
      for (let i = 0; i < currentTextQuestions.value.length; i++) {
        const isCorrect = results.answers[i]?.isCorrect || false
        await analyticsService.trackQuestionAnswered(i + 1, isCorrect, getAnalyticsUserId())
        
        if (isCorrect) {
          await analyticsService.trackMetric('correct_answer', 1, {
            question_id: i + 1,
            user_id: getAnalyticsUserId()
          })
        } else {
          await analyticsService.trackMetric('incorrect_answer', 1, {
            question_id: i + 1,
            user_id: getAnalyticsUserId()
          })
        }
      }
      
      // Отслеживаем общую статистику
      await analyticsService.trackMetric('question_answered', currentTextQuestions.value.length, {
        text_id: store.currentText.id,
        user_id: getAnalyticsUserId()
      })
      
      // Отслеживаем завершение сессии
      await analyticsService.trackTextSessionEnded(
        store.currentText.id,
        store.currentText.title,
        store.currentText.language,
        sessionDuration,
        getAnalyticsUserId()
      )
      
    } catch (analyticsError) {
      console.error('Analytics tracking error:', analyticsError)
    } finally {
      store.sessionStartTime = null
    }
    
    router.push('/result')
  } catch (error) {
    console.error('Error checking answers:', error)
    
    // Отслеживаем ошибку
    try {
      await analyticsService.trackAppError(error, 'text_session_check_answers', getAnalyticsUserId())
    } catch (analyticsError) {
      console.error('Analytics error tracking failed:', analyticsError)
    }
    
    alert('Ошибка при проверке ответов. Попробуйте еще раз.')
  } finally {
    checking.value = false
  }
}

function goBack() {
  router.push('/')
}

function handleLogoutSuccess() {
  // Handle logout success
}

function handleLogoutError(error) {
  // Handle logout error
}

// Add event listeners after DOM update
watch(() => currentText.value, () => {
  nextTick(() => {
    document.querySelectorAll('.highlighted-word').forEach(el => {
      el.addEventListener('mouseenter', e => {
        hoveredWord.value = el.getAttribute('data-word')
      })
      el.addEventListener('mouseleave', e => {
        hoveredWord.value = null
      })
      el.addEventListener('click', e => {
        const word = el.getAttribute('data-word')
        scrollToDictionary(word)
      })
    })
  })
})

// Function to scroll to dictionary entry
function scrollToDictionary(word) {
  const dictionarySection = document.querySelector('.dictionary-section')
  const targetWord = document.querySelector(`[data-word="${word}"]`)
  
  if (dictionarySection && targetWord) {
    // Scroll to dictionary section
    dictionarySection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
    
    // Add a brief highlight effect to the target word
    setTimeout(() => {
      targetWord.classList.add('active')
      setTimeout(() => {
        targetWord.classList.remove('active')
      }, 2000) // Remove highlight after 2 seconds
    }, 500) // Wait for scroll to complete
  }
}

// Placeholder methods for future implementation
function addToQuizlet(word) {
  // TODO: Implement Quizlet integration in next release
  console.log('Add to Quizlet functionality will be implemented in next release:', word)
}

function playPronunciation(word) {
  // TODO: Implement pronunciation functionality in next release
  console.log('Pronunciation functionality will be implemented in next release:', word)
}

function playTextPronunciation() {
  // TODO: Implement text pronunciation functionality in next release
  console.log('Text pronunciation functionality will be implemented in next release')
}
</script>

<style scoped>
.text-session-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
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

.text-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
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

.content {
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

.text-section {
  position: relative;
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.section-header {
  margin-bottom: 15px;
}

.text-pronunciation-btn {
  position: absolute;
  right: 40px;
  top: 20px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: #718096;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.text-pronunciation-btn:disabled {
  color: #a8a8a8;
  cursor: not-allowed;
  opacity: 0.6;
}

.text-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #2d3748;
  text-align: justify;
}

.paragraph {
  margin-right: 6px;
  line-height: 1.2;
  display: inline-block;
}

.paragraph:last-child {
  margin-bottom: 0;
}

.highlighted-word {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
}

.highlighted-word::after {
  content: '🔍';
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.highlighted-word:hover::after {
  opacity: 1;
}

.highlighted-word.active,
.highlighted-word:hover {
  background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.12);
  z-index: 2;
  position: relative;
}

.dictionary-section {
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #48bb78;
}

.dictionary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.dictionary-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.dictionary-item:hover {
  border-color: #48bb78;
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.1);
}

.dictionary-item.active {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  background: #f0f4ff;
  z-index: 2;
  position: relative;
  border-color: #667eea;
}

.word {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
  font-size: 1rem;
}

.translation {
  color: #718096;
  font-size: 0.9rem;
}

.dictionary-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.action-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: #718096;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  color: #a8a8a8;
  cursor: not-allowed;
  opacity: 0.6;
}

.quizlet-btn {
  color: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
}

.quizlet-btn:disabled {
  color: #ffb3b3;
  transform: none;
}

.pronunciation-btn {
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
}

.pronunciation-btn:disabled {
  color: #b3e5e1;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: linear-gradient(90deg, #38b2ac 0%, #48bb78 100%);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.7em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
}
.save-btn:active {
  transform: scale(0.97);
}
.save-btn.saved {
  background: #e2e8f0;
}

.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(.4,2,.3,1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
.fade-scale-enter-to, .fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
@media (max-width: 600px) {
  .save-btn {
    font-size: 0.95rem;
    padding: 7px 12px;
    min-width: 32px;
    min-height: 32px;
  }
}

.questions-section {
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #ed8936;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.question-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.answer-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #667eea;
}

.check-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.check-button:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.check-button.disabled {
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

.no-text {
  text-align: center;
  padding: 60px 20px;
}

.no-text h2 {
  color: #2d3748;
  margin-bottom: 15px;
}

.no-text p {
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
  .text-session-page {
    padding: 0;
  }

  .language-info {
    margin-bottom: 0;
    gap: 4px;
  }

  .container {
    padding: 20px;
    margin: 10px 0;
  }
  
  .text-title {
    font-size: 1.5rem;
  }
  
  .dictionary-grid {
    grid-template-columns: 1fr;
  }
  
  .text-content {
    font-size: 1rem;
  }
}
</style>

<style>
.highlighted-word {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
}

.highlighted-word::after {
  content: '🔍';
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.highlighted-word:hover::after {
  opacity: 1;
}

.highlighted-word.active,
.highlighted-word:hover {
  background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.12);
  z-index: 2;
  position: relative;
}
</style> 