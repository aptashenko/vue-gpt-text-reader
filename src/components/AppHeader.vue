<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="app-title" @click="goHome" role="button" tabindex="0">
          {{ $t('app.title') }}
        </h1>
      </div>
      
      <div class="header-right">
        <div class="user-info">
          <span class="user-email">{{ userEmail }}</span>
        </div>
        <button 
          @click="goToFeedback" 
          class="feedback-button"
          :title="$t('navigation.feedback')"
        >
          {{ $t('navigation.feedback') }}
        </button>
        <LogoutButton 
          variant="text"
          :text="$t('navigation.logout')"
          @logout-success="handleLogoutSuccess"
          @logout-error="handleLogoutError"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LogoutButton from './LogoutButton.vue'

const router = useRouter()
const authStore = useAuthStore()

// Computed
const userEmail = computed(() => {
  return authStore.user?.email || 'User'
})

// Methods
function goHome() {
  router.push('/app')
}

function goToFeedback() {
  router.push('/feedback')
}

function handleLogoutSuccess() {
  console.log('Logout successful')
}

function handleLogoutError(error) {
  console.error('Logout error:', error)
  // You could show a toast notification here
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.app-title:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.app-title:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  border-radius: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-email {
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.feedback-button {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feedback-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(237, 137, 54, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 50px;
  }
  
  .app-title {
    font-size: 1.2rem;
  }
  
  .user-email {
    font-size: 0.8rem;
  }
  
  .header-right {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .user-email {
    display: none;
  }
}
</style> 