<template>
  <div class="reader-container" v-if="text">
    <h2>{{ text.title }}</h2>

    <div class="text-content">
      <span
        v-for="(word, idx) in words"
        :key="idx"
        class="word"
        :class="{ selected: selectedWord === word }"
        @click="showTranslation(word)"
      >
        {{ word }}
      </span>
    </div>

    <div v-if="selectedWord" class="dictionary">
      <div class="word-info">
        <strong>{{ selectedWord }}</strong>
        <span v-if="wordData" class="part-of-speech">({{ wordData.part_of_speech }})</span>
        <span v-if="wordData" class="difficulty">[{{ wordData.difficulty }}]</span>
      </div>

      <div class="translation">{{ translation }}</div>

      <div v-if="!wordData" class="no-translation">
        <p>Translation not found. Would you like to add one?</p>
        <button @click="addTranslation" class="add-translation-btn">Add Translation</button>
      </div>
    </div>

    <div class="questions">
      <h3>Questions</h3>
      <div v-for="(q, i) in questions" :key="i">
        <p>{{ q }}</p>
        <input v-model="answers[i]" type="text" :placeholder="`Answer ${i + 1}`" />
      </div>
      <button @click="submitAnswers" :disabled="loading">Submit Answers</button>

      <div v-if="feedback" class="feedback">
        <h4>Score: {{ feedback.score }}</h4>
        <p>{{ feedback.comment }}</p>
      </div>
    </div>
  </div>

  <div v-else>Loading...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase.js'
import { DictionaryService } from '../services/dictionary.js'
// import { OpenAI } from 'openai'

// const openai = new OpenAI({ 
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY, 
//   dangerouslyAllowBrowser: true 
// })

const route = useRoute()
const text = ref(null)
const words = ref([])
const selectedWord = ref('')
const translation = ref('')
const wordData = ref(null)
const questions = ref([])
const answers = ref(['', ''])
const feedback = ref(null)
const loading = ref(false)

const fetchText = async () => {
  const { data, error } = await supabase.from('texts').select('*').eq('id', route.params.id).single()
  if (!error && data) {
    text.value = data
    words.value = data.content.split(' ')
    questions.value = [data.question1, data.question2]
  }
}
onMounted(fetchText)

const showTranslation = async (word) => {
  selectedWord.value = word
  translation.value = 'Loading...'
  wordData.value = null

  try {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase()
    const dictionaryEntry = await DictionaryService.getTranslation(cleanWord)

    if (dictionaryEntry) {
      wordData.value = dictionaryEntry
      translation.value = dictionaryEntry.translation
    } else {
      translation.value = `Translation not found for "${word}"`
    }
  } catch (error) {
    console.error('Error fetching translation:', error)
    translation.value = 'Error loading translation'
  }
}

const addTranslation = () => {
  alert(`To add a translation for "${selectedWord.value}", use the dictionary admin interface.`)
}

const submitAnswers = async () => {
  loading.value = true
  feedback.value = null

  feedback.value = {
    score: '3/5',
    comment: 'This is placeholder feedback. Connect OpenAI for automatic scoring.'
  }

  // const prompt = `Text: ${text.value.content}\nQuestions: ${questions.value.join(
  //   '\n'
  // )}\nAnswers: ${answers.value.join('\n')}`

  // try {
  //   const completion = await openai.chat.completions.create({
  //     model: 'gpt-4',
  //     messages: [{ role: 'user', content: prompt }]
  //   })
  //   const result = completion.choices[0].message.content
  //   const match = result.match(/score\s*[:\-]?\s*(\d+)/i)
  //   feedback.value = {
  //     score: match ? match[1] : 'N/A',
  //     comment: result
  //   }
  // } catch (e) {
  //   feedback.value = { score: 'N/A', comment: 'Error: ' + e.message }
  // }

  loading.value = false
}
</script>

<style scoped>
.reader-container {
  max-width: 720px;
  margin: 40px auto;
  padding: 2rem;
  background: #fffaf6;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: #3b3b3b;
}

h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #5a4a42;
}

.text-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
  line-height: 1.7;
}

.word {
  cursor: pointer;
  padding: 6px 10px;
  background-color: #f5ebe0;
  border-radius: 10px;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.word:hover {
  background-color: #e8d8c3;
}
.word.selected {
  background-color: #d8a48f;
  color: white;
}

.dictionary {
  padding: 1rem;
  background: #fff3e6;
  border-left: 6px solid #d8a48f;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.word-info strong {
  font-size: 1.3rem;
  color: #a0522d;
}
.part-of-speech,
.difficulty {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #6e6259;
}
.difficulty {
  background-color: #ffe9d6;
  padding: 2px 6px;
  border-radius: 6px;
}

.translation {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: #4d3a33;
}

.no-translation p {
  margin: 0.5rem 0;
  color: #7a6a5f;
}

.add-translation-btn {
  background-color: #d8a48f;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.add-translation-btn:hover {
  background-color: #c08975;
}

.questions {
  border-top: 1px solid #e6ddd6;
  padding-top: 2rem;
}
.questions h3 {
  color: #5f4c43;
  margin-bottom: 1rem;
}

.questions p {
  margin: 0.5rem 0;
  color: #4d3a33;
}

.questions input[type="text"] {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  font-size: 1rem;
  margin-bottom: 1.2rem;
  background: #fffaf6;
  color: #3b3b3b;
}

.questions button {
  padding: 0.6rem 1.2rem;
  background-color: #98c9a3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}
.questions button:hover {
  background-color: #82b28d;
}
.questions button:disabled {
  background-color: #c7c7c7;
  cursor: not-allowed;
}

.feedback {
  margin-top: 1.5rem;
  background-color: #f0f0ea;
  border-radius: 12px;
  padding: 1rem;
}
.feedback h4 {
  margin: 0;
  color: #5a4a42;
}
.feedback p {
  margin-top: 0.5rem;
  color: #4e433f;
}
</style>
