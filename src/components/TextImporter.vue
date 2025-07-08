<template>
  <div v-if="!isAdmin" class="admin-access-denied">
    <div class="access-denied-content">
      <h2>{{ $t('admin.accessDenied') }}</h2>
      <p>{{ $t('admin.accessDeniedMessage') }}</p>
      <router-link to="/" class="back-link">{{ $t('admin.backToHome') }}</router-link>
    </div>
  </div>
  <div v-else class="text-importer">
    <div class="container">
      <div class="header-top">
        <BackButton text="Back to Admin" small />
        <h2 class="title">Импорт текстов</h2>
      </div>
      
      <!-- File Upload -->
      <div class="upload-section">
        <h3>Загрузить файл JSON</h3>
        <div class="file-upload">
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileUpload"
            class="file-input"
          />
          <button @click="triggerFileInput" class="upload-button">
            Выбрать файл
          </button>
          <span v-if="selectedFile" class="file-name">
            {{ selectedFile.name }}
          </span>
        </div>
        
        <div v-if="uploadResult" class="upload-result" :class="uploadResult.success ? 'success' : 'error'">
          {{ uploadResult.message || uploadResult.error }}
        </div>
      </div>
      
      <!-- JSON Input -->
      <div class="json-section">
        <h3>Или вставить JSON напрямую</h3>
        <textarea
          v-model="jsonInput"
          placeholder="Вставьте JSON с текстами здесь..."
          class="json-textarea"
          rows="10"
        ></textarea>
        <button @click="importFromJSON" class="import-button" :disabled="!jsonInput.trim()">
          Импортировать из JSON
        </button>
        
        <div v-if="jsonResult" class="json-result" :class="jsonResult.success ? 'success' : 'error'">
          {{ jsonResult.message || jsonResult.error }}
        </div>
      </div>
      
      
      <!-- Actions -->
      <div class="actions-section">
        <button @click="clearTexts" class="clear-button" :disabled="statistics.total === 0">
          Очистить все тексты
        </button>
        <button @click="downloadSample" class="sample-button">
          Скачать пример JSON
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageLearningStore } from '../stores/languageLearning'
import { useAuthStore } from '../stores/auth.js'
import LogoutButton from './LogoutButton.vue'
import BackButton from './BackButton.vue'

const store = useLanguageLearningStore()
const authStore = useAuthStore()
const isAdmin = ref(false)

onMounted(() => {
  checkAdminAccess()
})

const checkAdminAccess = () => {
  const user = authStore.user
  if (!user) {
    isAdmin.value = false
    return
  }
  const userMetadata = user.user_metadata
  if (userMetadata && userMetadata.role === 'admin') {
    isAdmin.value = true
    return
  }
  const adminEmails = [
    'aptashenko2019@gmail.com',
    'your-email@example.com',
    'admin@example.com'
  ]
  if (adminEmails.includes(user.email)) {
    isAdmin.value = true
    return
  }
  isAdmin.value = false
}

// Local state
const fileInput = ref(null)
const selectedFile = ref(null)
const jsonInput = ref('')
const uploadResult = ref(null)
const jsonResult = ref(null)

// Computed
const statistics = computed(() => store.getTextStatistics())

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  selectedFile.value = file
  uploadResult.value = null
  
  try {
    const result = await store.importTextsFromFile(file)
    uploadResult.value = result
    
    if (result.success) {
      // Clear file input
      event.target.value = ''
      selectedFile.value = null
    }
  } catch (error) {
    uploadResult.value = {
      success: false,
      error: 'Ошибка при загрузке файла'
    }
  }
}

async function importFromJSON() {
  if (!jsonInput.value.trim()) return
  
  jsonResult.value = null
  
  try {
    const result = await store.importTextsFromJSON(jsonInput.value)
    jsonResult.value = result
    
    if (result.success) {
      jsonInput.value = ''
    }
  } catch (error) {
    jsonResult.value = {
      success: false,
      error: 'Ошибка при импорте JSON'
    }
  }
}

async function clearTexts() {
  if (confirm('Вы уверены, что хотите удалить все импортированные тексты?')) {
    try {
      const result = await store.clearImportedTexts()
      if (result.success) {
        // Show success message
        alert(result.message || 'Тексты успешно удалены')
      } else {
        // Show error message
        alert(result.error || 'Ошибка при удалении текстов')
      }
    } catch (error) {
      alert('Ошибка при удалении текстов')
    }
  }
}

function downloadSample() {
  const sampleData = [
    {
      "id": 1,
      "title": "Пример текста",
      "level": "A1",
      "target_language": "fr",
      "text": "Это пример текста.\nОн содержит несколько абзацев.\nКаждый абзац на новой строке.",
      // Removed 'words' field
      "questions": [
        "Какой это пример?",
        "Что содержится в тексте?"
      ]
    }
  ]
  
  const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample-texts.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleLogoutSuccess() {
  // Handle logout success
}

function handleLogoutError(error) {
  // Handle logout error
}
</script>

<style scoped>
.text-importer {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.upload-section, .json-section, .statistics-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.upload-section h3, .json-section h3, .statistics-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.file-input {
  display: none;
}

.upload-button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button:hover {
  background: #5a67d8;
}

.file-name {
  color: #4a5568;
  font-size: 0.9rem;
}

.json-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 15px;
}

.json-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.import-button {
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.import-button:hover:not(:disabled) {
  background: #38a169;
}

.import-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.upload-result, .json-result {
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 10px;
}

.upload-result.success, .json-result.success {
  background: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.upload-result.error, .json-result.error {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #feb2b2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
}

.language-breakdown, .level-breakdown {
  margin-bottom: 20px;
}

.language-breakdown h4, .level-breakdown h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.language-stats, .level-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.language-stat, .level-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.lang-code, .level-code {
  font-weight: 600;
  color: #2d3748;
}

.lang-count, .level-count {
  background: #667eea;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.clear-button, .sample-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-button {
  background: #e53e3e;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background: #c53030;
}

.clear-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.sample-button {
  background: #ed8936;
  color: white;
}

.sample-button:hover {
  background: #dd6b20;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
  
  .file-upload {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-section {
    flex-direction: column;
  }
  
  .clear-button, .sample-button {
    width: 100%;
  }
}

/* Admin Access Denied Styles */
.admin-access-denied {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  padding: 20px;
}

.access-denied-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.access-denied-content h2 {
  color: #e53e3e;
  font-size: 1.8rem;
  margin-bottom: 16px;
  font-weight: 600;
}

.access-denied-content p {
  color: #4a5568;
  font-size: 1rem;
  margin-bottom: 24px;
  line-height: 1.5;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  padding: 12px 20px;
  border: 2px solid #667eea;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style> 