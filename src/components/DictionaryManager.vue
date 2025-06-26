<template>
  <div class="dictionary-manager">
    <h2>Dictionary Manager</h2>
    
    <!-- Search and Add Section -->
    <div class="search-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          @input="searchWords"
          type="text" 
          placeholder="Search words..." 
          class="search-input"
        />
        <button @click="searchWords" class="search-btn">Search</button>
      </div>
      
      <button @click="showAddForm = true" class="add-word-btn">Add New Word</button>
    </div>

    <!-- Add Word Form -->
    <div v-if="showAddForm" class="add-form">
      <h3>Add New Word</h3>
      <form @submit.prevent="addWord">
        <div class="form-group">
          <label>Word:</label>
          <input v-model="newWord.word" type="text" required />
        </div>
        <div class="form-group">
          <label>Translation:</label>
          <input v-model="newWord.translation" type="text" required />
        </div>
        <div class="form-group">
          <label>Part of Speech:</label>
          <select v-model="newWord.partOfSpeech">
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
            <option value="interjection">Interjection</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="form-group">
          <label>Difficulty:</label>
          <select v-model="newWord.difficulty">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="loading">Add Word</button>
          <button type="button" @click="cancelAdd" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Build Dictionary from Texts -->
    <div class="build-section">
      <button @click="buildDictionary" :disabled="building" class="build-btn">
        {{ building ? 'Building Dictionary...' : 'Build Dictionary from Texts' }}
      </button>
      <p class="build-info">This will extract all unique words from your texts and add them to the dictionary.</p>
    </div>

    <!-- Words List -->
    <div class="words-section">
      <h3>Dictionary Words ({{ filteredWords.length }})</h3>
      
      <div class="filters">
        <select v-model="difficultyFilter" @change="filterWords">
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="unknown">Unknown</option>
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
          <option value="unknown">Unknown</option>
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
          <div class="translation">{{ word.translation }}</div>
          <div class="word-actions">
            <button @click="editWord(word)" class="edit-btn">Edit</button>
            <button @click="deleteWord(word.id)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Word Modal -->
    <div v-if="editingWord" class="edit-modal">
      <div class="modal-content">
        <h3>Edit Word</h3>
        <form @submit.prevent="updateWord">
          <div class="form-group">
            <label>Word:</label>
            <input v-model="editingWord.word" type="text" required />
          </div>
          <div class="form-group">
            <label>Translation:</label>
            <input v-model="editingWord.translation" type="text" required />
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
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="form-group">
            <label>Difficulty:</label>
            <select v-model="editingWord.difficulty">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="loading">Update</button>
            <button type="button" @click="cancelEdit" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { DictionaryService } from '../services/dictionary.js'

const words = ref([])
const filteredWords = ref([])
const searchQuery = ref('')
const difficultyFilter = ref('')
const partOfSpeechFilter = ref('')
const loading = ref(false)
const building = ref(false)
const showAddForm = ref(false)
const editingWord = ref(null)

const newWord = ref({
  word: '',
  translation: '',
  partOfSpeech: 'noun',
  difficulty: 'beginner'
})

// Load all words on mount
onMounted(async () => {
  await loadWords()
})

const loadWords = async () => {
  loading.value = true
  try {
    words.value = await DictionaryService.getAllWords()
    filterWords()
  } catch (error) {
    console.error('Error loading words:', error)
  } finally {
    loading.value = false
  }
}

const searchWords = async () => {
  if (searchQuery.value.trim()) {
    loading.value = true
    try {
      const results = await DictionaryService.searchWords(searchQuery.value)
      filteredWords.value = results
    } catch (error) {
      console.error('Error searching words:', error)
    } finally {
      loading.value = false
    }
  } else {
    filterWords()
  }
}

const filterWords = () => {
  let filtered = [...words.value]
  
  if (difficultyFilter.value) {
    filtered = filtered.filter(word => word.difficulty === difficultyFilter.value)
  }
  
  if (partOfSpeechFilter.value) {
    filtered = filtered.filter(word => word.part_of_speech === partOfSpeechFilter.value)
  }
  
  filteredWords.value = filtered
}

const addWord = async () => {
  loading.value = true
  try {
    const success = await DictionaryService.addWord(
      newWord.value.word,
      newWord.value.translation,
      newWord.value.partOfSpeech,
      newWord.value.difficulty
    )
    
    if (success) {
      await loadWords()
      cancelAdd()
    }
  } catch (error) {
    console.error('Error adding word:', error)
  } finally {
    loading.value = false
  }
}

const cancelAdd = () => {
  showAddForm.value = false
  newWord.value = {
    word: '',
    translation: '',
    partOfSpeech: 'noun',
    difficulty: 'beginner'
  }
}

const editWord = (word) => {
  editingWord.value = { ...word }
}

const updateWord = async () => {
  loading.value = true
  try {
    const success = await DictionaryService.updateWord(
      editingWord.value.word,
      editingWord.value.translation,
      editingWord.value.part_of_speech,
      editingWord.value.difficulty
    )
    
    if (success) {
      await loadWords()
      cancelEdit()
    }
  } catch (error) {
    console.error('Error updating word:', error)
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  editingWord.value = null
}

const deleteWord = async (wordId) => {
  if (confirm('Are you sure you want to delete this word?')) {
    try {
      const { error } = await supabase
        .from('dictionary')
        .delete()
        .eq('id', wordId)
      
      if (!error) {
        await loadWords()
      }
    } catch (error) {
      console.error('Error deleting word:', error)
    }
  }
}

const buildDictionary = async () => {
  building.value = true
  try {
    const success = await DictionaryService.buildDictionaryFromTexts()
    if (success) {
      await loadWords()
      alert('Dictionary built successfully!')
    }
  } catch (error) {
    console.error('Error building dictionary:', error)
  } finally {
    building.value = false
  }
}
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

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
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

.search-btn, .add-word-btn, .build-btn {
  padding: 0.7rem 1.2rem;
  background: #98c9a3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}
.search-btn:hover, .add-word-btn:hover, .build-btn:hover {
  background: #82b28d;
}

.add-form {
  background: #fdf7f3;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
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
.cancel-btn {
  background: #c7bcb5;
  color: white;
}
.cancel-btn:hover {
  background: #b0a39b;
}

.build-section {
  background: #f0f7f2;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
}
.build-info {
  margin-top: 0.5rem;
  color: #6e6e6e;
  font-size: 0.9rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filters select {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  background: #fffaf6;
  color: #3b3b3b;
}

.words-list {
  max-height: 500px;
  overflow-y: auto;
}

.word-item {
  background: #fefefe;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.word-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.part-of-speech {
  margin-left: 0.5rem;
  color: #6e6e6e;
  font-style: italic;
}
.difficulty {
  margin-left: 0.5rem;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.8rem;
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
.difficulty.unknown {
  background: #e2e3e5;
  color: #383d41;
}

.translation {
  margin-bottom: 0.6rem;
  font-size: 1.1rem;
}

.word-actions {
  display: flex;
  gap: 0.5rem;
}
.edit-btn, .delete-btn {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
}
.edit-btn {
  background: #ffc107;
  color: #3b3b3b;
}
.edit-btn:hover {
  background: #e0a800;
}
.delete-btn {
  background: #dc3545;
  color: white;
}
.delete-btn:hover {
  background: #c82333;
}

.edit-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fffaf6;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.loading, .no-words {
  text-align: center;
  padding: 2rem;
  color: #7a6a5f;
  font-size: 1rem;
}

</style> 