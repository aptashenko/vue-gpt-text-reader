<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="app-title" @click="goHome" role="button" tabindex="0">
          {{ $t('app.title') }}
        </h1>
      </div>

      <!-- Desktop Navigation -->
      <div class="header-right desktop-nav">
        <div class="user-info">
          <span class="user-email">{{ userEmail }}</span>
        </div>
        <button
          v-if="isAdmin"
          @click="() => { goToAdmin(); closeMobileMenu(); }"
          class="admin-button"
          :title="$t('navigation.admin')"
        >
          {{ $t('navigation.admin') }}
        </button>
        <button
          v-if="false"
          @click="() => { goToFeedback(); closeMobileMenu(); }"
          class="feedback-button"
          :title="$t('navigation.feedback')"
        >
          {{ $t('navigation.feedback') }}
        </button>
        <button
          v-if="userStore.isLogged"
          @click="() => { goToSavedWords(); closeMobileMenu(); }"
          class="saved-words-button"
          :title="$t('navigation.savedWords')"
        >
          📚 {{ $t('navigation.savedWords') }}
        </button>
        <button
          v-if="!isAdmin"
          @click="() => { buyMeACoffee(); closeMobileMenu(); }"
          class="coffee-button"
          title="Buy me a coffee"
        >
          ☕ Buy me a coffee
        </button>
        <LogoutButton
        v-if="userStore.isLogged || userStore.isGuest"
          variant="text"
          :text="$t('navigation.logout')"
          @logout-success="() => { handleLogoutSuccess(); closeMobileMenu(); }"
          @logout-error="handleLogoutError"
        />
      </div>

      <!-- Mobile Burger Menu Button -->
      <div class="mobile-nav">
        <button
          @click="toggleMobileMenu"
          class="burger-button"
          :class="{ 'active': isMobileMenuOpen }"
          aria-label="Toggle navigation menu"
        >
          <span class="burger-line"></span>
          <span class="burger-line"></span>
          <span class="burger-line"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-menu-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- Mobile Menu -->
    <div
      class="mobile-menu"
      :class="{ 'open': isMobileMenuOpen }"
    >
      <div class="mobile-menu-header">
        <div class="mobile-user-info">
          <span class="mobile-user-email">{{ userEmail }}</span>
        </div>
        <button

          class="close-button"
          aria-label="Close menu"
          @click="closeMobileMenu"
        >
          ✕
        </button>
      </div>

      <nav class="mobile-nav-links">
        <button
          v-if="false"
          @click="() => { goToFeedback(); closeMobileMenu(); }"
          class="mobile-nav-item"

        >
          <span class="mobile-nav-icon">💬</span>
          {{ $t('navigation.feedback') }}
        </button>
        <button
          v-if="userStore.isLogged"
          @click="() => { goToSavedWords(); closeMobileMenu(); }"
          class="mobile-nav-item"
        >
          <span class="mobile-nav-icon">📚</span>
          {{ $t('navigation.savedWords') }}
        </button>
        <button
          v-if="isAdmin"
          @click="() => { goToAdmin(); closeMobileMenu(); }"
          class="mobile-nav-item"

        >
          <span class="mobile-nav-icon">⚙️</span>
          {{ $t('navigation.admin') }}
        </button>
        <button
        v-if="!isAdmin"
          @click="() => { buyMeACoffee(); closeMobileMenu(); }"
          class="mobile-nav-item"
        >
          <span class="mobile-nav-icon">☕</span>
          Buy me a coffee
        </button>

        <div class="mobile-nav-divider"></div>

      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LogoutButton from './LogoutButton.vue'
import analyticsService from '../services/logsnag.js'
import { getAnalyticsUserId } from '../utils/analytics.js'
import { useRoute } from 'vue-router'
import {useAuthStore1} from "../stores/auth.store.js";
import {useUserStore} from "../stores/user.store.js";

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore();
const authStore1 = useAuthStore1();
const userStore = useUserStore();

// Reactive data
const isMobileMenuOpen = ref(false)

// Computed
const userEmail = computed(() => {
  return authStore.user?.email || 'User'
})

const isAdmin = computed(() => {
  const user = authStore.user
  if (!user) return false

  // Check if user has admin role in user_metadata
  const userMetadata = user.user_metadata
  if (userMetadata && userMetadata.role === 'admin') {
    return true
  }

  // Check by email
  const adminEmails = [
    'aptashenko2019@gmail.com',
    'your-email@example.com',
    'admin@example.com'
  ]

  return adminEmails.includes(user.email)
})

// Methods
function goHome() {
  router.push('/app')
}

function goToFeedback() {
  router.push('/feedback')
}

function goToAdmin() {
  router.push('/admin')
}

function buyMeACoffee() {
  try {
    analyticsService.trackMetric('coffee_button_clicked', 1, {
      user_id: getAnalyticsUserId(),
      page: route.path
    })

    console.log('user_id', getAnalyticsUserId())
    analyticsService.track('coffee_button_clicked', {
      description: 'User clicked Buy me a coffee button',
      tags: {
        user_id: getAnalyticsUserId(),
        page: route.path
      },
      icon: '☕',
      user_id: getAnalyticsUserId()
    })
  } catch (analyticsError) {
    console.error('Analytics tracking error:', analyticsError)
  }

  window.open('https://coff.ee/aptashenko', '_blank')
}

function goToSavedWords() {
  router.push('/saved-words')
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function handleLogoutSuccess() {
  console.log('Logout successful')
  closeMobileMenu()
}

function handleLogoutError(error) {
  console.error('Logout error:', error)
  // You could show a toast notification here
}

// Keyboard event handler
function handleKeydown(event) {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
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

.admin-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
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

.saved-words-button {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.saved-words-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 153, 225, 0.3);
}

.coffee-button {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.coffee-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .app-title {
    font-size: 1.2rem;
  }

  .desktop-nav {
    display: none !important;
  }

  .mobile-nav {
    display: block !important;
  }
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
}

.burger-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.burger-button:hover {
  background: #f7fafc;
}

.burger-button.active {
  background: #e2e8f0;
}

.burger-line {
  width: 20px;
  height: 2px;
  background: #4a5568;
  margin: 2px 0;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.burger-button.active .burger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-button.active .burger-line:nth-child(2) {
  opacity: 0;
}

.burger-button.active .burger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
  backdrop-filter: blur(2px);
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100vh;
  background: white;
  z-index: 200;
  transition: right 0.3s ease;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.mobile-menu.open {
  right: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.mobile-user-info {
  display: flex;
  flex-direction: column;
}

.mobile-user-email {
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #4a5568;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.mobile-nav-links {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
  color: #2d3748;
}

.mobile-nav-item:hover {
  background: #f7fafc;
}

.mobile-nav-item:active {
  background: #e2e8f0;
}

.mobile-nav-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.mobile-nav-item span:not(.mobile-nav-icon) {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
}

.mobile-nav-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 16px 20px;
}

/* Mobile Logout Button */
.mobile-menu :deep(.logout-button.mobile) {
  width: 100%;
  padding: 16px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #e53e3e;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.mobile-menu :deep(.logout-button.mobile:hover) {
  background: #fed7d7;
}

.mobile-menu :deep(.logout-button.mobile:active) {
  background: #feb2b2;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
