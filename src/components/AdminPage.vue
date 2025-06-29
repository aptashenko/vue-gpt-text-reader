<template>
  <div v-if="!isAdmin" class="admin-access-denied">
    <div class="access-denied-content">
      <h2>{{ $t('admin.accessDenied') }}</h2>
      <p>{{ $t('admin.accessDeniedMessage') }}</p>
      <router-link to="/" class="back-link">{{ $t('admin.backToHome') }}</router-link>
    </div>
  </div>

  <div v-else class="admin-page">
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
        @click="activeTab = 'import'" 
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

    <!-- Import JSON Section -->
    <div v-if="activeTab === 'import'" class="import-section">
      <div class="section-header">
        <h3>Import Text and Dictionary from JSON</h3>
      </div>

      <div class="import-form">
        <div class="form-group">
          <label>Paste your JSON data:</label>
          <textarea 
            v-model="jsonInput" 
            rows="15" 
            placeholder="Paste your JSON here..."
            class="json-textarea"
          ></textarea>
        </div>

        <div class="import-preview" v-if="parsedData">
          <h4>Preview:</h4>
          <div class="preview-content">
            <div class="text-preview">
              <h5>Text: {{ parsedData.text?.title }}</h5>
              <p><strong>Language:</strong> {{ parsedData.text?.language }}</p>
              <p><strong>Level:</strong> {{ parsedData.text?.level }}</p>
              <p><strong>Questions:</strong> {{ parsedData.text?.questions?.length || 0 }}</p>
              <p><strong>Dictionary Words:</strong> {{ parsedData.dictionary?.length || 0 }}</p>
            </div>
            
            <div v-if="parsedData.dictionary && parsedData.dictionary.length > 0" class="dictionary-preview">
              <h5>Dictionary Words ({{ parsedData.dictionary.length }}):</h5>
              <div class="words-list">
                <div v-for="(word, index) in parsedData.dictionary.slice(0, 10)" :key="index" class="word-preview">
                  <strong>{{ word.word }}</strong> 
                  <span class="translation">→ {{ word.translation_en }}</span>
                  <span class="metadata">({{ word.part_of_speech }}, {{ word.difficulty }})</span>
                </div>
                <div v-if="parsedData.dictionary.length > 10" class="more-words">
                  ... and {{ parsedData.dictionary.length - 10 }} more words
                </div>
              </div>
            </div>
            
            <div v-if="parsedData.text?.questions && parsedData.text.questions.length > 0" class="questions-preview">
              <h5>Questions ({{ parsedData.text.questions.length }}):</h5>
              <div class="questions-list">
                <div v-for="(question, index) in parsedData.text.questions" :key="index" class="question-preview">
                  <strong>{{ question.questionNumber }}.</strong> {{ question.questionText }}
                  <span class="metadata">({{ question.questionType }}, {{ question.difficulty }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="import-actions">
          <button @click="parseJson" :disabled="!jsonInput.trim()" class="parse-btn">
            Parse JSON
          </button>
          <button @click="importData" :disabled="!parsedData || loading" class="import-btn">
            {{ loading ? 'Importing...' : 'Import Data' }}
          </button>
          <button @click="clearJson" class="clear-btn">Clear</button>
        </div>

        <div v-if="importResult" class="import-result">
          <h4>Import Result:</h4>
          <div class="result-content" :class="importResult.success ? 'success' : 'error'">
            <p>{{ importResult.message }}</p>
            <div v-if="importResult.details">
              <p><strong>Text:</strong> {{ importResult.details.text ? '✓ Added' : '✗ Failed' }}</p>
              <p><strong>Questions:</strong> {{ importResult.details.questions || 0 }} added</p>
              <p><strong>Dictionary Words:</strong> {{ importResult.details.dictionary || 0 }} added</p>
              
              <div v-if="importResult.details.errors && importResult.details.errors.length > 0" class="error-details">
                <h6>Errors:</h6>
                <ul>
                  <li v-for="(error, index) in importResult.details.errors" :key="index">{{ error }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

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
  // Implement the logic to navigate to the feedback management section
  console.log('Navigating to feedback management')
}
</script>
<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #fffaf6;
  min-height: 100vh;
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
}

h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #5a4a42;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #fff3e6;
  border-radius: 12px;
  flex-wrap: wrap;
}

.language-selector label {
  font-weight: 600;
  color: #5a4a42;
}

.language-selector select {
  padding: 0.5rem 1rem;
  border: 2px solid #d8a48f;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  color: #000;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: #e8d8c3;
  color: #5a4a42;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #d8a48f;
  color: white;
}

.tab-btn:hover {
  background: #d8a48f;
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h3 {
  font-size: 1.8rem;
  color: #5a4a42;
  margin: 0;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-btn:hover {
  background: #357abd;
}

.add-form {
  background: #fff3e6;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid #d8a48f;
}

.add-form h4 {
  margin-top: 0;
  color: #5a4a42;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #5a4a42;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #d8a48f;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #000;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-actions button[type="submit"] {
  background: #4a90e2;
  color: white;
}

.form-actions button[type="submit"]:hover {
  background: #357abd;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.texts-list,
.dictionary-list {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-item,
.word-item {
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: #fffaf6;
}

.text-header,
.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.text-header h4 {
  margin: 0;
  color: #5a4a42;
  font-size: 1.3rem;
}

.level {
  background: #d8a48f;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.text-preview {
  color: #6e6259;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.part-of-speech {
  color: #6e6259;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

.difficulty {
  background: #ffe9d6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.difficulty.beginner {
  background: #d4edda;
  color: #155724;
}

.difficulty.intermediate {
  background: #fff3cd;
  color: #856404;
}

.difficulty.advanced {
  background: #f8d7da;
  color: #721c24;
}

.translations {
  margin: 1rem 0;
}

.translation {
  margin-bottom: 0.5rem;
  color: #6e6259;
}

.lang-label {
  font-weight: 600;
  color: #5a4a42;
  margin-right: 0.5rem;
}

.text-actions,
.word-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.edit-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #28a745;
  color: white;
}

.edit-btn:hover {
  background: #218838;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #d8a48f;
  border-radius: 8px;
  font-size: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters select {
  padding: 0.5rem;
  border: 2px solid #d8a48f;
  border-radius: 6px;
  background: white;
  color: #000;
}

.filter-group {
  margin-bottom: 1rem;
}

.loading,
.no-texts,
.no-words {
  text-align: center;
  padding: 2rem;
  color: #6e6259;
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
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  color: #5a4a42;
}

.word-addition-modal {
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.addition-info {
  margin-bottom: 1.5rem;
  color: #6e6259;
  font-size: 0.95rem;
}

.word-input-section {
  margin-bottom: 1.5rem;
}

.word-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.word-input-group label {
  font-weight: 600;
  color: #5a4a42;
}

.word-input-group input {
  padding: 0.75rem;
  border: 2px solid #d8a48f;
  border-radius: 8px;
  font-size: 1rem;
}

.words-list-section {
  margin-bottom: 1.5rem;
}

.words-list {
  background: #fff3e6;
  border-radius: 8px;
  padding: 1rem;
}

.word-input-item {
  border: 1px solid #e8d8c3;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.word-header strong {
  font-size: 1.2rem;
  color: #5a4a42;
}

.remove-word-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
}

.translations-grid {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.translation-input {
  flex: 1;
}

.translation-input label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #5a4a42;
}

.translation-input input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #d8a48f;
  border-radius: 6px;
}

.word-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.metadata-input {
  flex: 1;
}

.metadata-input label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #5a4a42;
}

.metadata-input select {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #d8a48f;
  border-radius: 6px;
}

.addition-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.add-word-btn {
  background-color: #17a2b8;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.add-word-btn:hover {
  background-color: #138496;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.clear-btn {
  background-color: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.clear-btn:hover {
  background-color: #c82333;
}

/* Responsive Styles */
@media (max-width: 768px) {
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
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
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
    padding: 0.6rem;
  }

  .translation {
    font-size: 0.95rem;
  }

  .difficulty {
    font-size: 0.75rem;
  }
}

.add-word-btn:hover {
  background-color: #138496;
}

.import-section {
  padding: 1rem;
}

.import-form {
  background: #faf8f5;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e6ddd6;
}

.json-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #d8a48f;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  background: #fffaf6;
  color: #3b3b3b;
  resize: vertical;
}

.json-textarea:focus {
  outline: none;
  border-color: #a0522d;
  box-shadow: 0 0 0 2px rgba(160, 82, 45, 0.2);
}

.import-preview {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-preview h5,
.dictionary-preview h5,
.questions-preview h5 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.words-list,
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.word-preview,
.question-preview {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
}

.word-preview .translation {
  color: #6c757d;
  margin-left: 0.5rem;
}

.word-preview .metadata,
.question-preview .metadata {
  color: #6c757d;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.more-words {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 0.5rem;
}

.error-details {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.error-details h6 {
  margin: 0 0 0.5rem 0;
  color: #721c24;
}

.error-details ul {
  margin: 0;
  padding-left: 1.5rem;
}

.error-details li {
  color: #721c24;
  margin-bottom: 0.25rem;
}

.import-actions {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.parse-btn {
  background-color: #17a2b8;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.parse-btn:hover {
  background-color: #138496;
}

.parse-btn:disabled {
  background-color: #c7c7c7;
  cursor: not-allowed;
}

.import-btn {
  background-color: #28a745;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.import-btn:hover {
  background-color: #218838;
}

.import-btn:disabled {
  background-color: #c7c7c7;
  cursor: not-allowed;
}

.import-result {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
}

.import-result .success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.import-result .error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.result-content p {
  margin: 0.5rem 0;
}

.result-content strong {
  font-weight: 600;
}

.admin-access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: #faf8f5;
  color: #2d3748;
}

.access-denied-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6ddd6;
  max-width: 500px;
  color: #2d3748;
}

.access-denied-content h2 {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.access-denied-content p {
  color: #6e6259;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.back-link {
  display: inline-block;
  background-color: #d8a48f;
  color: white;
  padding: 0.8rem 1.5rem;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s;
  font-weight: 500;
}

.back-link:hover {
  background-color: #c08975;
}

.feedback-tab {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.feedback-tab:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(237, 137, 54, 0.3);
}
</style>
