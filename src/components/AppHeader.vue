<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo" @click="goHome">Language Reader</div>

      <!-- Desktop Menu -->
      <nav class="desktop-nav">
        <template v-for="item in visibleMenuItems" :key="item.label">
          <button
              class="nav-button"
              @click="() => handleAction(item)"
          >
            <span v-if="item.icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </template>
        <LogoutButton
            v-if="userStore.isLogged"
            variant="text"
            text="Log out"
            @logout-success="handleLogoutSuccess"
            @logout-error="handleLogoutError"
        />
      </nav>

      <!-- Mobile Burger -->
      <div class="burger" @click="toggleMobile">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" v-if="isMobileOpen">
      <div class="mobile-header">
        <span>{{ userEmail }}</span>
        <button class="close" @click="isMobileOpen = false">✕</button>
      </div>
      <div class="mobile-links">
        <template v-for="item in visibleMenuItems" :key="item.label">
          <button
              class="mobile-link"
              @click="() => handleAction(item)"
          >
            <span v-if="item.icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </template>
        <LogoutButton
            v-if="userStore.isLogged"
            variant="text"
            text="Log out"
            class="mobile-link"
            @logout-success="handleLogoutSuccess"
            @logout-error="handleLogoutError"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LogoutButton from './LogoutButton.vue'
import analyticsService from '../services/logsnag'
import { getAnalyticsUserId } from '../utils/analytics'
import {useUserStore} from "../stores/user.store.js";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isMobileOpen = ref(false)
const toggleMobile = () => (isMobileOpen.value = !isMobileOpen.value)
const closeMobile = () => (isMobileOpen.value = false)

const userEmail = computed(() => userStore.user?.email || 'Guest')
const isAdmin = computed(() => userStore.user?.role === 'admin')

const menuItems = [
  {
    label: 'Admin',
    icon: '⚙️',
    show: () => isAdmin.value,
    action: () => router.push('/admin'),
  },
  {
    label: 'Profile',
    icon: '📚',
    show: () => userStore.isLogged,
    action: () => router.push('/profile'),
  },
  {
    label: 'Buy me a coffee',
    icon: '☕',
    show: () => !isAdmin.value,
    action: () => {
      analyticsService.track('coffee_button_clicked', {
        user_id: getAnalyticsUserId(),
        page: route.path,
      })
      window.open('https://coff.ee/aptashenko', '_blank')
    },
  },
]

const visibleMenuItems = computed(() =>
    menuItems.filter((item) => item.show?.())
)

function goHome() {
  router.push('/app')
  closeMobile()
}

function handleAction(item) {
  item.action()
  closeMobile()
}

function handleLogoutSuccess() {
  console.log('Logout success')
  closeMobile()
}

function handleLogoutError(err) {
  console.error('Logout error', err)
}

function handleEscape(e) {
  if (e.key === 'Escape') closeMobile()
}

onMounted(() => document.addEventListener('keydown', handleEscape))
onUnmounted(() => document.removeEventListener('keydown', handleEscape))
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.header-container {
  max-width: 1200px;
  margin: auto;
  padding: 0 16px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-weight: 700;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  cursor: pointer;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-button {
  background: none;
  border: none;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
}
.nav-button:hover {
  color: #2d3748;
}

/* Burger */
.burger {
  display: none;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}
.burger span {
  width: 24px;
  height: 2px;
  background: #4a5568;
  border-radius: 2px;
}

/* Mobile */
.mobile-menu {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  right: 0;
  width: 260px;
  height: 100vh;
  padding: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-weight: 500;
}

.close {
  background: none;
  font-size: 1.4rem;
  border: none;
  cursor: pointer;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-link {
  background: none;
  border: none;
  text-align: left;
  padding: 10px;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
  transition: 0.2s;
}
.mobile-link:hover {
  background: #f7fafc;
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  .burger {
    display: flex;
  }
}
</style>
