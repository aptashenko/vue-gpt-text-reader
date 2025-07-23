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
        @click="router.push('/import')"
        :class="{ active: activeTab === 'import' }"
        class="tab-btn"
      >
        Import JSON
      </button>
    </div>

    <!-- Texts Management -->
    <div v-if="activeTab === 'texts'" class="texts-section">
      <div class="section-header">
        <h3>{{ $t('admin.texts', { language: currentLanguage.toUpperCase() }) }}</h3>
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
              <button @click="deleteText(text.id)" class="delete-btn">{{ $t('admin.delete') }}</button>
            </div>
          </div>
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
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const currentLanguage = ref('en')
const activeTab = ref('texts')
const loading = ref(false)
const isAdmin = ref(false)
const texts = ref([])
const router = useRouter()

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
    await loadTexts();
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
