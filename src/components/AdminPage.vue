<template>
  <div v-if="!isAdmin" class="admin-access-denied">
    <div class="access-denied-content">
      <h2>{{ $t('admin.accessDenied') }}</h2>
      <p>{{ $t('admin.accessDeniedMessage') }}</p>
      <router-link to="/" class="back-link">{{ $t('admin.backToHome') }}</router-link>
    </div>
  </div>

  <div v-else class="admin-page">
    <div class="admin-content">
      <div class="admin-header">
        <BackButton text="Back to Home" small />
        <h2>{{ $t('admin.panel') }}</h2>
      </div>
    
    <!-- Language Selector -->
    <div class="language-selector">
      <label>{{ $t('admin.currentLanguage') }}</label>
      <select v-model="currentLanguage" @change="loadData">
        <option value="en">{{ $t('languages.en') }}</option>
        <option value="fr">{{ $t('languages.fr') }}</option>
        <option value="es">{{ $t('languages.es') }}</option>
        <option value="de">{{ $t('languages.de') }}</option>
        <option value="uk">{{ $t('languages.uk') }}</option>
        <option value="ru">{{ $t('languages.ru') }}</option>
      </select>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        @click="activeTab = 'texts'" 
        :class="{ active: activeTab === 'texts' }"
        class="tab-btn"
      >
        Manage Texts
      </button>
      <button 
        @click="activeTab = 'dictionary'" 
        :class="{ active: activeTab === 'dictionary' }"
        class="tab-btn"
      >
        Manage Dictionary
      </button>
      <button 
        @click="router.push('/import')" 
        :class="{ active: activeTab === 'import' }"
        class="tab-btn"
      >
        Import JSON
      </button>
      <button 
        @click="goToFeedback" 
        class="tab-btn feedback-tab"
      >
        Feedback Management
      </button>
      <button 
        @click="activeTab = 'analytics'" 
        :class="{ active: activeTab === 'analytics' }"
        class="tab-btn"
      >
        Analytics
      </button>
    </div>

    <!-- Texts Management -->
    <div v-if="activeTab === 'texts'" class="texts-section">
      <div class="section-header">
        <h3>{{ $t('admin.texts', { language: currentLanguage.toUpperCase() }) }}</h3>
        <button @click="showAddTextForm = true" class="add-btn">{{ $t('admin.addNewText') }}</button>
      </div>

      <!-- Add Text Form -->
      <div v-if="showAddTextForm" class="form-overlay">
        <div class="form-modal">
          <h4>{{ $t('admin.addNewText') }}</h4>
          <form @submit.prevent="addText">
            <div class="form-group">
              <label>{{ $t('admin.title') }}</label>
              <input v-model="newText.title" required />
            </div>
            <div class="form-group">
              <label>{{ $t('admin.content') }}</label>
              <textarea v-model="newText.content" required></textarea>
            </div>
            <div class="form-group">
              <label>{{ $t('admin.level') }}</label>
              <select v-model="newText.level" required>
                <option value="Beginner">{{ $t('levels.Beginner') }}</option>
                <option value="Intermediate">{{ $t('levels.Intermediate') }}</option>
                <option value="Advanced">{{ $t('levels.Advanced') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t('admin.question1') }}</label>
              <input v-model="newText.question1" required />
            </div>
            <div class="form-group">
              <label>{{ $t('admin.question2') }}</label>
              <input v-model="newText.question2" required />
            </div>
            <div class="form-group">
              <label for="language">{{ $t('admin.language') }}</label>
              <select v-model="newText.language" required>
                <option value="en">{{ $t('languages.en') }}</option>
                <option value="fr">{{ $t('languages.fr') }}</option>
                <option value="es">{{ $t('languages.es') }}</option>
                <option value="de">{{ $t('languages.de') }}</option>
                <option value="uk">{{ $t('languages.uk') }}</option>
                <option value="ru">{{ $t('languages.ru') }}</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" :disabled="loading">{{ $t('admin.addText') }}</button>
              <button type="button" @click="cancelAddText" class="cancel-btn">{{ $t('admin.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Texts List -->
      <div class="texts-list">
        <div v-if="loading" class="loading">{{ $t('admin.loadingTexts') }}</div>
        <div v-else-if="texts.length === 0" class="no-data">
          <p>{{ $t('admin.noTextsFound', { language: currentLanguage.toUpperCase() }) }}</p>
        </div>
        <div v-else>
          <div v-for="text in texts" :key="text.id" class="text-item">
            <div class="text-header">
              <h4>{{ text.title }}</h4>
              <span class="level">{{ text.level }}</span>
            </div>
            <div class="text-preview">{{ text.content.substring(0, 150) }}...</div>
            <div class="text-actions">
              <button @click="editText(text)" class="edit-btn">{{ $t('admin.edit') }}</button>
              <button @click="showAddWordsFromText(text)" class="add-words-btn">{{ $t('admin.addWordsFromText') }}</button>
              <button @click="deleteText(text.id)" class="delete-btn">{{ $t('admin.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dictionary Management -->
    <div v-if="activeTab === 'dictionary'" class="dictionary-section">
      <div class="section-header">
        <h3>{{ $t('admin.dictionary', { language: currentLanguage.toUpperCase() }) }}</h3>
        <div class="header-actions">
          <button @click="showAddWordForm = true" class="add-btn">{{ $t('admin.addNewWord') }}</button>
          <button @click="clearAllWords" class="clear-btn">{{ $t('admin.clearAllWords') }}</button>
        </div>
      </div>

      <!-- Add Word Form -->
      <div v-if="showAddWordForm" class="form-overlay">
        <div class="form-modal">
          <h4>{{ $t('admin.addNewWord') }}</h4>
          <form @submit.prevent="addWord">
            <div class="form-group">
              <label>{{ $t('admin.word') }}</label>
              <input v-model="newWord.word" required />
            </div>
            <div class="form-group">
              <label for="word-language">{{ $t('admin.language') }}</label>
              <select v-model="newWord.language" required>
                <option value="en">{{ $t('languages.en') }}</option>
                <option value="fr">{{ $t('languages.fr') }}</option>
                <option value="es">{{ $t('languages.es') }}</option>
                <option value="de">{{ $t('languages.de') }}</option>
                <option value="uk">{{ $t('languages.uk') }}</option>
                <option value="ru">{{ $t('languages.ru') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t('admin.translationEn') }}</label>
              <input v-model="newWord.translation_en" required />
            </div>
            <div class="form-group">
              <label>{{ $t('admin.translationFr') }}</label>
              <input v-model="newWord.translation_fr" />
            </div>
            <div class="form-group">
              <label>{{ $t('admin.translationEs') }}</label>
              <input v-model="newWord.translation_es" />
            </div>
            <div class="form-group">
              <label>{{ $t('admin.translationDe') }}</label>
              <input v-model="newWord.translation_de" />
            </div>
            <div class="form-group">
              <label>{{ $t('admin.translationUk') }}</label>
              <input v-model="newWord.translation_uk" />
            </div>
            <div class="form-group">
              <label>{{ $t('admin.partOfSpeech') }}</label>
              <select v-model="newWord.part_of_speech" required>
                <option value="noun">{{ $t('partsOfSpeech.noun') }}</option>
                <option value="verb">{{ $t('partsOfSpeech.verb') }}</option>
                <option value="adjective">{{ $t('partsOfSpeech.adjective') }}</option>
                <option value="adverb">{{ $t('partsOfSpeech.adverb') }}</option>
                <option value="pronoun">{{ $t('partsOfSpeech.pronoun') }}</option>
                <option value="preposition">{{ $t('partsOfSpeech.preposition') }}</option>
                <option value="conjunction">{{ $t('partsOfSpeech.conjunction') }}</option>
                <option value="interjection">{{ $t('partsOfSpeech.interjection') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t('admin.difficulty') }}</label>
              <select v-model="newWord.difficulty" required>
                <option value="beginner">{{ $t('difficulties.beginner') }}</option>
                <option value="intermediate">{{ $t('difficulties.intermediate') }}</option>
                <option value="advanced">{{ $t('difficulties.advanced') }}</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" :disabled="loading">{{ $t('admin.addWord') }}</button>
              <button type="button" @click="cancelAddWord" class="cancel-btn">{{ $t('admin.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Dictionary List -->
      <div class="dictionary-list">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            @input="searchWords"
            type="text" 
            placeholder="Search words..." 
            class="search-input"
          />
        </div>

        <div class="filters">
          <select v-model="difficultyFilter" @change="filterWords">
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          
          <select v-model="partOfSpeechFilter" @change="filterWords">
            <option value="">All Parts of Speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
            <option value="interjection">Interjection</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="language-filter">Language:</label>
          <select id="language-filter" v-model="selectedLanguage" @change="fetchTexts">
            <option value="">All Languages</option>
            <option value="en">🇺🇸 English</option>
            <option value="fr">🇫🇷 French</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="de">🇩🇪 German</option>
            <option value="uk">🇺🇦 Ukrainian</option>
          </select>
        </div>

        <div v-if="loading" class="loading">Loading dictionary...</div>
        <div v-else-if="filteredWords.length === 0" class="no-words">
          <p>No words found matching your criteria.</p>
        </div>
        <div v-else class="words-list">
          <div v-for="word in filteredWords" :key="word.id" class="word-item">
            <div class="word-header">
              <strong>{{ word.word }}</strong>
              <span class="part-of-speech">({{ word.part_of_speech }})</span>
              <span class="difficulty" :class="word.difficulty">[{{ word.difficulty }}]</span>
            </div>
            <div class="translations">
              <div v-if="word.translation_en" class="translation">
                <span class="lang-label">EN:</span> {{ word.translation_en }}
              </div>
              <div v-if="word.translation_fr" class="translation">
                <span class="lang-label">FR:</span> {{ word.translation_fr }}
              </div>
              <div v-if="word.translation_es" class="translation">
                <span class="lang-label">ES:</span> {{ word.translation_es }}
              </div>
              <div v-if="word.translation_de" class="translation">
                <span class="lang-label">DE:</span> {{ word.translation_de }}
              </div>
              <div v-if="word.translation_uk" class="translation">
                <span class="lang-label">UK:</span> {{ word.translation_uk }}
              </div>
            </div>
            <div class="word-actions">
              <button @click="editWord(word)" class="edit-btn">{{ $t('admin.edit') }}</button>
              <button @click="deleteWord(word.id)" class="delete-btn">{{ $t('admin.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Dashboard Section -->
    <div v-if="activeTab === 'analytics'" class="analytics-section">
      <AnalyticsDashboard />
    </div>

    <!-- Edit Modals -->
    <div v-if="editingText" class="edit-modal">
      <div class="modal-content">
        <h3>Edit Text</h3>
        <form @submit.prevent="updateText">
          <div class="form-group">
            <label>Title:</label>
            <input v-model="editingText.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Content:</label>
            <textarea v-model="editingText.content" rows="8" required></textarea>
          </div>
          <div class="form-group">
            <label>Level:</label>
            <select v-model="editingText.level">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div class="form-group">
            <label>Question 1:</label>
            <input v-model="editingText.question1" type="text" required />
          </div>
          <div class="form-group">
            <label>Question 2:</label>
            <input v-model="editingText.question2" type="text" required />
          </div>
          <div class="form-group">
            <label for="language">Language:</label>
            <select id="language" v-model="editingText.language" required>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="uk">Ukrainian</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="loading">Update</button>
            <button type="button" @click="cancelEditText" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="editingWord" class="edit-modal">
      <div class="modal-content">
        <h3>Edit Word</h3>
        <form @submit.prevent="updateWord">
          <div class="form-group">
            <label>Word:</label>
            <input v-model="editingWord.word" type="text" required />
          </div>
          <div class="form-group">
            <label for="word-language">Language:</label>
            <select id="word-language" v-model="editingWord.language" required>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="uk">Ukrainian</option>
            </select>
          </div>
          <div class="form-group">
            <label>Translation (English):</label>
            <input v-model="editingWord.translation_en" type="text" required />
          </div>
          <div class="form-group">
            <label>Translation (French):</label>
            <input v-model="editingWord.translation_fr" type="text" />
          </div>
          <div class="form-group">
            <label>Translation (Spanish):</label>
            <input v-model="editingWord.translation_es" type="text" />
          </div>
          <div class="form-group">
            <label>Translation (German):</label>
            <input v-model="editingWord.translation_de" type="text" />
          </div>
          <div class="form-group">
            <label>Translation (Ukrainian):</label>
            <input v-model="editingWord.translation_uk" type="text" />
          </div>
          <div class="form-group">
            <label>Part of Speech:</label>
            <select v-model="editingWord.part_of_speech">
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="pronoun">Pronoun</option>
              <option value="preposition">Preposition</option>
              <option value="conjunction">Conjunction</option>
              <option value="interjection">Interjection</option>
            </select>
          </div>
          <div class="form-group">
            <label>Difficulty:</label>
            <select v-model="editingWord.difficulty">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="loading">Update</button>
            <button type="button" @click="cancelEditWord" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manual Word Addition Modal -->
    <div v-if="showWordExtraction" class="edit-modal">
      <div class="modal-content word-addition-modal">
        <h3>Add Words from "{{ extractingText?.title }}"</h3>
        <p class="addition-info">
          Add words manually with their translations. You can add multiple words at once.
        </p>
        
        <div class="word-input-section">
          <div class="word-input-group">
            <label>Word ({{ extractingText?.language.toUpperCase() }}):</label>
            <input 
              v-model="newWordInput.word" 
              type="text" 
              placeholder="Enter word"
              @keyup.enter="addWordToList"
            />
            <button @click="addWordToList" class="add-word-btn">Add Word</button>
          </div>
        </div>

        <div class="words-list-section">
          <h4>Words to Add ({{ wordInputs.length }})</h4>
          <div v-if="wordInputs.length === 0" class="no-words">
            <p>No words added yet. Enter a word above to get started.</p>
          </div>
          <div v-else class="words-list">
            <div v-for="(wordInput, index) in wordInputs" :key="index" class="word-input-item">
              <div class="word-header">
                <strong>{{ wordInput.word }}</strong>
                <button @click="removeWordFromList(index)" class="remove-word-btn">×</button>
              </div>
              <div class="translations-grid">
                <div class="translation-input">
                  <label>English:</label>
                  <input v-model="wordInput.translation_en" type="text" placeholder="English translation" />
                </div>
                <div class="translation-input">
                  <label>French:</label>
                  <input v-model="wordInput.translation_fr" type="text" placeholder="French translation" />
                </div>
                <div class="translation-input">
                  <label>Spanish:</label>
                  <input v-model="wordInput.translation_es" type="text" placeholder="Spanish translation" />
                </div>
                <div class="translation-input">
                  <label>German:</label>
                  <input v-model="wordInput.translation_de" type="text" placeholder="German translation" />
                </div>
                <div class="translation-input">
                  <label>Ukrainian:</label>
                  <input v-model="wordInput.translation_uk" type="text" placeholder="Ukrainian translation" />
                </div>
              </div>
              <div class="word-metadata">
                <div class="metadata-input">
                  <label>Part of Speech:</label>
                  <select v-model="wordInput.part_of_speech">
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="pronoun">Pronoun</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                    <option value="interjection">Interjection</option>
                  </select>
                </div>
                <div class="metadata-input">
                  <label>Difficulty:</label>
                  <select v-model="wordInput.difficulty">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="addition-actions">
          <button @click="addWordsToDictionary" :disabled="loading || wordInputs.length === 0" class="add-btn">
            {{ loading ? 'Adding...' : `Add ${wordInputs.length} Words to Dictionary` }}
          </button>
          <button @click="closeWordAddition" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'
import AnalyticsDashboard from './AnalyticsDashboard.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const currentLanguage = ref('en')
const activeTab = ref('texts')
const loading = ref(false)
const isAdmin = ref(false)
const texts = ref([])
const words = ref([])
const filteredWords = ref([])
const searchQuery = ref('')
const difficultyFilter = ref('')
const partOfSpeechFilter = ref('')
const showAddTextForm = ref(false)
const showAddWordForm = ref(false)
const editingText = ref(null)
const editingWord = ref(null)
const showWordExtraction = ref(false)
const extractingText = ref(null)
const wordInputs = ref([])

const router = useRouter()

const newText = ref({
  title: '',
  content: '',
  language: 'en',
  level: 'Beginner',
  question1: '',
  question2: ''
})

const newWord = ref({
  word: '',
  language: 'en',
  translation_en: '',
  translation_fr: '',
  translation_es: '',
  translation_de: '',
  translation_uk: '',
  part_of_speech: 'noun',
  difficulty: 'beginner'
})

const newWordInput = ref({
  word: '',
  translation_en: '',
  translation_fr: '',
  translation_es: '',
  translation_de: '',
  translation_uk: '',
  part_of_speech: 'noun',
  difficulty: 'beginner'
})

// JSON Import variables
const jsonInput = ref('')
const parsedData = ref(null)
const importResult = ref(null)

onMounted(() => {
  checkAdminAccess()
  loadData()
})

const checkAdminAccess = async () => {
  try {
    const user = authStore.user
    
    if (!user) {
      isAdmin.value = false
      return
    }
    
    // Check if user has admin role in user_metadata
    const userMetadata = user.user_metadata
    if (userMetadata && userMetadata.role === 'admin') {
      isAdmin.value = true
      return
    }
    
    // Alternative: Check by email (you can add your email here)
    const adminEmails = [
      'aptashenko2019@gmail.com', // Your admin email
      'your-email@example.com', // Replace with your actual email
      'admin@example.com'       // Add any other admin emails
    ]
    
    if (adminEmails.includes(user.email)) {
      isAdmin.value = true
      return
    }
    
    // If none of the above, user is not admin
    isAdmin.value = false
    
  } catch (error) {
    console.error('Error checking admin access:', error)
    isAdmin.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([loadTexts(), loadWords()])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const loadTexts = async () => {
  const { data, error } = await supabase
    .from('texts')
    .select('*')
    .eq('language', currentLanguage.value)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  texts.value = data || []
}

const loadWords = async () => {
  const { data, error } = await supabase
    .from('dictionary')
    .select('*')
    .eq('language', currentLanguage.value)
    .not('word', 'like', 'DELETED_%')
    .order('word', { ascending: true })
  
  if (error) throw error
  words.value = data || []
  filterWords()
}

const filterWords = () => {
  let filtered = words.value

  if (searchQuery.value) {
    filtered = filtered.filter(word => 
      word.word.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      word.translation_en?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      word.translation_fr?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      word.translation_es?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      word.translation_de?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (difficultyFilter.value) {
    filtered = filtered.filter(word => word.difficulty === difficultyFilter.value)
  }

  if (partOfSpeechFilter.value) {
    filtered = filtered.filter(word => word.part_of_speech === partOfSpeechFilter.value)
  }

  filteredWords.value = filtered
}

const searchWords = () => {
  filterWords()
}

const addText = async () => {
  loading.value = true
  try {
    const textData = {
      ...newText.value,
      language: currentLanguage.value
    }
    
    const { error } = await supabase
      .from('texts')
      .insert([textData])
    
    if (error) throw error
    
    await loadTexts()
    showAddTextForm.value = false
    resetNewText()
  } catch (error) {
    console.error('Error adding text:', error)
    alert('Error adding text: ' + error.message)
  } finally {
    loading.value = false
  }
}

const addWord = async () => {
  loading.value = true
  try {
    const wordData = {
      ...newWord.value,
      language: currentLanguage.value,
      translation: newWord.value.translation_en || newWord.value.word
    }
    
    const { error } = await supabase
      .from('dictionary')
      .insert([wordData])
    
    if (error) throw error
    
    await loadWords()
    showAddWordForm.value = false
    resetNewWord()
  } catch (error) {
    console.error('Error adding word:', error)
    alert('Error adding word: ' + error.message)
  } finally {
    loading.value = false
  }
}

const editText = (text) => {
  editingText.value = { ...text }
}

const editWord = (word) => {
  editingWord.value = { ...word }
}

const updateText = async () => {
  loading.value = true
  try {
    const { error } = await supabase
      .from('texts')
      .update(editingText.value)
      .eq('id', editingText.value.id)
    
    if (error) throw error
    
    await loadTexts()
    editingText.value = null
  } catch (error) {
    console.error('Error updating text:', error)
    alert('Error updating text: ' + error.message)
  } finally {
    loading.value = false
  }
}

const updateWord = async () => {
  loading.value = true
  try {
    const wordData = {
      ...editingWord.value,
      translation: editingWord.value.translation_en || editingWord.value.word
    }
    
    const { error } = await supabase
      .from('dictionary')
      .update(wordData)
      .eq('id', editingWord.value.id)
    
    if (error) throw error
    
    await loadWords()
    editingWord.value = null
  } catch (error) {
    console.error('Error updating word:', error)
    alert('Error updating word: ' + error.message)
  } finally {
    loading.value = false
  }
}

const deleteText = async (id) => {
  if (!confirm('Are you sure you want to delete this text?')) return
  
  loading.value = true
  try {
    const { error } = await supabase
      .from('texts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    await loadTexts()
  } catch (error) {
    console.error('Error deleting text:', error)
    alert('Error deleting text: ' + error.message)
  } finally {
    loading.value = false
  }
}

const deleteWord = async (id) => {
  if (!confirm('Are you sure you want to delete this word?')) return
  
  loading.value = true
  try {
    console.log('Attempting to delete word with ID:', id)
    
    // First, let's check if the word exists
    const { data: existingWord, error: checkError } = await supabase
      .from('dictionary')
      .select('*')
      .eq('id', id)
      .single()
    
    if (checkError) {
      console.error('Error checking if word exists:', checkError)
      throw new Error(`Word not found or access denied: ${checkError.message}`)
    }
    
    if (!existingWord) {
      throw new Error('Word not found')
    }
    
    console.log('Word found:', existingWord.word)
    
    // Try to delete using the regular method first
    const { error: deleteError } = await supabase
      .from('dictionary')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Delete error details:', deleteError)
      
      // If it's a permission error, try alternative approach
      if (deleteError.code === 'PGRST116' || deleteError.code === 'PGRST301') {
        console.log('Trying alternative delete method...')
        
        // Try to update the word to mark it as deleted instead
        const { error: updateError } = await supabase
          .from('dictionary')
          .update({ 
            word: `DELETED_${existingWord.word}_${Date.now()}`,
            translation_en: '',
            translation_fr: '',
            translation_es: '',
            translation_de: '',
            translation_uk: ''
          })
          .eq('id', id)
        
        if (updateError) {
          console.error('Alternative delete method also failed:', updateError)
          throw deleteError // Throw the original error
        } else {
          console.log('Word marked as deleted using alternative method')
        }
      } else {
        throw deleteError
      }
    } else {
      console.log('Word deleted successfully')
    }
    
    await loadWords()
  } catch (error) {
    console.error('Error deleting word:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Error deleting word: '
    if (error.code === 'PGRST116') {
      errorMessage += 'Permission denied. You may not have the right to delete this word.'
    } else if (error.code === 'PGRST301') {
      errorMessage += 'Row Level Security policy prevents this operation.'
    } else {
      errorMessage += error.message
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const cancelAddText = () => {
  showAddTextForm.value = false
  resetNewText()
}

const cancelAddWord = () => {
  showAddWordForm.value = false
  resetNewWord()
}

const cancelEditText = () => {
  editingText.value = null
}

const cancelEditWord = () => {
  editingWord.value = null
}

const resetNewText = () => {
  newText.value = {
    title: '',
    content: '',
    language: 'en',
    level: 'Beginner',
    question1: '',
    question2: ''
  }
}

const resetNewWord = () => {
  newWord.value = {
    word: '',
    language: 'en',
    translation_en: '',
    translation_fr: '',
    translation_es: '',
    translation_de: '',
    translation_uk: '',
    part_of_speech: 'noun',
    difficulty: 'beginner'
  }
}

const showAddWordsFromText = (text) => {
  extractingText.value = text
  showWordExtraction.value = true
}

const closeWordAddition = () => {
  showWordExtraction.value = false
  extractingText.value = null
  wordInputs.value = []
}

const addWordToList = () => {
  if (newWordInput.value.word.trim() === '') {
    alert('Please enter a word')
    return
  }
  wordInputs.value.push({ ...newWordInput.value })
  newWordInput.value = {
    word: '',
    translation_en: '',
    translation_fr: '',
    translation_es: '',
    translation_de: '',
    translation_uk: '',
    part_of_speech: 'noun',
    difficulty: 'beginner'
  }
}

const removeWordFromList = (index) => {
  wordInputs.value.splice(index, 1)
}

const addWordsToDictionary = async () => {
  loading.value = true
  try {
    const wordsToAdd = wordInputs.value.map(word => ({
      ...word,
      language: extractingText.value.language,
      translation: word.translation_en || word.word,
      part_of_speech: word.part_of_speech,
      difficulty: word.difficulty
    }))
    
    const { error } = await supabase
      .from('dictionary')
      .insert(wordsToAdd)
    
    if (error) throw error
    
    alert(`Successfully added ${wordsToAdd.length} words to dictionary!`)
    await loadWords()
    closeWordAddition()
  } catch (error) {
    console.error('Error adding words to dictionary:', error)
    alert('Error adding words to dictionary: ' + error.message)
  } finally {
    loading.value = false
  }
}

const clearAllWords = async () => {
  if (!confirm('Are you sure you want to delete all words?')) return
  
  loading.value = true
  try {
    const { data: existingWords, error } = await supabase
      .from('dictionary')
      .select('*')
    
    if (error) throw error
    
    const wordsToDelete = existingWords.map(word => word.id)
    
    const { error: deleteError } = await supabase
      .from('dictionary')
      .delete()
      .in('id', wordsToDelete)
    
    if (deleteError) throw deleteError
    
    await loadWords()
  } catch (error) {
    console.error('Error clearing all words:', error)
    alert('Error clearing all words: ' + error.message)
  } finally {
    loading.value = false
  }
}

// JSON Import functions
const parseJson = () => {
  try {
    const data = JSON.parse(jsonInput.value)
    
    // Validate the structure
    if (!data.text || !data.dictionary) {
      throw new Error('JSON must contain "text" and "dictionary" sections')
    }
    
    if (!data.text.title || !data.text.content) {
      throw new Error('Text section must contain "title" and "content"')
    }
    
    // Validate dictionary structure
    if (!Array.isArray(data.dictionary)) {
      throw new Error('Dictionary must be an array of word objects')
    }
    
    // Validate each dictionary entry
    const validWords = []
    const invalidWords = []
    
    data.dictionary.forEach((word, index) => {
      if (!word.word) {
        invalidWords.push(`Word at index ${index}: missing "word" field`)
      } else if (!word.translation_en) {
        invalidWords.push(`Word "${word.word}": missing English translation`)
      } else {
        validWords.push(word)
      }
    })
    
    if (invalidWords.length > 0) {
      console.warn('Invalid dictionary entries:', invalidWords)
    }
    
    // Update the data with validated words
    data.dictionary = validWords
    
    parsedData.value = data
    importResult.value = null
    
    console.log(`✅ Parsed successfully: ${validWords.length} valid words, ${invalidWords.length} invalid words`)
    
  } catch (error) {
    console.error('JSON parsing error:', error)
    alert('Error parsing JSON: ' + error.message)
    parsedData.value = null
  }
}

const importData = async () => {
  if (!parsedData.value) return
  
  loading.value = true
  importResult.value = null
  
  try {
    const result = {
      success: true,
      message: 'Import completed successfully!',
      details: {
        text: false,
        questions: 0,
        dictionary: 0,
        errors: []
      }
    }
    
    // 1. Import the text
    const textData = {
      title: parsedData.value.text.title,
      content: parsedData.value.text.content,
      language: parsedData.value.text.language || 'en',
      level: parsedData.value.text.level || 'Beginner',
      question1: parsedData.value.text.questions?.[0]?.questionText || '',
      question2: parsedData.value.text.questions?.[1]?.questionText || ''
    }
    
    const { data: insertedText, error: textError } = await supabase
      .from('texts')
      .insert([textData])
      .select()
    
    if (textError) {
      result.success = false
      result.message = 'Failed to import text: ' + textError.message
      result.details.errors.push('Text: ' + textError.message)
      throw textError
    }
    
    result.details.text = true
    console.log('✅ Text imported successfully:', insertedText[0].title)
    
    // 2. Import questions if they exist
    if (parsedData.value.text.questions && insertedText?.[0]) {
      const textId = insertedText[0].id
      
      for (const question of parsedData.value.text.questions) {
        const { error: questionError } = await supabase
          .from('text_questions')
          .insert({
            text_id: textId,
            question_text: question.questionText,
            question_number: question.questionNumber,
            question_type: question.questionType || 'comprehension',
            difficulty: question.difficulty || 'medium'
          })
        
        if (!questionError) {
          result.details.questions++
          console.log('✅ Question imported:', question.questionText.substring(0, 50) + '...')
        } else {
          console.warn('⚠️ Question import failed:', questionError.message)
          result.details.errors.push(`Question: ${questionError.message}`)
        }
      }
    }
    
    // 3. Import dictionary words
    if (parsedData.value.dictionary && parsedData.value.dictionary.length > 0) {
      console.log(`📚 Importing ${parsedData.value.dictionary.length} dictionary words...`)
      
      const wordsToAdd = parsedData.value.dictionary.map(word => ({
        word: word.word,
        language: word.language || 'en',
        translation: word.translation_en || word.word, // Required field
        translation_en: word.translation_en || word.word,
        translation_fr: word.translation_fr || '',
        translation_es: word.translation_es || '',
        translation_de: word.translation_de || '',
        translation_uk: word.translation_uk || '',
        part_of_speech: word.part_of_speech || 'noun',
        difficulty: word.difficulty || 'beginner'
      }))
      
      // Try to insert all words at once
      const { data: insertedWords, error: dictError } = await supabase
        .from('dictionary')
        .insert(wordsToAdd)
        .select()
      
      if (dictError) {
        console.error('Dictionary import error:', dictError)
        
        // If bulk insert fails, try inserting one by one
        console.log('🔄 Trying individual word imports...')
        let successCount = 0
        
        for (const word of wordsToAdd) {
          const { error: singleError } = await supabase
            .from('dictionary')
            .insert([word])
          
          if (!singleError) {
            successCount++
            console.log(`✅ Word imported: ${word.word}`)
          } else {
            console.warn(`⚠️ Word import failed: ${word.word} - ${singleError.message}`)
            result.details.errors.push(`Word "${word.word}": ${singleError.message}`)
          }
        }
        
        result.details.dictionary = successCount
      } else {
        result.details.dictionary = insertedWords.length
        console.log(`✅ All ${insertedWords.length} words imported successfully`)
      }
    }
    
    // Update result message based on what was imported
    const parts = []
    if (result.details.text) parts.push('text')
    if (result.details.questions > 0) parts.push(`${result.details.questions} questions`)
    if (result.details.dictionary > 0) parts.push(`${result.details.dictionary} words`)
    
    result.message = `Import completed: ${parts.join(', ')}`
    
    if (result.details.errors.length > 0) {
      result.message += ` (${result.details.errors.length} errors)`
    }
    
    importResult.value = result
    
    // Refresh data
    await loadData()
    
    // Clear the form
    jsonInput.value = ''
    parsedData.value = null
    
  } catch (error) {
    console.error('Import error:', error)
    importResult.value = {
      success: false,
      message: 'Import failed: ' + error.message,
      details: null
    }
  } finally {
    loading.value = false
  }
}

const clearJson = () => {
  jsonInput.value = ''
  parsedData.value = null
  importResult.value = null
}

const goToFeedback = () => {
  router.push('/admin/feedback')
}
</script>
<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-content {
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.language-selector label {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.language-selector select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  color: #2d3748;
  transition: border-color 0.2s ease;
}

.language-selector select:focus {
  outline: none;
  border-color: #667eea;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: #f7fafc;
  color: #4a5568;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.tab-btn:hover:not(.active) {
  background: #edf2f7;
  border-color: #667eea;
  color: #667eea;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h3 {
  font-size: 1.8rem;
  color: #2d3748;
  margin: 0;
  font-weight: 700;
}

.add-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-modal {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.form-modal h4 {
  margin: 0 0 30px 0;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #2d3748;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.form-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.form-actions button[type="submit"] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.form-actions button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

.texts-list,
.dictionary-list {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.text-item,
.word-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  background: #f7fafc;
  transition: all 0.2s ease;
}

.text-item:hover,
.word-item:hover {
  border-color: #667eea;
  background: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.text-header,
.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.text-header h4,
.word-header h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.level,
.difficulty {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.level {
  background: #e6fffa;
  color: #234e52;
}

.difficulty.beginner {
  background: #f0fff4;
  color: #22543d;
}

.difficulty.intermediate {
  background: #fffbeb;
  color: #92400e;
}

.difficulty.advanced {
  background: #fed7d7;
  color: #742a2a;
}

.text-preview,
.word-preview {
  color: #4a5568;
  margin-bottom: 15px;
  line-height: 1.6;
}

.text-actions,
.word-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-btn,
.delete-btn,
.add-words-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #4299e1;
  color: white;
}

.edit-btn:hover {
  background: #3182ce;
  transform: translateY(-1px);
}

.delete-btn {
  background: #f56565;
  color: white;
}

.delete-btn:hover {
  background: #e53e3e;
  transform: translateY(-1px);
}

.add-words-btn {
  background: #48bb78;
  color: white;
}

.add-words-btn:hover {
  background: #38a169;
  transform: translateY(-1px);
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #2d3748;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #2d3748;
  font-size: 0.9rem;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 1.1rem;
}

.translation {
  color: #718096;
  font-style: italic;
  margin-left: 10px;
}

.part-of-speech {
  color: #a0aec0;
  font-size: 0.9rem;
  margin-left: 10px;
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 30px 0;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
}

.word-addition-modal {
  max-width: 800px;
}

.addition-info {
  color: #718096;
  margin-bottom: 20px;
  font-size: 1rem;
}

.word-input-section {
  margin-bottom: 20px;
}

.word-input-group {
  display: flex;
  gap: 10px;
  align-items: end;
}

.word-input-group label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.word-input-group input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.add-word-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.add-word-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.words-list-section {
  margin-bottom: 20px;
}

.words-list-section h4 {
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 1.2rem;
  font-weight: 600;
}

.no-words {
  text-align: center;
  padding: 20px;
  color: #718096;
  font-style: italic;
}

.word-input-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  background: #f7fafc;
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.word-header strong {
  color: #2d3748;
  font-size: 1.1rem;
}

.remove-word-btn {
  background: #f56565;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-word-btn:hover {
  background: #e53e3e;
  transform: scale(1.1);
}

.translations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.translation-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.translation-input label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.translation-input input {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
}

.word-metadata {
  display: flex;
  gap: 15px;
}

.metadata-input {
  flex: 1;
}

.metadata-input label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.metadata-input select {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.addition-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.clear-btn {
  padding: 12px 24px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #e53e3e;
  transform: translateY(-2px);
}

.import-section {
  padding: 20px;
}

.import-form {
  background: #f7fafc;
  border-radius: 12px;
  padding: 30px;
  border: 2px solid #e2e8f0;
}

.json-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  background: white;
  color: #2d3748;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.json-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.import-preview {
  margin: 20px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.text-preview h5,
.dictionary-preview h5,
.questions-preview h5 {
  margin: 0 0 10px 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
}

.words-list,
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.word-preview,
.question-preview {
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.word-preview .translation {
  color: #718096;
  margin-left: 10px;
}

.word-preview .metadata,
.question-preview .metadata {
  color: #a0aec0;
  font-size: 0.8rem;
  margin-left: 10px;
}

.more-words {
  color: #718096;
  font-style: italic;
  text-align: center;
  padding: 10px;
}

.error-details {
  margin-top: 20px;
  padding: 20px;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
}

.error-details h6 {
  margin: 0 0 10px 0;
  color: #742a2a;
  font-weight: 600;
}

.error-details ul {
  margin: 0;
  padding-left: 20px;
}

.error-details li {
  color: #742a2a;
  margin-bottom: 5px;
}

.import-actions {
  display: flex;
  gap: 15px;
  margin: 30px 0;
  flex-wrap: wrap;
}

.parse-btn {
  padding: 12px 24px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.parse-btn:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-2px);
}

.parse-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.import-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.import-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(72, 187, 120, 0.3);
}

.import-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.import-result {
  margin-top: 30px;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid;
}

.import-result .success {
  background: #f0fff4;
  border-color: #9ae6b4;
  color: #22543d;
}

.import-result .error {
  background: #fed7d7;
  border-color: #feb2b2;
  color: #742a2a;
}

.result-content p {
  margin: 10px 0;
}

.result-content strong {
  font-weight: 600;
}

.admin-access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #2d3748;
}

.access-denied-content {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 500px;
  color: #2d3748;
}

.access-denied-content h2 {
  color: #f56565;
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: 700;
}

.access-denied-content p {
  color: #718096;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.back-link {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 600;
}

.back-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.feedback-tab {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.feedback-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(237, 137, 54, 0.3);
}

.analytics-section {
  width: 100%;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .admin-content {
    padding: 20px;
    margin: 10px;
  }
  
  .language-selector,
  .section-header,
  .tabs,
  .form-actions,
  .filters,
  .text-header,
  .word-header,
  .text-actions,
  .word-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .tab-btn,
  .add-btn,
  .edit-btn,
  .delete-btn {
    width: 100%;
  }

  .modal-content {
    width: 95%;
    padding: 20px;
  }
  
  h2 {
    font-size: 2rem;
  }

  .section-header h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .admin-content {
    padding: 15px;
  }
  
  h2 {
    font-size: 1.8rem;
  }

  .section-header h3 {
    font-size: 1.4rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select,
  .search-input {
    font-size: 0.95rem;
    padding: 10px 12px;
  }

  .translation {
    font-size: 0.95rem;
  }

  .difficulty {
    font-size: 0.75rem;
  }
}
</style>
