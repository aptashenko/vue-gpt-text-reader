<template>
  <div class="dictionary-manager">
    <div class="header">
      <div class="header-top">
        <BackButton :text="$t('app.back')" small />
        <h2>{{ $t('dictionary.title') }}</h2>
      </div>
      <div class="user-info">
        <span class="info-icon">🎯</span>
        <span>{{ $t('dictionary.translationsTo', { language: getLanguageName(userNativeLanguage) }) }}</span>
      </div>
    </div>

    <div class="controls">
      <div class="filters">
        <div class="filter-group">
          <label for="language-filter">{{ $t('dictionary.textLanguage') }}</label>
          <select id="language-filter" v-model="selectedLanguage" @change="fetchWords">
            <option value="en">🇺🇸 {{ $t('languages.en') }}</option>
            <option value="fr">🇫🇷 {{ $t('languages.fr') }}</option>
            <option value="uk">🇺🇦 {{ $t('languages.uk') }}</option>
            <option value="ru">🇷🇺 {{ $t('languages.ru') }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="difficulty-filter">{{ $t('dictionary.difficulty') }}</label>
          <select id="difficulty-filter" v-model="selectedDifficulty">
            <option value="">{{ $t('dictionary.all') }}</option>
            <option value="beginner">{{ $t('difficulties.beginner') }}</option>
            <option value="intermediate">{{ $t('difficulties.intermediate') }}</option>
            <option value="advanced">{{ $t('difficulties.advanced') }}</option>
          </select>
        </div>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          v-model="searchTerm" 
          :placeholder="$t('dictionary.searchWords')"
          class="search-input"
        >
      </div>

      <button @click="showAddForm = true" class="add-btn">{{ $t('dictionary.addWord') }}</button>
    </div>

    <!-- Add/Edit Word Form -->
    <div v-if="showAddForm" class="modal-overlay" @click="closeForm">
      <div class="modal" @click.stop>
        <h3>{{ editingWord ? $t('admin.editWord') : $t('admin.addNewWord') }}</h3>
        <form @submit.prevent="saveWord" class="word-form">
          <div class="form-group">
            <label for="word">{{ $t('dictionary.word') }}:</label>
            <input 
              id="word" 
              v-model="newWord.word" 
              type="text" 
              required
              :disabled="editingWord"
            >
          </div>

          <div class="form-group">
            <label for="language">{{ $t('dictionary.textLanguage') }}:</label>
            <select id="language" v-model="newWord.language" required>
              <option value="en">{{ $t('languages.en') }}</option>
              <option value="fr">{{ $t('languages.fr') }}</option>
              <option value="uk">{{ $t('languages.uk') }}</option>
              <option value="ru">{{ $t('languages.ru') }}</option>
            </select>
          </div>

          <div class="translations-section">
            <h4>{{ $t('dictionary.translation') }}</h4>
            <div class="translation-grid">
              <div class="form-group">
                <label for="translation-en">{{ $t('languages.en') }}:</label>
                <input id="translation-en" v-model="newWord.translation_en" type="text">
              </div>
              <div class="form-group">
                <label for="translation-fr">{{ $t('languages.fr') }}:</label>
                <input id="translation-fr" v-model="newWord.translation_fr" type="text">
              </div>
              <div class="form-group">
                <label for="translation-es">{{ $t('languages.es') }}:</label>
                <input id="translation-es" v-model="newWord.translation_es" type="text">
              </div>
              <div class="form-group">
                <label for="translation-de">{{ $t('languages.de') }}:</label>
                <input id="translation-de" v-model="newWord.translation_de" type="text">
              </div>
              <div class="form-group">
                <label for="translation-uk">{{ $t('languages.uk') }}:</label>
                <input id="translation-uk" v-model="newWord.translation_uk" type="text">
              </div>
              <div class="form-group">
                <label for="translation-ru">{{ $t('languages.ru') }}:</label>
                <input id="translation-ru" v-model="newWord.translation_ru" type="text">
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="part-of-speech">{{ $t('dictionary.partOfSpeech') }}:</label>
              <select id="part-of-speech" v-model="newWord.part_of_speech">
                <option value="noun">{{ $t('dictionary.noun') }}</option>
                <option value="verb">{{ $t('dictionary.verb') }}</option>
                <option value="adjective">{{ $t('dictionary.adjective') }}</option>
                <option value="adverb">{{ $t('dictionary.adverb') }}</option>
                <option value="pronoun">{{ $t('dictionary.pronoun') }}</option>
                <option value="preposition">{{ $t('dictionary.preposition') }}</option>
                <option value="conjunction">{{ $t('dictionary.conjunction') }}</option>
                <option value="interjection">{{ $t('dictionary.interjection') }}</option>
                <option value="unknown">{{ $t('dictionary.unknown') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="difficulty">{{ $t('dictionary.difficulty') }}:</label>
              <select id="difficulty" v-model="newWord.difficulty">
                <option value="beginner">{{ $t('difficulties.beginner') }}</option>
                <option value="intermediate">{{ $t('difficulties.intermediate') }}</option>
                <option value="advanced">{{ $t('difficulties.advanced') }}</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeForm" class="cancel-btn">{{ $t('app.cancel') }}</button>
            <button type="submit" class="save-btn">{{ editingWord ? $t('app.save') : $t('app.add') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Words List -->
    <div class="words-container">
      <div v-if="loading" class="loading">{{ $t('dictionary.loadingWords') }}</div>
      
      <div v-else-if="filteredWords.length === 0" class="no-words">
        <p>{{ $t('dictionary.noWordsFound') }}</p>
        <button @click="showAddForm = true" class="add-btn">{{ $t('dictionary.addFirstWord') }}</button>
      </div>
      
      <div v-else class="words-grid">
        <div 
          v-for="word in filteredWords" 
          :key="word.id" 
          class="word-card"
          @click="editWord(word)"
        >
          <div class="word-header">
            <h3 class="word-text">{{ word.word }}</h3>
            <div class="word-meta">
              <span class="language-badge">{{ getLanguageName(word.language) }}</span>
              <span class="difficulty-badge" :class="word.difficulty">{{ $t('difficulties.' + word.difficulty) }}</span>
            </div>
          </div>
          
          <div class="translation-section">
            <h4>{{ $t('dictionary.translation') }}</h4>
            <div class="translations">
              <div class="translation-item">
                <span class="lang-label">🇺🇸 EN:</span>
                <span class="translation-text">{{ word.translation_en || '-' }}</span>
              </div>
              <div class="translation-item">
                <span class="lang-label">🇫🇷 FR:</span>
                <span class="translation-text">{{ word.translation_fr || '-' }}</span>
              </div>
              <div class="translation-item">
                <span class="lang-label">🇪🇸 ES:</span>
                <span class="translation-text">{{ word.translation_es || '-' }}</span>
              </div>
              <div class="translation-item">
                <span class="lang-label">🇩🇪 DE:</span>
                <span class="translation-text">{{ word.translation_de || '-' }}</span>
              </div>
              <div class="translation-item">
                <span class="lang-label">🇺🇦 UK:</span>
                <span class="translation-text">{{ word.translation_uk || '-' }}</span>
              </div>
              <div class="translation-item">
                <span class="lang-label">🇷🇺 RU:</span>
                <span class="translation-text">{{ word.translation_ru || '-' }}</span>
              </div>
            </div>
          </div>
          
          <div class="word-footer">
            <span class="part-of-speech">{{ $t('dictionary.' + word.part_of_speech) }}</span>
            <div class="word-actions">
              <button 
                @click.stop="addToQuizlet(word)" 
                class="action-btn quizlet-btn" 
                disabled
                :title="$t('dictionary.quizletComingSoon')"
              >
                ➕
              </button>
              <button 
                @click.stop="playPronunciation(word)" 
                class="action-btn pronunciation-btn" 
                disabled
                :title="$t('dictionary.pronunciationComingSoon')"
              >
                🔊
              </button>
              <button @click.stop="deleteWord(word.id)" class="delete-btn">{{ $t('app.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <router-link to="/texts" class="back-btn">← Back to Texts</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../supabase.js'
import { DictionaryService } from '../services/dictionary.js'
import { UserPreferencesService } from '../services/userPreferences.js'
import { useAuthStore } from '../stores/auth.js'
import BackButton from './BackButton.vue'
import analyticsService from '../services/logsnag.js'
import { getAnalyticsUserId } from '../utils/analytics.js'

const { t } = useI18n()
const authStore = useAuthStore()
const words = ref([])
const selectedLanguage = ref('en')
const selectedDifficulty = ref('')
const searchTerm = ref('')
const showAddForm = ref(false)
const editingWord = ref(null)
const loading = ref(true)
const userNativeLanguage = ref('en')

const newWord = ref({
  word: '',
  language: 'en',
  translation_en: '',
  translation_fr: '',
  translation_es: '',
  translation_de: '',
  translation_uk: '',
  translation_ru: '',
  part_of_speech: 'unknown',
  difficulty: 'beginner'
})

const loadUserPreferences = async () => {
  try {
    const user = authStore.user
    if (user) {
      const preferences = await UserPreferencesService.getUserPreferences(user.id)
      userNativeLanguage.value = preferences.native_language
    }
  } catch (error) {
    console.error('Error loading user preferences:', error)
  }
}

const fetchWords = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .order('word', { ascending: true })

    if (error) throw error

    words.value = data || []
    
    // Отслеживаем просмотр словаря
    try {
      await analyticsService.trackDictionaryViewed(getAnalyticsUserId())
      await analyticsService.trackMetric('dictionary_viewed', 1, { 
        language: selectedLanguage.value,
        user_id: getAnalyticsUserId() 
      })
      // Track active user when they view dictionary
      await analyticsService.trackActiveUser('daily', getAnalyticsUserId())
    } catch (analyticsError) {
      console.error('Analytics tracking error:', analyticsError)
    }
    
  } catch (error) {
    console.error('Error fetching words:', error)
    // Отслеживаем ошибку
    try {
      await analyticsService.trackAppError(error, 'dictionary_fetch', authStore.user?.id)
    } catch (analyticsError) {
      console.error('Analytics error tracking failed:', analyticsError)
    }
  } finally {
    loading.value = false
  }
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

const filteredWords = computed(() => {
  let filtered = words.value

  if (selectedLanguage.value) {
    filtered = filtered.filter(word => word.language === selectedLanguage.value)
  }

  if (selectedDifficulty.value) {
    filtered = filtered.filter(word => word.difficulty === selectedDifficulty.value)
  }

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(word => 
      word.word.toLowerCase().includes(search) ||
      word.translation_en?.toLowerCase().includes(search) ||
      word.translation_fr?.toLowerCase().includes(search) ||
      word.translation_es?.toLowerCase().includes(search) ||
      word.translation_de?.toLowerCase().includes(search) ||
      word.translation_uk?.toLowerCase().includes(search) ||
      word.translation_ru?.toLowerCase().includes(search)
    )
  }

  return filtered
})

const closeForm = () => {
  showAddForm.value = false
  editingWord.value = null
  resetForm()
}

const resetForm = () => {
  newWord.value = {
    word: '',
    language: 'en',
    translation_en: '',
    translation_fr: '',
    translation_es: '',
    translation_de: '',
    translation_uk: '',
    translation_ru: '',
    part_of_speech: 'unknown',
    difficulty: 'beginner'
  }
}

const editWord = (word) => {
  editingWord.value = word
  newWord.value = { ...word }
  showAddForm.value = true
}

const saveWord = async () => {
  try {
    if (editingWord.value) {
      await DictionaryService.updateWord(editingWord.value.id, newWord.value)
      
      // Отслеживаем обновление слова
      try {
        await analyticsService.trackMetric('word_updated', 1, {
          word: newWord.value.word,
          language: newWord.value.language,
          user_id: getAnalyticsUserId()
        })
        // Track active user when they update a word
        await analyticsService.trackActiveUser('daily', getAnalyticsUserId())
      } catch (analyticsError) {
        console.error('Analytics tracking error:', analyticsError)
      }
    } else {
      await DictionaryService.addWord(newWord.value)
      
      // Отслеживаем добавление слова
      try {
        await analyticsService.trackWordAdded(
          newWord.value.word,
          newWord.value.translation_en,
          newWord.value.language,
          authStore.user?.id
        )
        await analyticsService.trackMetric('word_added', 1, {
          word: newWord.value.word,
          language: newWord.value.language,
          user_id: authStore.user?.id
        })
      } catch (analyticsError) {
        console.error('Analytics tracking error:', analyticsError)
      }
    }
    
    await fetchWords()
    closeForm()
  } catch (error) {
    console.error('Error saving word:', error)
    
    // Отслеживаем ошибку
    try {
      await analyticsService.trackAppError(error, 'dictionary_save_word', authStore.user?.id)
    } catch (analyticsError) {
      console.error('Analytics error tracking failed:', analyticsError)
    }
    
    alert('Error saving word. Please try again.')
  }
}

const deleteWord = async (id) => {
  if (confirm('Are you sure you want to delete this word?')) {
    try {
      const wordToDelete = words.value.find(w => w.id === id)
      await DictionaryService.deleteWord(id)
      
      // Отслеживаем удаление слова
      try {
        await analyticsService.trackWordRemoved(
          wordToDelete?.word || 'unknown',
          wordToDelete?.language || 'unknown',
          authStore.user?.id
        )
        await analyticsService.trackMetric('word_removed', 1, {
          word: wordToDelete?.word || 'unknown',
          language: wordToDelete?.language || 'unknown',
          user_id: authStore.user?.id
        })
      } catch (analyticsError) {
        console.error('Analytics tracking error:', analyticsError)
      }
      
      await fetchWords()
    } catch (error) {
      console.error('Error deleting word:', error)
      
      // Отслеживаем ошибку
      try {
        await analyticsService.trackAppError(error, 'dictionary_delete_word', authStore.user?.id)
      } catch (analyticsError) {
        console.error('Analytics error tracking failed:', analyticsError)
      }
      
      alert('Error deleting word. Please try again.')
    }
  }
}

// Placeholder methods for future implementation
const addToQuizlet = (word) => {
  // TODO: Implement Quizlet integration in next release
  console.log('Add to Quizlet functionality will be implemented in next release:', word)
}

const playPronunciation = (word) => {
  // TODO: Implement pronunciation functionality in next release
  console.log('Pronunciation functionality will be implemented in next release:', word)
}

onMounted(async () => {
  await loadUserPreferences()
  await fetchWords()
})
</script>

<style scoped>
.dictionary-manager {
  max-width: 900px;
  margin: 60px auto;
  padding: 2rem;
  background: #fffaf6;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: #3b3b3b;
  @media (max-width: 768px) {
    margin: 10px auto;
  }
}

h2, h3 {
  color: #5a4a42;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-icon {
  font-size: 1.2rem;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #6e5c52;
}

.filter-group select {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  background: #fffaf6;
  color: #3b3b3b;
}

.search-box {
  display: flex;
  flex: 1;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.7rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  background: #fffaf6;
}

.add-btn {
  padding: 0.7rem 1.2rem;
  background: #98c9a3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background: #82b28d;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #fffaf6;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.word-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #6e5c52;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  background: #fffaf6;
  color: #3b3b3b;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn, .save-btn {
  background: #c7bcb5;
  color: white;
}

.cancel-btn:hover, .save-btn:hover {
  background: #b0a39b;
}

.words-container {
  margin-bottom: 2rem;
}

.loading, .no-words {
  text-align: center;
  padding: 2rem;
  color: #7a6a5f;
  font-size: 1rem;
}

.words-grid {
  max-height: 500px;
  overflow-y: auto;
}

.word-card {
  background: #fefefe;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  cursor: pointer;
}

.word-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.word-text {
  margin-right: 0.5rem;
}

.word-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.language-badge {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.8rem;
  background: #d4edda;
  color: #155724;
}

.difficulty-badge {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.difficulty-badge.beginner {
  background: #d4edda;
  color: #155724;
}

.difficulty-badge.intermediate {
  background: #fff3cd;
  color: #856404;
}

.difficulty-badge.advanced {
  background: #f8d7da;
  color: #721c24;
}

.translation-section {
  margin-bottom: 0.6rem;
}

.translations {
  display: flex;
  gap: 0.5rem;
}

.translation-item {
  display: flex;
  flex-direction: column;
}

.lang-label {
  font-size: 0.9rem;
  color: #6e6e6e;
  font-weight: 500;
}

.translation-text {
  font-size: 1.1rem;
}

.word-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.part-of-speech {
  font-size: 0.9rem;
  color: #6e6e6e;
  font-style: italic;
}

.word-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  background: #c7bcb5;
  color: #3b3b3b;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #b0a39b;
}

.action-btn:disabled {
  background: #e9e5e2;
  color: #a8a8a8;
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn:disabled:hover {
  background: #e9e5e2;
  transform: none;
}

.quizlet-btn {
  background: #e5e5e5;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  padding: 0;
}

.quizlet-btn:hover:not(:disabled) {
  background: #e5e5e5;
  transform: scale(1.1);
}

.quizlet-btn:disabled {
  background: #e5e5e5;
  color: #ff8a8a;
  transform: none;
}

.pronunciation-btn {
  background: #4ecdc4;
  color: white;
}

.pronunciation-btn:hover:not(:disabled) {
  background: #45b7aa;
}

.pronunciation-btn:disabled {
  background: #b3e5e1;
  color: #80cbc4;
}

.delete-btn {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  padding: 0.7rem 1.2rem;
  background: #98c9a3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #82b28d;
}
</style> 