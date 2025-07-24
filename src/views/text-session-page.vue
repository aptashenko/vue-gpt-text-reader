<template>
  <div class="text-session">
    <div class="text-header">
      <BackButton text="Back to texts" small />
      <div class="text-meta">
        <span class="badge lang">{{ textsStore.currentText?.language.toUpperCase() }}</span>
        <span class="badge level">{{ textsStore.currentText?.level }}</span>
      </div>
    </div>

    <h1 class="text-title">{{ textsStore.currentText?.title }}</h1>

    <div v-if="textsStore.textLoader" class="text-loading">
      <div class="loader" />
      <p>Loading text...</p>
    </div>

    <div v-else-if="textsStore.currentText" class="text-content">
      <div class="reading-area" ref="textContentRef">
        <span
            v-for="(word, idx) in splitTextWithArticles"
            :key="idx"
            :class="{ word: !punctuation.includes(word) }"
            @click="!punctuation.includes(word) && openWordPanel(word)"
        >
          {{ word }}
        </span>
      </div>

      <div v-if="panel.visible" class="word-panel">
        <button class="close-btn" @click="closeWordPanel">×</button>
        <div class="panel-word">{{ panel.word }}</div>

        <div v-if="!panel.translation && !panel.loading">
          <button class="panel-action" @click="translateWord(panel.word)">
            Translate with AI
          </button>
        </div>

        <div v-else-if="panel.loading">
          <div class="panel-loading">Translating...</div>
        </div>

        <div v-else>
          <div class="panel-translation">{{ panel.translation }}</div>
        </div>
      </div>

      <div class="coming-soon-banner">
        🚧 More features coming soon
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from '../components/BackButton.vue'
import {useUserStore} from "../stores/user.store.js";
import {useTextsStore} from "../stores/texts.store.js";
import {useWordsStore} from "../stores/words.store.js";
import {useI18n} from "vue-i18n";

const route = useRoute()
const userStore = useUserStore();
const textsStore = useTextsStore();
const wordsStore = useWordsStore();
const { t } = useI18n();

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
  'le', 'la', 'les', 'l’', 'un', 'une', 'des', 'du', 'de la', 'de l’', 'se', 'me',

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
  const tokens = text.match(/[\p{L}\p{N}’'-]+|[.,!?;:()]/gu);

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
    const splittedText = textsStore.currentText.content.split('.')
    const sentenceContext = splittedText.find(sentence => sentence.includes(word))
    // Pass the current text as context
    const result = await wordsStore.translateWord(
        sentenceContext || '',
        word,
      textsStore.currentText.language,
      userStore.user.language
    )
    panel.translation = result.translation || result || ''
  } catch (e) {
    panel.translation = t('textSession.translationError')
  } finally {
    panel.loading = false
  }
}

</script>

<style scoped>
.text-session {
  padding: 30px 16px;
  max-width: 850px;
  margin: auto;
}

.text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-meta {
  display: flex;
  gap: 8px;
}

.badge {
  background: #667eea;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.text-title {
  margin: 20px 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2d3748;
}

.text-loading {
  text-align: center;
  margin-top: 60px;
}

.loader {
  width: 36px;
  height: 36px;
  border: 4px solid #ddd;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.reading-area {
  display: flex;
  flex-wrap: wrap;
  line-height: 2;
  font-size: 1.1rem;
  text-align: left;
  overflow-wrap: break-word;
}

.reading-area .word {
  cursor: pointer;
  padding: 0 2px;
  border-radius: 4px;
}

.reading-area .word:hover {
  background-color: #e2e8f0;
}

.word-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 2px solid #667eea;
  padding: 20px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 16px;
  font-size: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: #667eea;
}

.panel-word {
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 12px;
}

.panel-action {
  background: #667eea;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-top: 12px;
}

.panel-action:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.panel-translation {
  font-size: 1.1rem;
  color: #2d3748;
  margin-top: 10px;
}

.coming-soon-banner {
  margin-top: 40px;
  padding: 12px;
  background-color: #fef3c7;
  border: 1px dashed #facc15;
  border-radius: 8px;
  text-align: center;
  color: #92400e;
  font-weight: 500;
}

@media (max-width: 480px) {
  .reading-area {
    font-size: 15px;
  }
}
</style>
