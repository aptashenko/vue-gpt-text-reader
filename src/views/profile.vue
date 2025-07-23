<template>
  <div class="profile-page">
    <div class="container">
      <header class="header">
        <h1 class="title">Profile</h1>
        <p class="subtitle">Manage your personal info</p>
      </header>

      <form class="profile-form" @submit.prevent="submitProfile">
        <div class="form-group">
          <base-input v-model="userStore.userCopy.email" :disabled="true" label="Email" type="email" />
        </div>

        <div class="form-group">
          <base-input v-model="userStore.userCopy.role" :disabled="true" label="Role" type="text" />
        </div>

        <div class="form-group">
          <base-input v-model="userStore.userCopy.created_at" :disabled="true" label="Created At" type="text" />
        </div>

        <div class="form-group">
          <base-input v-model="userStore.userCopy.subscription" :disabled="true" label="Plan" type="text" />
        </div>

        <button v-if="isChanges" type="submit" :disabled="!userStore.userCopy.language || !userStore.userCopy.level" class="save-button">Save</button>
      </form>
    </div>
    <div class="container-right">
      <div class="form-section">
        <label class="form-label">
          Choose your language
        </label>
        <div class="language-grid">
          <template v-for="langItem in textsStore.languagesList">
            <button
                v-for="(isActive, lang) in langItem"
                :key="lang"
                type="button"
                class="language-card"
                :class="{
                    active: userStore.userCopy.language === lang,
                    disabled: !isActive
                  }"
                @click="selectSetting(isActive, 'language', lang)"
                :disabled="!isActive"
                :title="!isActive ? $t('startPage.comingSoon') : ''"
            >
              <div class="language-flag">{{ getFlag(lang) }}</div>
              <div class="language-name">{{ $t(`languages.${lang}`) }}</div>
              <div v-if="!isActive" class="coming-soon-badge">
                {{ $t('startPage.comingSoon') }}
              </div>
            </button>
          </template>
        </div>
      </div>

      <!-- Level Selection -->
      <div class="form-section">
        <label class="form-label">
          Choose your level
        </label>
        <div class="level-grid">
          <template v-for="levelItem in textsStore.levelsList">
            <button
                v-for="(isActive, level) in levelItem"
                :key="level"
                type="button"
                class="level-card"
                :class="{
                    active: userStore.userCopy.level === level,
                    disabled: !isActive
                  }"
                @click="selectSetting(isActive, 'level', level)"
                :disabled="!isActive"
                :title="!isActive ? $t('startPage.comingSoon') : ''"
            >
              <div class="level-code">{{ level.toUpperCase() }}</div>
              <div class="level-name">
                {{$t(`levels.${level.toUpperCase()}`)}}
              </div>
              <div class="level-description">{{$t(`levelDescriptions.${level.toUpperCase()}`)}}</div>
              <div v-if="!isActive" class="coming-soon-badge">
                {{ $t('startPage.comingSoon') }}
              </div>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue';
import {useUserStore} from "../stores/user.store.js";
import BaseInput from "../shared/ui/Form/BaseInput.vue";
import {useTextsStore} from "../stores/texts.store.js";
import {useAuthStore1} from "../stores/auth.store.js";

const userStore = useUserStore();
const authStore1 = useAuthStore1();
const textsStore = useTextsStore();

const isChanges = computed(() => {
  const entries = Object.entries(userStore.user);
  return !entries.every(([key, value]) => {
    return userStore.userCopy[key] === userStore.user[key];
  });
});

const selectSetting = (active, key, lang) => {
  if (!active) return;
  userStore.userCopy[key] = lang;
}

function submitProfile() {
  userStore.updateUserInfo({
    language: userStore.userCopy.language,
    level: userStore.userCopy.level,
  })
}

function getFlag(langCode) {
  const flags = {
    'en': '🇺🇸',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'de': '🇩🇪',
    'uk': '🇺🇦',
    'ru': '🏳️'
  }
  return flags[langCode] || '🏳️'
}

if (!userStore.user.email) {
  authStore1.loginAsGuest();
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  gap: 20px;
  display: flex;
  align-items: start;
  justify-content: center;
}

@media (max-width: 480px) {
  .profile-page {
    flex-direction: column;
  }
}

.container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.container-right {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.subtitle {
  font-size: 1rem;
  color: #718096;
  margin-top: 5px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #4a5568;
}

input,
select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  font-size: 1rem;
}

input[disabled] {
  background: #edf2f7;
  color: #718096;
}

.save-button {
  margin-top: 20px;
  padding: 12px;
  font-weight: 600;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:disabled {
  opacity: 0.5;
}

.save-button:hover {
  background: #5a67d8;
}

@media (max-width: 600px) {
  .container {
    padding: 20px;
  }
}

.start-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: #2d3748;
  margin-bottom: 20px;
}

.form-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.language-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.language-card {
  position: relative;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  color: #2d3748;
  border-radius: 12px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.language-card:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.language-card.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.language-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #64748b;
}

.language-card.disabled:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  transform: none;
}

.language-flag {
  font-size: 2rem;
  margin-bottom: 8px;
  line-height: 1;
}

.language-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.language-code {
  font-size: 0.8rem;
  opacity: 0.8;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.level-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  color: #2d3748;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
}

.level-card:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.level-card.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.level-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #64748b;
}

.level-card.disabled:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  transform: none;
}

.level-code {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.level-name {
  font-weight: 600;
  margin-bottom: 6px;
}

.level-description {
  font-size: 0.9rem;
  opacity: 0.8;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.start-button, .import-button {
  flex: 1;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  border-radius: 12px;
}

.start-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.start-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.start-button.disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.import-button {
  background: #ed8936;
  color: white;
}

.import-button:hover {
  background: #dd6b20;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(237, 137, 54, 0.3);
}

.coming-soon-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 10px 0;
  }

  .title {
    font-size: 2rem;
  }

  .language-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .level-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
