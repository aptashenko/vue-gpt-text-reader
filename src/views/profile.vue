<template>
  <div class="profile-wrapper">
    <!-- User Info Card -->
    <div class="card card-main">
      <h2 class="card-title">Your Profile</h2>
      <div class="profile-info">
        <BaseInput v-model="userStore.userCopy.email" label="Email" disabled />
        <BaseInput v-model="userStore.userCopy.role" label="Role" disabled />
        <BaseInput v-model="userStore.userCopy.created_at" label="Joined" disabled />
        <BaseInput v-model="userStore.userCopy.subscription" label="Plan" disabled />
      </div>

      <div class="actions">
        <button
            class="save-button"
            :disabled="!isChanges || !userStore.userCopy.language || !userStore.userCopy.level"
            @click="submitProfile"
        >
          Save Changes
        </button>
      </div>
    </div>

    <!-- Language & Level Settings -->
    <div class="card card-settings">
      <!-- Language -->
      <section>
        <h3 class="section-title">Preferred Language</h3>
        <div class="grid-options">
          <template v-for="item of textStore.languagesList">
            <button
                v-for="(isActive, lang) in item"
                :key="lang"
                :disabled="!isActive"
                :class="['option', { active: isSelected('language', lang) }]"
                @click="selectCard('language', lang)"
            >
              <span class="flag">{{ getFlag(lang) }}</span>
              <span>{{ lang.toUpperCase() }}</span>
              <span v-if="!isActive" class="coming-soon">Coming soon</span>
            </button>
          </template>
        </div>
      </section>

      <!-- Level -->
      <section>
        <h3 class="section-title">Your Level</h3>
        <div class="grid-options">
          <template v-for="item of textStore.levelsList">
            <button
                v-for="(isActive, level) in item"
                :key="level"
                :disabled="!isActive"
                :class="['option', { active: isSelected('level', level) }]"
                @click="selectCard('level', level)"
            >
              <span class="label">{{ level.toUpperCase() }}</span>
              <span v-if="!isActive" class="coming-soon">Coming soon</span>
            </button>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useUserStore} from '../stores/user.store.js'
import {useTextsStore} from '../stores/texts.store.js'
import BaseInput from '../shared/ui/Form/BaseInput.vue'

const userStore = useUserStore()
const textStore = useTextsStore()

const isChanges = computed(() => {
  return Object.entries(userStore.user).some(
      ([key, val]) => userStore.userCopy[key] !== val
  )
})

function isSelected(key, val) {
  return userStore.userCopy[key] === val
}

function selectCard(key, value) {
  userStore.userCopy[key] = value
}

function submitProfile() {
  userStore.updateUserInfo({
    language: userStore.userCopy.language,
    level: userStore.userCopy.level,
  })
}

function getFlag(code) {
  const flags = {
    en: '🇺🇸',
    fr: '🇫🇷',
    es: '🇪🇸',
    de: '🇩🇪',
    uk: '🇺🇦',
    ru: '🏳️'
  }
  return flags[code] || '🏳️'
}
</script>

<style scoped>
.profile-wrapper {
  display: grid;
  gap: 30px;
  padding: 40px;
  background: #f5f7fb;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #2d3748;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #4a5568;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.actions {
  margin-top: 24px;
  text-align: right;
}

.save-button {
  background: #4f46e5;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.grid-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.option {
  position: relative;
  padding: 14px 10px;
  background: #edf2f7;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.option:disabled {
  background: rgba(237, 242, 247, 0.3);
  cursor: wait;
  pointer-events: none;
}

.option:disabled span {
  color: rgba(26, 26, 26, 0.5);
}

.option:disabled .flag {
  opacity: 0.5;
}

.coming-soon {
  position: absolute;
  bottom: -6px;
  font-size: 0.65rem;
  background: #f56565;
  color: white !important;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 500;
}

.option .flag {
  font-size: 1.4rem;
  margin-bottom: 4px;
}

.option.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.option.active span {
  color: inherit;
}
</style>
