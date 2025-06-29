<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-card">
        <!-- Header -->
        <header class="not-found-header">
          <div class="error-code">404</div>
          <h1 class="error-title">{{ $t('notFound.title') }}</h1>
          <p class="error-description">
            {{ $t('notFound.message') }}
          </p>
          <p class="error-subtitle">
            {{ $t('notFound.subtitle') }}
          </p>
        </header>

        <!-- Illustration -->
        <div class="illustration">
          <div class="book-icon">📚</div>
          <div class="search-icon">🔍</div>
          <div class="globe-icon">🌍</div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <div class="action-buttons">
            <button 
              @click="goBack" 
              class="secondary-button"
            >
              <span class="button-icon">⬅️</span>
              {{ $t('notFound.goBack') }}
            </button>
            <button 
              @click="goHome" 
              class="primary-button"
            >
              <span class="button-icon">🏠</span>
              {{ $t('notFound.goHome') }}
            </button>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="links-section">
          <h3 class="links-title">{{ $t('notFound.quickLinks') }}</h3>
          <div class="links-grid">
            <router-link to="/" class="link-item">
              <span class="link-icon">📖</span>
              {{ $t('notFound.startLearning') }}
            </router-link>
            <router-link to="/import" class="link-item">
              <span class="link-icon">📥</span>
              {{ $t('notFound.importTexts') }}
            </router-link>
            <router-link to="/settings" class="link-item">
              <span class="link-icon">⚙️</span>
              {{ $t('notFound.settings') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const canAccessProtectedRoutes = computed(() => authStore.canAccessProtectedRoutes)

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // If no history, redirect to appropriate page
    if (canAccessProtectedRoutes.value) {
      router.push('/')
    } else {
      router.push('/login')
    }
  }
}

const goHome = () => {
  if (canAccessProtectedRoutes.value) {
    router.push('/')
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 600px;
  width: 100%;
}

.not-found-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.not-found-header {
  margin-bottom: 30px;
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 15px 0;
}

.error-description {
  font-size: 1.1rem;
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

.illustration {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 30px 0;
  flex-wrap: wrap;
}

.book-icon, .search-icon, .globe-icon {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}

.book-icon {
  animation-delay: 0s;
}

.search-icon {
  animation-delay: 1s;
}

.globe-icon {
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.actions-section {
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-button, .secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.secondary-button {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.secondary-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.button-icon {
  font-size: 1.1rem;
}

.links-section {
  margin-top: 30px;
}

.links-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 15px 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.link-item:hover {
  background: #edf2f7;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.link-icon {
  font-size: 1.1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .not-found-card {
    padding: 30px 20px;
  }
  
  .error-code {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-description {
    font-size: 1rem;
  }
  
  .illustration {
    gap: 15px;
  }
  
  .book-icon, .search-icon, .globe-icon {
    font-size: 2.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-button, .secondary-button {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .not-found-page {
    padding: 10px;
  }
  
  .not-found-card {
    padding: 20px 15px;
  }
  
  .error-code {
    font-size: 3rem;
  }
  
  .error-title {
    font-size: 1.3rem;
  }
  
  .illustration {
    gap: 10px;
  }
  
  .book-icon, .search-icon, .globe-icon {
    font-size: 2rem;
  }
}
</style> 