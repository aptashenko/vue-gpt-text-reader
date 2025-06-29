<template>
  <div class="reader-container" v-if="text">
    <div class="reader-header">
      <BackButton text="Back to Texts" small />
      <h2>{{ text.title }}</h2>
    </div>

    <!-- Text content with inline translations -->
    <div class="text-content">
      <div v-for="(word, idx) in processedWords" :key="idx" class="word-container">
        <span class="word">{{ word.original }}</span>
        <span v-if="word.translation" class="translation-tooltip">
          {{ word.translation }}
        </span>
      </div>
    </div>

    <!-- Dictionary section -->
    <div v-if="textDictionary.length > 0" class="vocabulary-section">
      <h3>{{ $t('textReader.vocabulary') }}</h3>
      <div class="vocabulary-list">
        <div v-for="entry in textDictionary" :key="entry.id" class="vocabulary-item">
          <div class="word-info">
            <strong>{{ entry.word }}</strong>
            <span class="part-of-speech">({{ entry.part_of_speech }})</span>
            <span class="difficulty">[{{ entry.difficulty }}]</span>
          </div>
          <div class="translation">{{ entry.translation }}</div>
        </div>
      </div>
    </div>

    <!-- Questions section -->
    <div class="questions-section">
      <h3>{{ $t('textReader.comprehensionQuestions') }}</h3>
      <div v-for="(question, i) in questions" :key="i" class="question-item">
        <p class="question-text">{{ question }}</p>
        <input 
          v-model="answers[i]" 
          type="text" 
          :placeholder="`Your answer to question ${i + 1}`" 
          class="answer-input"
        />
      </div>
      <button @click="submitAnswers" :disabled="loading" class="submit-btn">
        {{ loading ? 'Evaluating...' : 'Submit Answers' }}
      </button>

      <div v-if="feedback" class="feedback">
        <h4>Score: {{ feedback.score }}</h4>
        <div class="feedback-content">
          <div v-if="feedback.detailedFeedback" class="detailed-feedback">
            <h5>Detailed Feedback:</h5>
            <div class="feedback-text" v-html="formatFeedback(feedback.detailedFeedback)"></div>
          </div>
          <div v-else class="simple-feedback">
            <p>{{ feedback.comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading">Loading text...</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase.js'
import { UserPreferencesService } from '../services/userPreferences.js'
import { useAuthStore } from '../stores/auth.js'
import { OpenAI } from 'openai'
import BackButton from './BackButton.vue'

const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true 
})

const route = useRoute()
const authStore = useAuthStore()
const text = ref(null)
const textDictionary = ref([])
const questions = ref([])
const answers = ref(['', ''])
const feedback = ref(null)
const loading = ref(false)
const userNativeLanguage = ref('en')

// Fetch text with all related data
const fetchTextWithData = async () => {
  loading.value = true
  try {
    // 1. Fetch the text
    const { data: textData, error: textError } = await supabase
      .from('texts')
      .select('*')
      .eq('id', route.params.id)
      .single()
    
    if (textError) throw textError
    text.value = textData
    
    // 2. Extract questions
    questions.value = [textData.question1, textData.question2].filter(q => q)
    
    // 3. Fetch dictionary entries for this text
    // Fetch ALL dictionary entries for this language, not just the ones in the text
    const { data: dictData, error: dictError } = await supabase
      .from('dictionary')
      .select('*')
      .eq('language', textData.language)
      .order('word', { ascending: true })
    
    if (!dictError && dictData) {
      // Map translations to user's native language
      textDictionary.value = dictData.map(entry => ({
        ...entry,
        translation: getTranslationForLanguage(entry, userNativeLanguage.value)
      }))
      
      console.log(`📚 Loaded ${dictData.length} dictionary words for ${textData.language}`)
      console.log('📋 Dictionary words:', dictData.map(w => w.word))
    } else if (dictError) {
      console.error('❌ Error fetching dictionary:', dictError)
    }
    
  } catch (error) {
    console.error('Error fetching text data:', error)
  } finally {
    loading.value = false
  }
}

// Get translation for user's native language
const getTranslationForLanguage = (entry, nativeLang) => {
  const translations = {
    en: entry.translation_en,
    fr: entry.translation_fr,
    es: entry.translation_es,
    de: entry.translation_de,
    uk: entry.translation_uk
  }
  return translations[nativeLang] || entry.translation_en || entry.word
}

// Process words to show translations inline
const processedWords = computed(() => {
  if (!text.value) return []
  
  const words = text.value.content.split(' ')
  const dictMap = new Map()
  
  textDictionary.value.forEach(entry => {
    dictMap.set(entry.word.toLowerCase(), entry)
  })
  
  return words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase()
    const dictEntry = dictMap.get(cleanWord)
    
    return {
      original: word,
      translation: dictEntry ? getTranslationForLanguage(dictEntry, userNativeLanguage.value) : null,
      partOfSpeech: dictEntry?.part_of_speech,
      difficulty: dictEntry?.difficulty
    }
  })
})

const loadUserPreferences = async () => {
  try {
    const user = authStore.user
    if (user) {
      const preferences = await UserPreferencesService.getUserPreferences(user.id)
      userNativeLanguage.value = preferences.native_language
    }
  } catch (error) {
    console.error('Error loading user preferences:', error)
  }
}

onMounted(async () => {
  await loadUserPreferences()
  await fetchTextWithData()
})

const submitAnswers = async () => {
  loading.value = true
  feedback.value = null

  try {
    // Create a comprehensive prompt for ChatGPT
    const prompt = `You are an expert language teacher evaluating a student's comprehension of a text. 

TEXT: "${text.value.content}"

QUESTIONS AND STUDENT ANSWERS:
${questions.value.map((q, i) => `Question ${i + 1}: ${q}
Student Answer: ${answers.value[i] || '(no answer provided)'}`).join('\n\n')}

INSTRUCTIONS:
1. Evaluate each answer for:
   - Content accuracy (does it correctly answer the question?)
   - Grammar correctness (are there any grammatical errors?)
   - Phrase structure (is the sentence well-formed?)
   - Vocabulary usage (are words used correctly?)

2. For each answer, provide:
   - A score from 0-100 (0 = completely wrong, 100 = perfect)
   - Specific feedback on what was correct
   - Corrections for any grammar, spelling, or phrase mistakes
   - A corrected version of the answer if there were mistakes
   - Suggestions for improvement

3. Format your response as:
   ANSWER 1:
   Score: [0-100]
   Feedback: [detailed feedback]
   Corrections: [list of specific mistakes]
   Corrected Answer: [improved version]
   
   ANSWER 2:
   Score: [0-100]
   Feedback: [detailed feedback]
   Corrections: [list of specific mistakes]
   Corrected Answer: [improved version]
   
   OVERALL ASSESSMENT:
   [brief summary of performance]

Be encouraging but honest. Focus on helping the student improve their language skills.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
    
    const result = completion.choices[0].message.content
    
    // Parse the response to extract scores and feedback
    const scoreMatches = result.match(/Score:\s*(\d+)/gi)
    const scores = scoreMatches ? scoreMatches.map(match => parseInt(match.match(/\d+/)[0])) : []
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    
    feedback.value = {
      score: `${averageScore}/100`,
      comment: result,
      detailedFeedback: result
    }
  } catch (e) {
    feedback.value = { 
      score: 'Error', 
      comment: 'Error evaluating answers: ' + e.message,
      detailedFeedback: 'Unable to process answers due to an error.'
    }
  }

  loading.value = false
}

const formatFeedback = (feedback) => {
  // Format the feedback text for better display
  return feedback
    .replace(/\n\n/g, '</p><p>') // Convert double line breaks to paragraphs
    .replace(/\n/g, '<br>') // Convert single line breaks to <br>
    .replace(/^(.*?)$/m, '<p>$1</p>') // Wrap in paragraphs
    .replace(/<p><\/p>/g, '') // Remove empty paragraphs
    .replace(/ANSWER (\d+):/g, '<h6>Answer $1:</h6>') // Format answer headers
    .replace(/Score:/g, '<strong>Score:</strong>') // Bold score labels
    .replace(/Feedback:/g, '<strong>Feedback:</strong>') // Bold feedback labels
    .replace(/Corrections:/g, '<strong>Corrections:</strong>') // Bold correction labels
    .replace(/Corrected Answer:/g, '<strong>Corrected Answer:</strong>') // Bold corrected answer labels
    .replace(/OVERALL ASSESSMENT:/g, '<h6>Overall Assessment:</h6>') // Format overall assessment header
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
  margin-bottom: 2rem;
  line-height: 1.7;
  gap: 4px;
}

.word-container {
  position: relative;
  display: inline-block;
  cursor: default;
  padding: 2px 4px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.word-container:hover {
  background-color: #e8d8c3;
}

.word {
  color: #3b3b3b;
}

.translation-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #5a4a42;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  margin-bottom: 4px;
}

.translation-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #5a4a42;
}

.word-container:hover .translation-tooltip {
  opacity: 1;
  visibility: visible;
}

.vocabulary-section {
  padding: 1.5rem;
  background: #fff3e6;
  border-left: 6px solid #d8a48f;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.vocabulary-section h3 {
  margin: 0 0 1rem 0;
  color: #5a4a42;
  font-size: 1.3rem;
}

.vocabulary-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.vocabulary-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e6ddd6;
  transition: box-shadow 0.3s ease;
}

.vocabulary-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.word-info strong {
  font-size: 1.1rem;
  color: #a0522d;
}

.part-of-speech,
.difficulty {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  color: #6e6259;
}

.difficulty {
  background-color: #ffe9d6;
  padding: 2px 6px;
  border-radius: 4px;
}

.translation {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #4d3a33;
  font-weight: 500;
}

.questions-section {
  border-top: 1px solid #e6ddd6;
  padding-top: 2rem;
}

.questions-section h3 {
  color: #5f4c43;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.question-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #faf8f5;
  border-radius: 8px;
  border: 1px solid #e6ddd6;
}

.question-text {
  margin: 0 0 0.75rem 0;
  color: #4d3a33;
  font-weight: 500;
  font-size: 1rem;
}

.answer-input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #d8cfc7;
  font-size: 1rem;
  background: #fffaf6;
  color: #3b3b3b;
  transition: border-color 0.3s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #d8a48f;
  box-shadow: 0 0 0 2px rgba(216, 164, 143, 0.2);
}

.submit-btn {
  padding: 0.8rem 1.5rem;
  background-color: #98c9a3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #82b28d;
}

.submit-btn:disabled {
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
.feedback-content {
  margin-top: 0.5rem;
}
.detailed-feedback {
  margin-bottom: 1rem;
}
.detailed-feedback h5 {
  margin: 0;
  color: #5a4a42;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.detailed-feedback h6 {
  margin: 0.5rem 0 0.25rem 0;
  color: #5a4a42;
  font-size: 0.95rem;
  font-weight: 600;
}
.feedback-text {
  color: #4e433f;
  line-height: 1.5;
}
.feedback-text p {
  margin: 0.5rem 0;
}
.feedback-text strong {
  color: #5a4a42;
  font-weight: 600;
}
.simple-feedback {
  color: #4e433f;
}
.simple-feedback p {
  margin: 0.5rem 0;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6e6259;
  font-size: 1.1rem;
}
</style>
