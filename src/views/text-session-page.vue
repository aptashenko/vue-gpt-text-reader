<template>
  <div class="text-session-page">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-top">
          <BackButton :text="$t('textSession.backToTexts')" small />
          <div class="language-info">
            <span class="language-badge">{{ textsStore.currentText?.language.toUpperCase() }}</span>
            <span class="level-badge">{{ textsStore.currentText?.level }}</span>
          </div>
        </div>
        <h1 class="text-title">{{ textsStore.currentText?.title }}</h1>
      </header>

      <!-- Loading State -->
      <div v-if="textsStore.textLoader" class="loading">
        <div class="spinner"></div>
        <p>{{ $t('textSession.loadingText') }}</p>
      </div>

      <!-- Text Content -->
      <div v-else-if="textsStore.currentText" class="content">
        <!-- Text Reading Section -->
        <section class="text-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('textSession.textForReading') }}</h2>
          </div>
          <div class="text-content" ref="textContentRef">
            <span v-for="(word, pIdx) in splitTextWithArticles" :key="pIdx" :class="{'word': !punctuation.includes(word)}"
              @click="!punctuation.includes(word) && openWordPanel(word)"
              style="user-select: none;"
            >
              {{ word }}
            </span>
          </div>
        </section>
        <!-- Fixed bottom panel for word actions -->
        <div v-if="panel.visible" class="word-panel">
          <button class="panel-close" @click="closeWordPanel">&times;</button>
          <div class="panel-word">{{ panel.word }}</div>
          <div v-if="!panel.translation && !panel.loading">
            <button class="panel-btn" @click="translateWord(panel.word)">
              {{ $t('textSession.translateWithAI') }}
            </button>
          </div>
          <div v-else-if="panel.loading">
            <span class="panel-loading">{{ $t('textSession.translating') }}</span>
          </div>
          <div v-else>
            <div class="panel-translation">{{ panel.translation }}</div>
            <button v-if="!authStore.isGuestMode" class="panel-btn" :disabled="panel.added" @click="addToFlashcards(panel.word, panel.translation)">
              <span v-if="panel.added">✅ {{ $t('textSession.addedToFlashcards') }}</span>
              <span v-else>{{ $t('textSession.addToFlashcards') }}</span>
            </button>
          </div>
        </div>
        <!-- Questions Section -->
        <section class="questions-section">
          <h2 class="section-title">{{ $t('textSession.questions') }}</h2>
          <div class="questions-list">
            <div
              v-for="(question, index) in textsStore.currentText.questions"
              :key="index"
              class="question-item"
            >
              <label class="question-label">
                {{ index + 1 }}. {{ question.question_text }}
              </label>
              <textarea
                v-model="userAnswers[index]"
                class="answer-input"
                :placeholder="$t('textSession.answerPlaceholder', { number: index + 1 })"
                rows="3"
              ></textarea>
            </div>
          </div>

          <button
            @click="checkAnswers"
            class="check-button"
            :disabled="!canSubmit || checking"
            :class="{ disabled: !canSubmit || checking }"
          >
            <span v-if="checking" class="loader"></span>
            {{ checking ? $t('textSession.checkingAnswers') : $t('textSession.checkAnswers') }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick, reactive, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageLearningStore } from '../stores/languageLearning.js'
import { useAuthStore } from '../stores/auth.js'
import { gptService } from '../services/gpt.js'
import BackButton from '../components/BackButton.vue'
import { SavedWordsService } from '../services/savedWords.js'
import {useUserStore} from "../stores/user.store.js";
import {useTextsStore} from "../stores/texts.store.js";

const router = useRouter()
const route = useRoute()
const store = useLanguageLearningStore()
const authStore = useAuthStore();
const userStore = useUserStore();
const textsStore = useTextsStore();

// Local state
const userAnswers = ref([])
const checking = ref(false)
const addedWords = ref(new Set());

// Computed properties
const punctuation = [
  // Стандартные знаки
  '.', ',', '!', '?', ';', ':',

  // Скобки
  '(', ')', '[', ']', '{', '}', '<', '>',

  // Кавычки (одинарные, двойные, французские, типографские)
  '"', "'", '«', '»', '“', '”', '‘', '’', '‹', '›',

  // Тире, дефисы, многоточие
  '-', '–', '—', '―', '…',

  // Разделители и символы
  '/', '\\', '|', '_', '*', '#', '@', '&', '%', '$', '€', '£', '¥', '+', '=', '~', '^', '`',

  // Точки и запятые разных форм
  '·', '•', '‚', '٫', '٬', '⁄', '·',

  // Юникод-символы, которые могут встречаться
  '©', '®', '™', '°'
];
const articles = [
  // 🇫🇷 French
  'le', 'la', 'les', 'l’', 'un', 'une', 'des', 'du', 'de la', 'de l’',

  // 🇪🇸 Spanish
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'al', 'del',

  // 🇩🇪 German
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einen', 'einem', 'eines', 'einer',

  // 🇬🇧 English
  'the', 'a', 'an'
];

const splitTextWithArticles = computed(() => {
  const text = textsStore.currentText?.content || '';

  // Разбиваем текст на слова и знаки препинания
  const tokens = text.match(/[^\s\w\d]|[\p{L}\p{M}’'-]+/gu);

  const result = [];
  let i = 0;

  while (i < tokens.length) {
    const word = tokens[i];
    const next = tokens[i + 1];

    if (
      articles.includes(word.toLowerCase()) &&
      next &&
      !punctuation.includes(next)
    ) {
      result.push(`${word} ${next}`);
      i += 2;
    } else {
      result.push(word);
      i += 1;
    }
  }

  return result
})

const canSubmit = computed(() => {
  return textsStore.currentText.questions.length > 0 &&
         userAnswers.value.some(answer => answer && answer.trim())
})

// Watch for route param changes
watch(() => route.params.id, (id) => {
  if (id) {

    const payload = {
      language_learning: route.query.language_learning,
      language_native: route.query.language_native,
      level: route.query.level
    };

    textsStore.getTextById(id, payload)
  }
}, { immediate: true })



async function checkAnswers() {
  if (!canSubmit.value || checking.value) return
  checking.value = true
  try {
    store.setUserAnswers(userAnswers.value)
    const results = await gptService.checkAnswers(
        textsStore.currentText.questions.value,
      userAnswers.value,
      userStore.user.language_learning,
      userStore.user.language_native,
        textsStore.currentText?.text || ''
    )

    router.push('/result')
  } catch (error) {
    console.error('Error checking answers:', error)
  } finally {
    checking.value = false
  }
}

// Remove popup logic, add panel state
const panel = reactive({
  visible: false,
  word: '',
  translation: '',
  loading: false,
  added: false
})

function openWordPanel(word) {
  if (punctuation.includes(word)) return
  panel.word = word
  panel.translation = ''
  panel.loading = false
  panel.added = addedWords.value.has(word)
  panel.visible = true
}
function closeWordPanel() {
  panel.visible = false
}

// Translate with AI
async function translateWord(word) {
  panel.loading = true
  panel.translation = ''
  try {
    // Pass the current text as context
    const result = await gptService.translateWord(
      word,
      store.targetLanguage,
      store.nativeLanguage,
      currentText.value?.text || ''
    )
    panel.translation = result.translation || result || ''
  } catch (e) {
    panel.translation = $t('textSession.translationError')
  } finally {
    panel.loading = false
  }
}

// Add to flashcards (All Words folder)
async function addToFlashcards(word, translation) {
  if (!authStore.user) return
  try {
    await SavedWordsService.saveWordFromText(authStore.user.id, word, translation, store.targetLanguage, store.nativeLanguage)
    addedWords.value.add(word)
    panel.added = true
  } catch (e) {
    // Optionally show error
  }
}

// On mount, fetch already added words for this text/language
onMounted(async () => {
  if (!authStore.user) return
  try {
    const saved = await SavedWordsService.getUserSavedWords(authStore.user.id, store.targetLanguage)
    saved.forEach(item => addedWords.value.add(item.word))
  } catch (e) {}
})
</script>

<style scoped>
.text-session-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.language-info {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.language-badge, .level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.text-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.text-section {
  position: relative;
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.section-header {
  margin-bottom: 15px;
}

.text-pronunciation-btn {
  position: absolute;
  right: 40px;
  top: 20px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: #718096;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.text-pronunciation-btn:disabled {
  color: #a8a8a8;
  cursor: not-allowed;
  opacity: 0.6;
}

.text-content {
  position: relative;
  line-height: 1.8;
  font-size: 1.1rem;
  color: #2d3748;
  text-align: justify;
}

.text-content span {
  display: inline-block;
  line-height: 1.2;
}

.text-content span.word:not(:first-child) {
  margin-left: 4px;
}


.paragraph {
  margin-right: 6px;
  line-height: 1.2;
  display: inline-block;
}

.paragraph:last-child {
  margin-bottom: 0;
}

.highlighted-word {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
}

.highlighted-word::after {
  content: '🔍';
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.highlighted-word:hover::after {
  opacity: 1;
}

.highlighted-word.active,
.highlighted-word:hover {
  background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.12);
  z-index: 2;
  position: relative;
}

.dictionary-section {
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #48bb78;
}

.dictionary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.dictionary-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.dictionary-item:hover {
  border-color: #48bb78;
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.1);
}

.dictionary-item.active {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  background: #f0f4ff;
  z-index: 2;
  position: relative;
  border-color: #667eea;
}

.word {
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 400;
  transition: background 0.2s;
  padding: 0 1px;
}
.word:active, .word.selected {
  background: #e2e8f0;
}
.word:hover {
  background: #e2e8f0;
}
.punct {
  color: #2d3748;
}

.dictionary-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.action-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: #718096;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  color: #a8a8a8;
  cursor: not-allowed;
  opacity: 0.6;
}

.quizlet-btn {
  color: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
}

.quizlet-btn:disabled {
  color: #ffb3b3;
  transform: none;
}

.pronunciation-btn {
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
}

.pronunciation-btn:disabled {
  color: #b3e5e1;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: linear-gradient(90deg, #38b2ac 0%, #48bb78 100%);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.7em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

}
.save-btn:active {
  transform: scale(0.97);
}
.save-btn.saved {
  background: #e2e8f0;
}

.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(.4,2,.3,1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
.fade-scale-enter-to, .fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
@media (max-width: 600px) {
  .save-btn {
    font-size: 0.95rem;
    padding: 7px 12px;
    min-width: 32px;
    min-height: 32px;
  }
}

.questions-section {
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  border-left: 4px solid #ed8936;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.question-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.answer-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #667eea;
}

.check-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.check-button:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.check-button.disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-text {
  text-align: center;
  padding: 60px 20px;
}

.no-text h2 {
  color: #2d3748;
  margin-bottom: 15px;
}

.no-text p {
  color: #718096;
  margin-bottom: 25px;
}

.back-button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .text-session-page {
    padding: 0;
  }

  .language-info {
    margin-bottom: 0;
    gap: 4px;
  }

  .container {
    padding: 20px;
    margin: 10px 0;
  }

  .text-title {
    font-size: 1.5rem;
  }

  .dictionary-grid {
    grid-template-columns: 1fr;
  }

  .text-content {
    font-size: 1rem;
  }
}
.word-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-top: 2px solid #667eea;
  box-shadow: 0 -2px 16px rgba(102, 126, 234, 0.13);
  padding: 22px 18px 18px 18px;
  z-index: 2000;
  font-size: 1.08rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: slideUp 0.22s cubic-bezier(.4,2,.3,1);
}
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.panel-close {
  position: absolute;
  right: 18px;
  top: 12px;
  background: none;
  border: none;
  font-size: 1.7em;
  color: #667eea;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.panel-word {
  font-weight: 700;
  font-size: 1.15em;
  margin-bottom: 8px;
  color: #2d3748;
}
.panel-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 6px;
}
.panel-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}
.panel-loading {
  color: #667eea;
  font-weight: 600;
  font-size: 1.1em;
}
.panel-translation {
  color: #2d3748;
  font-size: 1.1em;
  margin-bottom: 6px;
  text-align: center;
}
@media (max-width: 600px) {
  .word-panel {
    font-size: 0.98rem;
    padding: 16px 6px 12px 6px;
  }
  .panel-btn {
    font-size: 0.98rem;
    padding: 7px 10px;
  }
}
</style>
