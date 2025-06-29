<template>
  <div class="text-list-container">
    <div class="header">
      <div class="header-top">
        <BackButton text="Back to Home" small />
        <div class="nav-links">
          <router-link to="/dictionary" class="nav-link">{{ $t('navigation.dictionary') }}</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-link">{{ $t('navigation.admin') }}</router-link>
          <router-link to="/settings" class="nav-link">{{ $t('navigation.settings') }}</router-link>
          <button @click="signOut" class="signout-btn">{{ $t('navigation.logout') }}</button>
        </div>
      </div>
      <h2>{{ $t('textList.title', { language: getLanguageName(selectedLanguage) }) }}</h2>
      <div v-if="userNativeLanguage" class="native-language-info">
        <span class="info-icon">🎯</span>
        <span>{{ $t('textList.translationsTo', { language: getLanguageName(userNativeLanguage) }) }}</span>
      </div>
    </div>

    <!-- Language Selector -->
    <div class="language-selector">
      <label for="language-select">{{ $t('textList.language') }}</label>
      <div class="select-wrapper">
        <select id="language-select" v-model="selectedLanguage" @change="fetchTexts">
          <option value="en">🇺🇸 English</option>
          <option value="fr">🇫🇷 French</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="de">🇩🇪 German</option>
          <option value="uk">🇺🇦 Ukrainian</option>
          <option value="ru">🇷🇺 Russian</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">{{ $t('textList.loadingTexts') }}</div>

    <!-- Table error -->
    <div v-else-if="tableError" class="error-message">
      <h3>{{ $t('textList.databaseSetupRequired') }}</h3>
      <p>{{ $t('textList.databaseSetupInstructions') }}</p>
      <ol>
        <li>{{ $t('textList.databaseSetupStep1') }}</li>
        <li>{{ $t('textList.databaseSetupStep2') }}</li>
        <li>{{ $t('textList.databaseSetupStep3') }}</li>
        <li>{{ $t('textList.databaseSetupStep4') }}</li>
      </ol>
      <button @click="retryFetch" class="retry-btn">{{ $t('textList.retry') }}</button>
    </div>

    <!-- Filters -->
    <div v-else>
      <div class="filters">
        <select v-model="selectedLevel">
          <option value="">{{ $t('textList.allLevels') }}</option>
          <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
        </select>
      </div>

      <div v-if="filteredTexts.length === 0" class="no-texts">
        <p>{{ $t('textList.noTextsFound', { language: selectedLanguage.toUpperCase() }) }}</p>
      </div>

      <ul v-else class="texts-list">
        <li v-for="text in filteredTexts" :key="text.id" class="text-item">
          <router-link :to="`/reader/${text.id}`" class="text-link">
            <div class="text-title">{{ text.title }}</div>
            <div class="text-meta">
              <span class="level">{{ text.level }}</span>
              <span class="language">{{ getLanguageName(text.language) }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'
import { UserPreferencesService } from '../services/userPreferences.js'
import BackButton from './BackButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const texts = ref([])
const selectedLevel = ref('')
const selectedLanguage = ref('en')
const userNativeLanguage = ref('en')
const levels = ref([])
const loading = ref(true)
const tableError = ref(false)
const isAdmin = ref(false)

const fetchTexts = async () => {
  loading.value = true
  tableError.value = false
  try {
    const { data, error } = await supabase
      .from('texts')
      .select('*')
      .eq('language', selectedLanguage.value)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "texts" does not exist')) {
        tableError.value = true
      } else {
        console.error('Error fetching texts:', error)
      }
    } else {
      texts.value = data
      levels.value = [...new Set(data.map(t => t.level))]
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    tableError.value = true
  } finally {
    loading.value = false
  }
}

const loadUserPreferences = async () => {
  try {
    const user = authStore.user
    if (user) {
      const preferences = await UserPreferencesService.getUserPreferences(user.id)
      userNativeLanguage.value = preferences.native_language
      checkAdminAccess(user)
    }
  } catch (error) {
    console.error('Error loading user preferences:', error)
  }
}

const checkAdminAccess = (user) => {
  try {
    console.log('Checking admin access for user:', user.email)
    console.log('User metadata:', user.user_metadata)
    
    // Check if user has admin role in user_metadata
    const userMetadata = user.user_metadata
    if (userMetadata && userMetadata.role === 'admin') {
      console.log('✅ Admin access granted via role metadata')
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
      console.log('✅ Admin access granted via email')
      isAdmin.value = true
      return
    }
    
    // If none of the above, user is not admin
    console.log('❌ User is not admin')
    isAdmin.value = false
    
  } catch (error) {
    console.error('Error checking admin access:', error)
    isAdmin.value = false
  }
}

const retryFetch = () => fetchTexts()

const signOut = async () => {
  await authStore.signOut()
  router.push('/')
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

onMounted(async () => {
  await loadUserPreferences()
  await fetchTexts()
})

const filteredTexts = computed(() => {
  if (!selectedLevel.value) return texts.value
  return texts.value.filter(t => t.level === selectedLevel.value)
})
</script>

<style scoped>
.text-list-container {
  max-width: 700px;
  margin: 60px auto;
  padding: 2rem;
  background: #fffaf6;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: #3b3b3b;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}
.header h2 {
  font-size: 1.8rem;
  color: #5a4a42;
  margin: 0.5rem 0 0;
}
.native-language-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff3e6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #5a4a42;
}
.info-icon {
  font-size: 1.1rem;
}
.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.nav-link {
  background: #fff;
  color: #d08a6e;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #d08a6e;
  border-radius: 8px;
  font-weight: 500;
  transition: 0.3s;
}
.nav-link:hover {
  background: #d08a6e;
  color: white;
}
.signout-btn {
  background: #dc7868;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.signout-btn:hover {
  background: #c95e4f;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #fff3e6;
  padding: 1rem;
  border-radius: 12px;
  flex-wrap: wrap;
}
.language-selector label {
  font-weight: 600;
  color: #5a4a42;
}
.select-wrapper {
  position: relative;
  width: 200px;
}
.select-wrapper select {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 2px solid #d8a48f;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  font-weight: 500;
  appearance: none;
  cursor: pointer;
  color: #000;
}

.filters {
  margin-bottom: 2rem;
}
.filters select {
  padding: 0.75rem 1rem;
  border: 2px solid #d8a48f;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  min-width: 200px;
  color: #000;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7e6f67;
  font-size: 1.1rem;
}

.error-message {
  background: #fcebea;
  border: 1px solid #f5c6cb;
  border-radius: 10px;
  padding: 1.5rem;
  margin: 2rem 0;
  color: #8a3c3c;
}
.error-message h3 {
  margin-top: 0;
  color: #7a1e1e;
}
.error-message ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}
.error-message code {
  background: #fff5f2;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #98c9a3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}
.retry-btn:hover {
  background-color: #7fb88a;
}

.no-texts {
  text-align: center;
  padding: 2rem;
  color: #7e6f67;
  font-size: 1.1rem;
}

.texts-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.text-item {
  margin-bottom: 1rem;
}
.text-link {
  display: block;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e8d8c3;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}
.text-link:hover {
  border-color: #d8a48f;
  box-shadow: 0 4px 12px rgba(216, 164, 143, 0.2);
  transform: translateY(-2px);
}
.text-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #5a4a42;
  margin-bottom: 0.5rem;
}
.text-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.level {
  background: #d8a48f;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}
.language {
  background: #e8d8c3;
  color: #5a4a42;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .text-list-container {
    margin: 20px auto;
    padding: 1rem;
  }

  .text-link {
    padding: 1rem;
  }

  .text-title {
    font-size: 1.1rem;
  }

  .level, .language {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }
}
</style>
