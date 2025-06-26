<template>
  <div class="text-list-container">
    <div class="header">
      <nav class="navigation">
        <router-link to="/dictionary" class="nav-link">Dictionary Manager</router-link>
        <button @click="signOut" class="signout-btn">Sign Out</button>
      </nav>
      <h2>Texts by Level</h2>
    </div>
    
    <!-- Show loading state -->
    <div v-if="loading" class="loading">
      Loading texts...
    </div>
    
    <!-- Show error if table doesn't exist -->
    <div v-else-if="tableError" class="error-message">
      <h3>Database Setup Required</h3>
      <p>The texts table doesn't exist in your database yet. Please follow these steps:</p>
      <ol>
        <li>Go to your Supabase dashboard</li>
        <li>Navigate to the SQL Editor</li>
        <li>Run the SQL commands from the <code>database-setup.sql</code> file</li>
        <li>Or run: <code>node setup-database.js</code> in your terminal</li>
      </ol>
      <button @click="retryFetch" class="retry-btn">Retry</button>
    </div>
    
    <!-- Show texts if available -->
    <div v-else>
      <select v-model="selectedLevel">
        <option value="">All Levels</option>
        <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
      </select>
      
      <div v-if="filteredTexts.length === 0" class="no-texts">
        <p>No texts found for the selected level.</p>
      </div>
      
      <ul v-else>
        <li v-for="text in filteredTexts" :key="text.id">
          <router-link :to="`/reader/${text.id}`">{{ text.title }} (Level: {{ text.level }})</router-link>
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

const router = useRouter()
const authStore = useAuthStore()

const texts = ref([])
const selectedLevel = ref('')
const levels = ref([])
const loading = ref(true)
const tableError = ref(false)

const fetchTexts = async () => {
  loading.value = true
  tableError.value = false
  
  try {
    const { data, error } = await supabase.from('texts').select('*')
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "texts" does not exist')) {
        tableError.value = true
      } else {
        console.error('Error fetching texts:', error)
      }
    } else if (data) {
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

const retryFetch = () => {
  fetchTexts()
}

const signOut = async () => {
  await authStore.signOut()
  router.push('/')
}

onMounted(fetchTexts)

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
  @media (max-width: 768px) {
    margin: 10px auto;
  }
}

.header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  font-size: 1.8rem;
  color: #5a4a42;
}

.navigation {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

.nav-link {
  background: #fff;
  color: #d08a6e;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #d08a6e;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 500;
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
  transition: background-color 0.3s;
}
.retry-btn:hover {
  background-color: #82b28d;
}

select {
  margin-bottom: 1.5rem;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  background-color: #fffaf6;
  color: #3b3b3b;
  font-size: 1rem;
  width: 100%;
}

.no-texts {
  text-align: center;
  padding: 2rem;
  color: #7a6a5f;
  font-size: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 0.7rem;
}

li a {
  display: block;
  padding: 0.75rem 1rem;
  background-color: #fff5ee;
  border: 1px solid #e6ddd6;
  border-radius: 10px;
  text-decoration: none;
  color: #5a4a42;
  transition: background-color 0.3s;
  font-weight: 500;
}
li a:hover {
  background-color: #f0e6dd;
}

</style> 