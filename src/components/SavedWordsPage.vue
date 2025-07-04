<template>
  <div class="saved-words-page">
    <div class="container">
      <!-- Folder View -->
      <div v-if="!currentFolder" class="folder-view">
        <h1 class="title">{{ $t('savedWords.title') }}</h1>
        
        <!-- Language Filter -->
        <div class="language-filter">
          <label for="language-select">{{ $t('savedWords.languageFilter') }}:</label>
          <select 
            id="language-select" 
            v-model="selectedLanguage" 
            @change="filterByLanguage"
            class="language-select"
          >
            <option value="">{{ $t('savedWords.allLanguages') }}</option>
            <option v-for="lang in allLanguages" :key="lang" :value="lang">
              {{ getLanguageName(lang) }}
            </option>
          </select>
        </div>

        <div v-if="loading" class="loading">{{ $t('savedWords.loading') }}</div>
        
        <div v-else class="folders-grid">
          <div 
            v-for="folder in filteredFolders" 
            :key="folder.id"
            @click="openFolder(folder)"
            class="folder-card"
            :class="{ 'default-folder': folder.is_default }"
          >
            <div class="folder-icon">
              {{ getFolderIcon(folder.theme) }}
            </div>
            <div class="folder-info">
              <h3 class="folder-name">{{ $t('savedWords.folders.' + folder.theme + '.name') }}</h3>
              <p class="folder-description">{{ $t('savedWords.folders.' + folder.theme + '.description') }}</p>
              <span class="word-count">{{ getFolderWordCount(folder.id) }} words</span>
            </div>
          </div>
        </div>

        <div v-if="!loading && filteredFolders.length === 0" class="no-words">
          <p>{{ $t('savedWords.noWords') }}</p>
          <router-link to="/app" class="back-link">{{ $t('savedWords.backToApp') }}</router-link>
        </div>
      </div>

      <!-- Folder Content View -->
      <div v-else class="folder-content">
        <div class="folder-header">
          <button @click="backToFolders" class="back-button">
            {{ $t('savedWords.backToFolders') }}
          </button>
          <h1 class="folder-title">{{ $t('savedWords.folders.' + currentFolder.theme + '.name') }}</h1>
          <p class="folder-description">{{ $t('savedWords.folders.' + currentFolder.theme + '.description') }}</p>
        </div>

        <!-- Word Status Tabs -->
        <div class="word-status-tabs">
          <button 
            @click="setActiveTab('unknown')" 
            class="tab-button"
            :class="{ active: activeTab === 'unknown' }"
          >
            {{ $t('savedWords.unknownWords') }} ({{ unknownWords.length }})
          </button>
          <button 
            @click="setActiveTab('known')" 
            class="tab-button"
            :class="{ active: activeTab === 'known' }"
          >
            {{ $t('savedWords.knownWords') }} ({{ knownWords.length }})
          </button>
        </div>

        <!-- Generate Words Button for Thematic Folders -->
        <div v-if="!currentFolder.is_default && !generating && activeTab === 'unknown'" class="generate-section">
          <p class="generate-prompt">{{ $t('savedWords.generatePrompt') }}</p>
          <button @click="generateWords" class="generate-button">
            {{ $t('savedWords.generateWords') }}
          </button>
        </div>

        <div v-if="generating" class="generating">
          {{ $t('savedWords.generating') }}
        </div>

        <!-- Success Message -->
        <div v-if="generatedCount > 0" class="success-message">
          {{ $t('savedWords.wordsGenerated', { count: generatedCount }) }}
        </div>

        <!-- Flashcards -->
        <div v-if="loading" class="loading">{{ $t('savedWords.loading') }}</div>
        <div v-else-if="currentWords.length === 0" class="no-words">
          <p>{{ activeTab === 'unknown' ? $t('savedWords.noUnknownWords') : $t('savedWords.noKnownWords') }}</p>
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
          
          <!-- Unknown Words Controls -->
          <div v-if="activeTab === 'unknown'" class="flashcard-controls unknown-controls">
            <button @click="markAsUnknown" class="control-button unknown-button">
              {{ $t('savedWords.dontKnow') }}
            </button>
            <span class="counter">
              {{ $t('savedWords.counter', { current: currentIndex + 1, total: currentWords.length }) }}
            </span>
            <button @click="markAsKnown" class="control-button known-button">
              {{ $t('savedWords.know') }}
            </button>
          </div>
          
          <!-- Known Words Controls -->
          <div v-else class="flashcard-controls known-controls">
            <button @click="prevCard" :disabled="currentIndex === 0" class="control-button">
              {{ $t('savedWords.previous') }}
            </button>
            <span class="counter">
              {{ $t('savedWords.counter', { current: currentIndex + 1, total: currentWords.length }) }}
            </span>
            <button @click="nextCard" :disabled="currentIndex === currentWords.length - 1" class="control-button">
              {{ $t('savedWords.next') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { SavedWordsService } from '../services/savedWords.js'
import { FoldersService } from '../services/folders.js'
import { UserPreferencesService } from '../services/userPreferences.js'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(true)
const generating = ref(false)
const generatedCount = ref(0)
const folders = ref([])
const currentFolder = ref(null)
const activeTab = ref('unknown')
const knownWords = ref([])
const unknownWords = ref([])
const currentIndex = ref(0)
const isFlipped = ref(false)
const userNativeLanguage = ref('en')
const selectedLanguage = ref('')
const availableLanguages = ref([])
const folderWordCounts = ref({})
const folderWordCountsByLanguage = ref({})

// Default supported languages
const DEFAULT_LANGUAGES = ['fr', 'en', 'es', 'de', 'ru', 'uk']

// Computed
const currentWords = computed(() => activeTab.value === 'known' ? knownWords.value : unknownWords.value)
const currentCard = computed(() => currentWords.value[currentIndex.value] || {})

const allLanguages = computed(() => {
  // Always show all default languages, plus any found in availableLanguages
  const langs = new Set([...DEFAULT_LANGUAGES, ...(availableLanguages.value || [])])
  return Array.from(langs).sort()
})

const targetLanguage = computed(() => selectedLanguage.value || 'fr')

const filteredFolders = computed(() => {
  // Show all folders, but only show a nonzero word count if the folder has words in the selected language
  // If you want to hide empty folders, uncomment the filter line below
  // return folders.value.filter(folder => getFolderWordCount(folder.id) > 0)
  return folders.value
})

// Methods
function getFolderIcon(theme) {
  const icons = {
    all: '📚',
    food: '🍽️',
    travel: '✈️',
    emotions: '❤️',
    nature: '🌿',
    work: '💼',
    family: '👨‍👩‍👧‍👦',
    technology: '💻',
    clothes: '👕',
    health: '🏥',
    daily: '📅'
  }
  return icons[theme] || '📁'
}

function getLanguageName(code) {
  const languages = {
    fr: 'French',
    en: 'English',
    es: 'Spanish',
    de: 'German',
    ru: 'Russian',
    uk: 'Ukrainian'
  }
  return languages[code] || code
}

async function loadFolders() {
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

    // Load folders
    folders.value = await FoldersService.getFolders()

    // Load available languages
    availableLanguages.value = await SavedWordsService.getSavedWordsLanguages(user.id)

    // Populate "All Words" folder with saved words
    await SavedWordsService.populateAllWordsFolder(user.id)

    // Batch fetch all folder word meta (folderId + language)
    const allMeta = await FoldersService.getAllFolderWordMeta(user.id)
    // Build counts for the selected language only
    folderWordCounts.value = {}
    folderWordCountsByLanguage.value = {}
    for (const meta of allMeta) {
      const folderId = meta.folder_id
      const lang = meta.dictionary?.language
      if (lang === targetLanguage.value) {
        // Count per folder for the selected language
        folderWordCounts.value[folderId] = (folderWordCounts.value[folderId] || 0) + 1
        // Count per folder-language
        const key = `${folderId}-${lang}`
        folderWordCountsByLanguage.value[key] = (folderWordCountsByLanguage.value[key] || 0) + 1
      }
    }
    
    console.log('Available languages:', availableLanguages.value)
    console.log('Folder word counts by language:', folderWordCountsByLanguage.value)

  } catch (e) {
    console.error('Failed to load folders:', e)
  } finally {
    loading.value = false
  }
}

async function openFolder(folder) {
  currentFolder.value = folder
  activeTab.value = 'unknown'
  await loadFolderWords(folder.id)
}

async function loadFolderWords(folderId) {
  loading.value = true
  try {
    const user = authStore.user
    
    // Load all words from the folder (temporarily without status filtering)
    const folderWordsData = await FoldersService.getFolderWords(user.id, folderId)
    
    // Filter by selected language
    const filteredWords = folderWordsData.filter(item => 
      item.dictionary.language === targetLanguage.value
    )
    
    // For now, treat all words as unknown until the database migration is applied
    // This will be updated once the word_status column is added
    const allWords = filteredWords.map(item => ({
      id: item.id,
      wordId: item.dictionary.id,
      word: item.dictionary.word,
      translation: item.dictionary[`translation_${userNativeLanguage.value}`] || 
                  item.dictionary.translation_en || 
                  item.dictionary.word,
      status: item.word_status || 'unknown' // Fallback to 'unknown' if column doesn't exist
    }))
    
    // Split into known and unknown lists
    knownWords.value = allWords.filter(word => word.status === 'known')
    unknownWords.value = allWords.filter(word => word.status === 'unknown')
    
    currentIndex.value = 0
    isFlipped.value = false
  } catch (e) {
    console.error('Failed to load folder words:', e)
  } finally {
    loading.value = false
  }
}

async function generateWords() {
  if (!currentFolder.value || currentFolder.value.is_default) return
  
  generating.value = true
  try {
    const user = authStore.user
    const addedWords = await FoldersService.generateWordsForFolder(
      user.id, 
      currentFolder.value.id, 
      userNativeLanguage.value,
      targetLanguage.value
    )
    
    generatedCount.value = addedWords.length
    
    // Reload folder words and all folder counts in one go
    await loadFolderWords(currentFolder.value.id)
    await loadFolders() // This will refresh all counts and batch data
    
    setTimeout(() => {
      generatedCount.value = 0
    }, 3000)
    
  } catch (e) {
    console.error('Failed to generate words:', e)
  } finally {
    generating.value = false
  }
}

async function markAsKnown() {
  if (!currentCard.value || activeTab.value !== 'unknown') return
  
  try {
    const user = authStore.user
    const currentWord = currentCard.value
    
    // Try to update the word status in the database (will fail gracefully if column doesn't exist)
    try {
      await FoldersService.markWordAsKnown(user.id, currentFolder.value.id, currentWord.wordId)
    } catch (dbError) {
      console.log('Database update failed (word_status column may not exist yet):', dbError.message)
    }
    
    // Move word from unknown to known list
    const wordIndex = unknownWords.value.findIndex(w => w.id === currentWord.id)
    if (wordIndex !== -1) {
      const movedWord = unknownWords.value.splice(wordIndex, 1)[0]
      movedWord.status = 'known'
      knownWords.value.push(movedWord)
      
      // If we're at the end of the unknown words, go back to the beginning
      if (currentIndex.value >= unknownWords.value.length) {
        currentIndex.value = Math.max(0, unknownWords.value.length - 1)
      }
      
      isFlipped.value = false
    }
  } catch (e) {
    console.error('Failed to mark word as known:', e)
  }
}

async function markAsUnknown() {
  if (!currentCard.value || activeTab.value !== 'unknown') return
  
  // Just move to the next card, word stays in unknown list
  nextCard()
}

function setActiveTab(tab) {
  activeTab.value = tab
  currentIndex.value = 0
  isFlipped.value = false
}

function filterByLanguage() {
  // Language filter is handled by computed property
  // The filteredFolders computed property will automatically update
  // when selectedLanguage changes
}

function backToFolders() {
  currentFolder.value = null
  activeTab.value = 'unknown'
  knownWords.value = []
  unknownWords.value = []
  currentIndex.value = 0
  isFlipped.value = false
  generatedCount.value = 0
}

function flipCard() {
  isFlipped.value = !isFlipped.value
}

function nextCard() {
  if (currentWords.value.length === 0) return
  
  if (currentIndex.value < currentWords.value.length - 1) {
    currentIndex.value++
  } else {
    // Loop back to the beginning
    currentIndex.value = 0
  }
  isFlipped.value = false
}

function prevCard() {
  if (currentWords.value.length === 0) return
  
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    // Loop to the end
    currentIndex.value = currentWords.value.length - 1
  }
  isFlipped.value = false
}

function getFolderWordCount(folderId) {
  // Use the batch data only
  return folderWordCounts.value[folderId] || 0
}

watch(selectedLanguage, () => {
  loadFolders()
  currentFolder.value = null
  knownWords.value = []
  unknownWords.value = []
  currentIndex.value = 0
  isFlipped.value = false
})

onMounted(() => {
  if (!authStore.isAuthenticated && !authStore.isGuestMode) {
    router.push('/login')
    return
  }
  loadFolders()
})
</script>

<style scoped>
.saved-words-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px 20px 40px 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 30px;
  text-align: center;
}

.language-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  justify-content: center;
}

.language-filter label {
  font-weight: 600;
  color: #4a5568;
}

.language-select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #2d3748;
  cursor: pointer;
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.folder-card {
  background: white;
  color: #2d3748;;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.folder-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.folder-card.default-folder {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.folder-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.folder-info {
  flex: 1;
}

.folder-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: inherit;
}

.folder-description {
  font-size: 0.9rem;
  margin: 0 0 8px 0;
  color: inherit;
  opacity: 0.8;
}

.word-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.7;
}

.folder-content {
  text-align: center;
}

.folder-header {
  margin-bottom: 30px;
}

.back-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;
}

.folder-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px 0;
}

.word-status-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-button {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4a5568;
}

.tab-button:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.tab-button.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.generate-section {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.generate-prompt {
  color: #4a5568;
  margin-bottom: 15px;
}

.generate-button {
  background: linear-gradient(135deg, #48bb78 0%, #38b2ac 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.generating {
  color: #667eea;
  font-size: 1.2rem;
  margin: 20px 0;
}

.success-message {
  background: #c6f6d5;
  color: #22543d;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
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

.control-button {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.control-button:disabled {
  background: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.unknown-controls .unknown-button {
  background: #e53e3e;
}

.unknown-controls .unknown-button:hover {
  background: #c53030;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
}

.unknown-controls .known-button {
  background: #48bb78;
}

.unknown-controls .known-button:hover {
  background: #38a169;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
}

.counter {
  font-weight: 600;
  color: #4a5568;
  min-width: 80px;
}

@media (max-width: 768px) {
  .container {
    padding: 20px 15px 30px 15px;
  }
  
  .word-status-tabs {
    flex-direction: column;
    gap: 8px;
  }
  
  .tab-button {
    width: 100%;
  }
  
  .flashcard-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .control-button {
    width: 100%;
    max-width: 200px;
  }
  
  .counter {
    order: -1;
    margin-bottom: 10px;
  }
}
</style> 