import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { textImportService } from '../services/textImport'
import { getTextCount } from '../services/texts'
import { supabase } from '../supabase'
import { UserPreferencesService } from '../services/userPreferences'
import { setLocale } from '../i18n'

export const useLanguageLearningStore = defineStore('languageLearning', () => {
  // User preferences
  const targetLanguage = ref('')
  const nativeLanguage = ref('')
  const level = ref('')
  
  // Current session
  const currentText = ref(null)
  const userAnswers = ref([])
  const sessionResults = ref(null)
  const loading = ref(false)
  
  // Text count state
  const textCount = ref(0)
  const textCountLoading = ref(false)
  
  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'Français', nativeName: 'Français' },
    { code: 'uk', name: 'Українська', nativeName: 'Українська' },
    { code: 'ru', name: 'Русский', nativeName: 'Русский' },
    { code: 'es', name: 'Español', nativeName: 'Español' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
  ]
  
  // Available levels
  const availableLevels = [
    { code: 'A1', nameKey: 'levels.A1', descriptionKey: 'levelDescriptions.A1' },
    { code: 'A2', nameKey: 'levels.A2', descriptionKey: 'levelDescriptions.A2' },
    { code: 'B1', nameKey: 'levels.B1', descriptionKey: 'levelDescriptions.B1' },
    { code: 'B2', nameKey: 'levels.B2', descriptionKey: 'levelDescriptions.B2' },
    { code: 'C1', nameKey: 'levels.C1', descriptionKey: 'levelDescriptions.C1' },
    { code: 'C2', nameKey: 'levels.C2', descriptionKey: 'levelDescriptions.C2' }
  ]
  
  // Load preferences from localStorage on store initialization
  function loadStoredPreferences() {
    try {
      const stored = localStorage.getItem('languageLearningPreferences')
      
      if (stored) {
        const preferences = JSON.parse(stored)
        
        targetLanguage.value = preferences.targetLanguage || ''
        nativeLanguage.value = preferences.nativeLanguage || ''
        level.value = preferences.level || ''

      } else {
        console.log('loadStoredPreferences - No stored preferences found')
      }
    } catch (error) {
      console.error('Error loading stored preferences:', error)
    }
  }
  
  // Save preferences to localStorage
  function savePreferencesToStorage() {
    try {
      const preferences = {
        targetLanguage: targetLanguage.value,
        nativeLanguage: nativeLanguage.value,
        level: level.value
      }
      localStorage.setItem('languageLearningPreferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving preferences to storage:', error)
    }
  }
  
  // Load preferences on store creation
  loadStoredPreferences()
  
  // Computed properties
  const isSetupComplete = computed(() => {
    return targetLanguage.value && nativeLanguage.value && level.value
  })
  
  const currentTextWords = computed(() => {
    return currentText.value?.words || []
  })
  
  const currentTextQuestions = computed(() => {
    return currentText.value?.questions || []
  })
  
  // Actions
  function setUserPreferences(target, native, userLevel) {
    targetLanguage.value = target
    nativeLanguage.value = native
    level.value = userLevel

    savePreferencesToStorage()
    // Update i18n locale when native language changes
    setLocale(native)
    
    // Also save to database if user is authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        UserPreferencesService.setNativeLanguage(user.id, native).catch(error => {
          console.error('Error saving native language to database:', error)
        })
      }
    }).catch(error => {
      console.error('Error getting current user:', error)
    })
  }
  
  // Load user preferences from database (for authenticated users)
  async function loadUserPreferencesFromDB(userId) {
    try {
      // Only load from database if we don't already have a native language set
      if (!nativeLanguage.value) {
        const preferences = await UserPreferencesService.getUserPreferences(userId)
        if (preferences.native_language) {
          nativeLanguage.value = preferences.native_language
          savePreferencesToStorage()
        }
      } else {
        console.log('Skipping database load - nativeLanguage already set to:', nativeLanguage.value)
      }
    } catch (error) {
      console.error('Error loading user preferences from DB:', error)
    }
  }
  
  async function fetchTextCount() {
    if (!targetLanguage.value || !level.value) {
      textCount.value = 0
      return
    }
    textCountLoading.value = true
    try {
      textCount.value = await getTextCount(targetLanguage.value, level.value)
    } catch (e) {
      textCount.value = 0
    } finally {
      textCountLoading.value = false
    }
  }
  
  async function loadRandomText() {
    loading.value = true
    try {
      // Fetch all matching texts from Supabase
      const { data: textsData, error: textsError } = await supabase
        .from('texts')
        .select('*')
        .eq('language', targetLanguage.value)
        .eq('level', level.value)
      
      if (textsError || !textsData || textsData.length === 0) {
        currentText.value = null
        loading.value = false
        return
      }
      
      // Pick a random text from the results
      const randomIndex = Math.floor(Math.random() * textsData.length)
      const selectedText = textsData[randomIndex]
      
      // Fetch questions for this text
      const { data: questionsData, error: questionsError } = await supabase
        .from('text_questions')
        .select('*')
        .eq('text_id', selectedText.id)
        .order('question_number')
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError)
      }
      
      // Fetch words for this text (from text_words table)
      const { data: textWordsData, error: textWordsError } = await supabase
        .from('text_words')
        .select(`
          word_order,
          dictionary (
            id,
            word,
            translation_en,
            translation_fr,
            translation_es,
            translation_de,
            translation_uk,
            translation_ru,
            part_of_speech,
            difficulty
          )
        `)
        .eq('text_id', selectedText.id)
        .order('word_order')
      
      if (textWordsError) {
        console.error('Error fetching text words:', textWordsError)
      }
      
      // Transform words data to match expected structure
      const transformedWords = (textWordsData || [])
        .filter(item => item.dictionary) // Filter out any null dictionary entries
        .map(item => ({
          word: item.dictionary.word,
          translations: {
            en: item.dictionary.translation_en,
            fr: item.dictionary.translation_fr,
            es: item.dictionary.translation_es,
            de: item.dictionary.translation_de,
            uk: item.dictionary.translation_uk,
            ru: item.dictionary.translation_ru
          },
          part_of_speech: item.dictionary.part_of_speech,
          difficulty: item.dictionary.difficulty
        }))
      
      // Normalize to match expected structure
      currentText.value = {
        ...selectedText,
        text: selectedText.content || selectedText.text,
        words: transformedWords,
        questions: questionsData ? questionsData.map(q => q.question_text) : []
      }
      
      userAnswers.value = []
      sessionResults.value = null
    } catch (error) {
      console.error('Error loading random text:', error)
      currentText.value = null
    } finally {
      loading.value = false
    }
  }
  
  function setUserAnswers(answers) {
    userAnswers.value = answers
  }
  
  function setSessionResults(results) {
    sessionResults.value = results
  }
  
  function resetSession() {
    currentText.value = null
    userAnswers.value = []
    sessionResults.value = null
  }
  
  function getLanguageName(code) {
    const lang = availableLanguages.find(l => l.code === code)
    return lang ? lang.name : code
  }
  
  function getLevelName(code) {
    const level = availableLevels.find(l => l.code === code)
    return level ? level.name : code
  }
  
  // Text import methods
  async function importTextsFromFile(file) {
    return await textImportService.importFromFile(file)
  }
  
  async function importTextsFromJSON(jsonString) {
    return await textImportService.importFromJSON(jsonString)
  }
  
  function getTextStatistics() {
    return textImportService.getStatistics()
  }
  
  function getAvailableLanguagesFromTexts() {
    return textImportService.getAvailableLanguages()
  }
  
  function getAvailableLevelsFromTexts() {
    return textImportService.getAvailableLevels()
  }
  
  async function clearImportedTexts() {
    return await textImportService.clearFromDatabase()
  }

  // Function to get translated level data
  function getTranslatedLevels(i18n) {
    return availableLevels.map(level => ({
      code: level.code,
      name: i18n.t(level.nameKey),
      description: i18n.t(level.descriptionKey)
    }))
  }

  watch(nativeLanguage, (newVal) => {
    console.log('nativeLanguage changed to:', newVal)
  })
  
  return {
    // State
    targetLanguage,
    nativeLanguage,
    level,
    currentText,
    userAnswers,
    sessionResults,
    loading,
    textCount,
    textCountLoading,
    
    // Constants
    availableLanguages,
    availableLevels,
    
    // Computed
    isSetupComplete,
    currentTextWords,
    currentTextQuestions,
    
    // Actions
    setUserPreferences,
    loadUserPreferencesFromDB,
    fetchTextCount,
    loadRandomText,
    setUserAnswers,
    setSessionResults,
    resetSession,
    getLanguageName,
    getLevelName,
    
    // Text import methods
    importTextsFromFile,
    importTextsFromJSON,
    getTextStatistics,
    getAvailableLanguagesFromTexts,
    getAvailableLevelsFromTexts,
    clearImportedTexts,
    getTranslatedLevels
  }
}) 